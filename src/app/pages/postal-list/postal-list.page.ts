import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-postal-list',
  templateUrl: './postal-list.page.html',
  styleUrls: ['./postal-list.page.scss'],
})
export class PostalListPage implements OnInit {
  private _className = 'PostalListPage';

  // input to this page
  pageInput: any = {};

  // result list
  dataResultList: any = [];

  // Current signed in users email address
  usersEmail: string;

  dataResultCount = 0;

  // text message
  deletePostalCodeMessage: string = '';

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router,
    public translateService: TranslateService
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    // language fallback
    translateService.setDefaultLang('en');

    // load text strings
    this.translateService.get('POSTAL_CONFIRM_DELETE').subscribe((value) => {
      this.deletePostalCodeMessage = value;
    });

  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.pageInput.postalCode = params['postalCode'];
      this.pageInput.city = params['city'];
      this.pageInput.id = params['id'];
      this.pageInput.provinceABBR = params['provinceABBR'];
      this.pageInput.minLatitude = params['minLatitude'];
      this.pageInput.maxLatitude = params['maxLatitude'];
      this.pageInput.minLongitude = params['minLongitude'];
      this.pageInput.maxLongitude = params['maxLongitude'];
      this.pageInput.pageSize = params['pageSize'];
      this.pageInput.pageNumber = 1;
      this.logger.entry(
        this._className,
        'ngOnInit this.pageInput.id:' + this.pageInput.id
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._loadPageResults();
  }

  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.pageInput.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._loadPageResults();
  }

  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageInput.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._loadPageResults();
  }

  /**
   * A action invoked from a button to delete a postal code
   * @param code The postal code
   */
  async deleteCode(id, code) {
    this.pageHelper.showAlertOptionDialog(this.deletePostalCodeMessage, code).then(x => {
      if (x == 'ok') {
        this._deletePostalCode(id);
      }
    });
  }

  /**
   * Calls the delete API to remove the code from the system
   * @param id The postal code unique id
   */
  private async _deletePostalCode(id) {
    this.logger.entry(this._className, '_deletePostalCode');
    await this.pageHelper.showSaver();

    this.venueProvider.deletePostalCode(id).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.removeCodeFromList(id);
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * @param id removes a postal code from the result list without reloading
   */
  private removeCodeFromList(id) {
    for (var i = 0; i < this.dataResultList.length; i++) {
      if (this.dataResultList[i].id === id) {
        this.dataResultList.splice(i, 1);
      }
    }
  }

  /**
   * This method loads results
   **/
  private async _loadPageResults() {
    this.logger.entry(this._className, '_loadPageResults');
    await this.pageHelper.showLoader();

    this.venueProvider.getSearchPostalCode(this.pageInput).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null && resp.dataList != null) {
          this.dataResultList = resp.dataList;
          this.pageInput.pageNumber = resp.page;
          this.pageInput.pageSize = resp.pageSize;
          this.dataResultCount = resp.dataResultCount;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._loadPageResults();
        });
      }
    );
  }

}
