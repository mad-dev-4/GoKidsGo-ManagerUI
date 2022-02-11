import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { User } from '../../../providers/user';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  private _className = 'HomePage';

  // Current signed in users email address
  usersEmail: string;

  // storage for top categories
  topCategories;
  noCategories = true;

  // data object 
  workflowStats = [];

  constructor(
    public venueProvider: Venue,
    public userProvider: User,
    public cache: LTCache,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router) {

    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

  } // end constructor


  // recently viewed
  recentlyViewedArray: any;

  ngOnInit() {
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, "ionViewWillEnter");
    this.loadWorkflowStats();
    this.recentlyViewedArray = this.cache.getRecentViews();
  }

  /**
   * A button that clears recently viewed entities
   */
  clearRecentlyViewed(eventClick) {
    this.cache.clearRecentViews();
    this.recentlyViewedArray = [];
  }


  /**
   * Load the workflow card data
   */
  async loadWorkflowStats() {
    this.logger.entry(this._className, "loadWorkflowStats");

    await this.pageHelper.showLoader();

    // Load categories
    this.venueProvider.getWorkflowStats().subscribe((resp) => {
      this.workflowStats = resp;
      this.pageHelper.hideLoader();
      this.logger.trace(this._className, "loadWorkflowStats");

    }, (err) => {
      this.logger.trace(this._className, "loadWorkflowStats", "err:" + err);
      this.pageHelper.processRequestError(err).subscribe((resp) => {
        this.loadWorkflowStats();
      });
    });
  }

  /**
   * Logs the user out of system
   */
  async userLogout() {
    this.logger.entry(this._className, "userLogout");
    this.userProvider.logout();
    window.location.href = environment.loginUrl;
  }


}
