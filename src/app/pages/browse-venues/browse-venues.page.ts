import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-browse-venues',
  templateUrl: './browse-venues.page.html',
  styleUrls: ['./browse-venues.page.scss'],
})
export class BrowseVenuesPage implements OnInit {
  private _className = 'BrowseVenuesPage';

  // Current signed in users email address
  usersEmail: string;

  // result list of venues and tags
  venueResults = [];

  // search object
  venue: any = {
    hidden: false,
    active: true,
    pageSize: '25',
    pageNumber: 1,
    locationId: '',
  };

  // postal code filter
  postalCode:string = null;
  postalCodeDistance:number = 5.0;
  postalSegmentValue:string = '';
  latitude:string = null;
  longitude:string = null;

  dataResultCount: number = 0;

  // List of the system categories
  categories: Array<any> = [];

  // the category being selected
  category: any = {};

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public loadingCtrl: LoadingController,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  } // end constructor

  ngOnInit() { }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this.searchVenues();
  }

  /**
   * Gets venues
   * @param append if ture, the reuslts are appended
   */
  async searchVenues(append = false) {
    this.logger.entry(this._className, 'searchVenues');
    await this.pageHelper.showLoader();

    this.venueProvider.getSearchVenue(this.venue, false, true, true, true).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        if (resp != null && resp.dataList != null) {
          if (append) {
            this.venueResults = this.venueResults.concat(resp.dataList);
          } else {
            this.venueResults = resp.dataList;
          }
          this.dataResultCount = resp.dataResultCount;
          this.venue.page = resp.page;
          this.venue.pageSize = resp.pageSize;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this.searchVenues();
        });
      }
    );
  }

  /**
   * Is a callback from the tree component.  Will call this method when a category is clicked.
   * @param categoryRelObj 
   */
  async categoryClicked(obj) {
    this.logger.entry(this._className, 'selectCategory', obj);
    var categoryRelObj = obj.categoryRelObj ? obj.categoryRelObj : obj;
    this.venue.categoryId = categoryRelObj.category.id;
    this.category = categoryRelObj.category;
    this.venue.pageNumber = 0;
    this.searchVenues();
  }

  /**
   * Clears the category filter.  Is a button action from the UI
   */
  async clearCategory() {
    this.logger.entry(this._className, 'clearCategory');
    this.category = {};
    this.venue.categoryId = null;
    this.venue.pageNumber = 0;
    this.searchVenues();
  }

  /**
   * loads more results
   */
  async moreButton() {
    this.venue.pageNumber++;
    this.searchVenues(true);
  }


  /**
   * Called when the postal code segment selection changes
   * @param ev 
   */
  postalFilterSegmentChanged(ev: any) {
    this.logger.entry(this._className, 'postalFilterSegmentChanged',ev.detail.value);
    this.postalSegmentValue = ev.detail.value;
    if (this.postalSegmentValue == '') {
      this.clearPostalCode();
    }
  }

  /**
   * applies a postal code filter to the search
   */
  async applyPostalCode() {
    this.logger.entry(this._className, 'applyPostalCode');
    this.venue.pageNumber = 0;
    this.venue.distance = this.postalCodeDistance;

    if (this.postalSegmentValue == 'l') {
      this.venue.latitude = this.latitude;
      this.venue.longitude = this.longitude;
      this.venue.postalCode = null;
    }else if (this.postalSegmentValue == 'p') {
      this.venue.postalCode = this.postalCode;
      this.venue.latitude = null;
      this.venue.longitude = null;
    }
    this.searchVenues();
  }

  /**
   * Button to clear the filter chip
   */
  async clearPostalCode() {
    this.logger.entry(this._className, 'clearPostalCode');
    this.venue.pageNumber = 0;
    this.venue.distance = null;
    this.venue.postalCode = null;
    this.venue.latitude = null;
    this.venue.longitude = null;
    this.searchVenues();
  }
}
