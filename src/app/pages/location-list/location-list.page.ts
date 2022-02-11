import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.page.html',
  styleUrls: ['./location-list.page.scss'],
})
export class LocationListPage implements OnInit {
  private _className = 'LocationListPage';

  // input to this page
  location =
    {
      "id": null,
      "active": '',
      "hidden": '',
      "description": null,
      "searchString": null,
      "minUpdatedDate": null,
      "maxUpdatedDate": null,
      "city": null,
      "province": null,
      "distance": null,
      "postalCode": null,
      "pageSize": 50,
      "pageNumber": 1
    };


  // result list
  locations: any = [];

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
      this.location.active = params['active'];
      this.location.hidden = params['hidden'];
      this.location.searchString = params['searchString'];
      this.location.id = params['id'];
      this.location.minUpdatedDate = params['minUpdatedDate'];
      this.location.maxUpdatedDate = params['maxUpdatedDate'];
      this.location.pageSize = params['pageSize'];
      this.location.city = params['city'];
      this.location.distance = params['distance'];
      this.location.postalCode = params['postalCode'];
      this.location.province = params['province'];
      this.logger.entry(
        this._className,
        'ngOnInit this.location.id:' + this.location.id
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._loadLocations();
  }

  /**
  * Navigate to the previous result set page
  */
  async previousPage() {
    this.location.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._loadLocations();
  }

  /**
    * Navigate to the next result set page
    */
  async nextPage() {
    this.location.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._loadLocations();
  }

  /**
   * This method loads results
   **/
  async _loadLocations() {
    this.logger.entry(this._className, '_loadLocations');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getSearchLocationFuzy(this.location).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null && resp.dataList != null) {
          this.locations = resp.dataList;
          this.location.pageNumber = resp.page;
          this.location.pageSize = resp.pageSize;
          this.dataResultCount = resp.dataResultCount;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._loadLocations();
        });
      }
    );
  }

}
