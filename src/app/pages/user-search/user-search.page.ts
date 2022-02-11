import { Component, OnInit } from '@angular/core';
import { User } from '../../../providers/user';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-user-search',
  templateUrl: './user-search.page.html',
  styleUrls: ['./user-search.page.scss'],
})
export class UserSearchPage implements OnInit {
  private _className = 'UserSearchPage';

  // form data object (tag)
  formObj: any = {};

  // Current signed in users email address
  usersEmail: string;

  // list of supported identity providers
  ipds: Array<any> = [];

  constructor(
    public userProvider: User,
    public cache: LTCache,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router,
    public translateService: TranslateService
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    // this object mimics the search API input
    this.formObj = {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      idp: '',
      active: '',
      minLastSeenDate: '',
      pageSize: '50',
    };

    // language fallback
    translateService.setDefaultLang('en');
  } // end constructor

  ngOnInit() {}

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._loadProviders();
  }

  /**
   * Navigates to the  list page
   */
  goToSearchResultPage() {
    this.logger.entry(this._className, 'goToSearchResultPage');
    this.router.navigate(['user-list'], {
      queryParams: this.formObj,
    });
  }

  /**
   * This method loads supported IDPs
   **/
  async _loadProviders() {
    this.logger.entry(this._className, '_loadTags');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.userProvider.getIDPs().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.ipds = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._loadProviders();
        });
      }
    );
  }
}
