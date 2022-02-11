import { Component, OnInit, ViewChild } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-location-search',
  templateUrl: './location-search.page.html',
  styleUrls: ['./location-search.page.scss'],
})
export class LocationSearchPage implements OnInit {

  private _className = "LocationSearchPage";

  // form data object
  formObj: any = {};

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

    this.formObj = 
    {
      "id": null,
      "active": '',
      "hidden": '',
      "description": null,
      "searchString": null,
      "minUpdatedDate": null,
      "maxUpdatedDate": null,
      "city":null,
      "province":null,
      "distance":null,
      "postalCode":null,
      "pageSize": "50",
      "pageNumber": 1
    };
  }

  ngOnInit() {} 

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
  }

  /**
   *  Navigates to the  list page
   */
   goToSearchResultPage() {
    this.logger.entry(this._className, 'goToSearchResultPage');
    this.router.navigate(['location-list'], {
      queryParams: this.formObj,
    });
  }

   /**
   * On button click, takes the user to a new location page
   */
     createNewLocation(eventValue) {
      this.router.navigate(['location/0'], {});
    }
}
