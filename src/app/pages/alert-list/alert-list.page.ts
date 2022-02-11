import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-alert-list',
  templateUrl: './alert-list.page.html',
  styleUrls: ['./alert-list.page.scss'],
})
export class AlertListPage implements OnInit {
  private _className = 'AlertListPage';

  // input to this page
  pageInput: any = {};

  // result list
  dataResultList: any = [];

  // Current signed in users email address
  usersEmail: string;

  dataResultCount = 0;

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.pageInput.entityType = params['entityType'];
      this.pageInput.userIdentifier = params['userIdentifier'];
      this.pageInput.id = params['id'];
      this.pageInput.minUpdatedDate = params['minUpdatedDate'];
      this.pageInput.maxUpdatedDate = params['maxUpdatedDate'];
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
   * Navigates to a previous results page
   */
  async previousPage() {
    this.pageInput.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._loadPageResults();
  }

  /**
   * Navigates to the next results page
   */
  async nextPage() {
    this.pageInput.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._loadPageResults();
  }

  /**
   * This method loads results
   **/
  async _loadPageResults() {
    this.logger.entry(this._className, '_loadPageResults');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getSearchAudit(this.pageInput).subscribe(
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
