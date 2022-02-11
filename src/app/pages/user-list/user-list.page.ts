import { Component, OnInit } from '@angular/core';
import { User } from '../../../providers/user';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.scss'],
})
export class UserListPage implements OnInit {
  private _className = 'UserListPage';

  // input to this page
  pageInput: any = {};

  // result list
  dataResultList: any = [];

  // Current signed in users email address
  usersEmail: string;

  dataResultCount = 0;


  constructor(
    public userProvider: User,
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
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.pageInput.id = params['id'];
      this.pageInput.firstName = params['firstName'];
      this.pageInput.lastName = params['lastName'];
      this.pageInput.email = params['email'];
      this.pageInput.idp = params['idp'];
      this.pageInput.active = params['active'];
      this.pageInput.minLastSeenDate = params['minLastSeenDate'];
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
 * This method loads results
 **/
  private async _loadPageResults() {
    this.logger.entry(this._className, '_loadPageResults');
    await this.pageHelper.showLoader();

    this.userProvider.getSearchUser(this.pageInput).subscribe(
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

