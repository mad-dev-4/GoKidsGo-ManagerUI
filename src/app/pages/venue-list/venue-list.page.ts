import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-venue-list',
  templateUrl: './venue-list.page.html',
  styleUrls: ['./venue-list.page.scss'],
})
export class VenueListPage implements OnInit {
  private _className = 'VenueListPage';

  // form data object
  venue: any;

  // venue list
  venues: any;

  // Current signed in users email address
  usersEmail: string;

  constructor(
    public navCtrl: NavController,
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    this.venue = {
      id: '',
      locationId: '',
      description: '',
      categoryId: '',
      active: '',
      hidden: '',
      name: '',
      title: '',
      tags: '',
      pageSize: '50',
      pageNumber: 1,
      dataResultCount: 0
    };
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.venue.id = params['VenueId'];
      this.venue.locationId = params['LocationId'];
      this.venue.categoryId = params['CategoryId'];
      this.venue.description = params['Description'];
      this.venue.title = params['Title'];
      this.venue.name = params['Name'];
      this.venue.active = params['Active'];
      this.venue.hidden = params['Hidden'];
      this.venue.pageSize = params['ResultsPerPage'];
      this.venue.tags = params['Tags'];
      this.venue.pageNumber = 1;
      this.logger.entry(
        this._className,
        'ngOnInit this.venue.id:' + this.venue.id
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._searchVenue();
  }

  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.venue.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._searchVenue();
  }

  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.venue.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._searchVenue();
  }

  /**
   * This method loads venues
   **/
  async _searchVenue() {
    this.logger.entry(this._className, '_searchVenue');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getSearchVenue(this.venue, false, false, true).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null && resp.dataList != null) {
          this.venues = resp.dataList;
          this.venue.dataResultCount = resp.dataResultCount;
          this.venue.pageSize = resp.pageSize;
          this.logger.trace(this._className, 'this.venues.dataResultCount', this.venues.dataResultCount);
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._searchVenue();
        });
      }
    );
  }

}
