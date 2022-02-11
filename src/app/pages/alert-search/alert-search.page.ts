import { Component, OnInit, ViewChild } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-alert-search',
  templateUrl: './alert-search.page.html',
  styleUrls: ['./alert-search.page.scss'],
})
export class AlertSearchPage implements OnInit {
  private _className = 'AlertSearchPage';

  @ViewChild('input') myInput;

  // form data object
  audit: any = {};

  // drop down for tags
  entityTypes = [];

  // Current signed in users email address
  usersEmail: string;

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    this.audit = {
      entityType: '',
      userIdentifier: '',
      id: '',
      minUpdatedDate: '',
      maxUpdatedDate: '',
      pageSize: '50',
      pageNumber: 1,
    };
  }

  ngOnInit() {}

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._loadEntityTypes();
  }

  /**
   * This method loads entity types
   **/
  async _loadEntityTypes() {
    this.logger.entry(this._className, '_loadEntityTypes');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getAuditEntityTypes().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.entityTypes = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._loadEntityTypes();
        });
      }
    );
  }

  /**
   * Navigates to the alert-list page
   */
  searchAudit(): void {
    this.logger.entry(this._className, 'searchAudit');
    this.router.navigate(['alert-list'], {
      queryParams: this.audit,
    });
  }
}
