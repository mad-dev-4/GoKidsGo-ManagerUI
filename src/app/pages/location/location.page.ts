import { Component, OnInit, ViewChild } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  private _className = 'LocationPage';

  @ViewChild('input') myInput;

  // form data object
  location: any = {
    identifier: '',
    locationId: '',
    country: 'CA',
    description: [
      {
        title: '',
        lang: 'en',
        name: '',
        description: '',
        webSiteURL: '',
      },
    ],
  };

  // param of location guid passed to page
  locationId: any;

  // Current signed in users email address
  usersEmail: string;

  // true if the form changed
  isReadyToSave: boolean;

  // open workflows
  workflows: Array<any> = [];

  // current and future schedules
  scheduleGroups: Array<any> = [];

  public fieldsNotFilledOutMessage: string;

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
    this.translateService
      .get('LOCATION_FIELDS_NOT_FILLED')
      .subscribe((value) => {
        this.fieldsNotFilledOutMessage = value;
      });
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.params.subscribe((params) => {
      this.locationId = params['id'];
      this.logger.entry(
        this._className,
        'ngOnInit this.locationId:' + this.locationId
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');

    // check if this page is about adding to a new venue
    if (this.locationId == 0) {
      this.location = {
        identifier: '',
        country: 'CA',
        description: [
          {
            title: '',
            name: '',
            lang: 'en'
          },
        ],
      };
    } else {
      this._getLocation().then((o) => {
        this.isReadyToSave = false;
        this._getWorkflows();
      });
    }
  }


  /**
   * @param imageId removes a image from a location
   */
  private removeImageFromLocation(imageId) {
    if (this.location.images != null) {
      for (var i = 0; i < this.location.images.length; i++) {
        if (this.location.images[i].id === imageId) {
          this.location.images.splice(i, 1);
        }
      }
    }
  }


  /**
   * This method loads the location
   **/
  async _getLocation() {
    this.logger.entry(this._className, '_getLocation');
    await this.pageHelper.showLoader();

    this.venueProvider.getLocationById(this.locationId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null) {
          this.location = resp;
          if (resp.description == null) {
            this.location.description = [
              {
                title: '',
                name: '',
                lang: 'en',
                description: '',
                webSiteURL: '',
              },
            ];
          }
          this.cache.addRecentView(
            this.location.description[0].name,
            this.location.id,
            'Location',
            '/location'
          );
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getLocation();
        });
      }
    );
  } // end get location

  /**
   * Loads the workflow for the location
   */
  async _getWorkflows() {
    this.logger.entry(this._className, '_getWorkflows');
    //await this.pageHelper.showLoader();

    this.venueProvider
      .getWorkflowSearchOpenOrCLosed(null, this.locationId, true, 1, 10)
      .subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          if (resp != null) {
            this.workflows = resp.dataList;
          }
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => {
            this._getWorkflows();
          });
        }
      );
  }


  /**
   * Button action. opens a url to google maps
   */
  async openGoogle() {
    this.logger.entry(this._className, 'openGoogle');
    var url = 'https://www.google.com/maps/@' + this.location.latitude + ','+this.location.longitude+',15z';
    this.logger.trace(this._className, 'opening new window at', url);
    window.open(url);
  }

  /**
   * Browses to venues in the location
   */
  async viewLocationVenues() {
    this.router.navigate(
      ['/venue-list'],
      { queryParams: { LocationId: this.locationId } }
    );
  }

  /**
   * Button to create a venue at the current location
   */
  async createVenueHere() {
    this.router.navigate(
      ['/venue/0'],
      { queryParams: { newFromLocationId: this.locationId } }
    );
  }
  
  /**
   * Called when data on the form changes
   */
  async dataChanged() {
    this.logger.entry(this._className, 'dataChanged');
    this.isReadyToSave = true;
  }

  async saveLocationDetails() {
    this.logger.entry(this._className, 'saveLocationDetails');

    if (
      this.location.identifier == '' ||
      this.location.address1 == '' ||
      this.location.postalCode == '' ||
      this.location.city == '' ||
      this.location.description[0].description == '' ||
      this.location.country == '' ||
      this.location.description[0].name == '' ||
      this.location.description[0].title == ''
    ) {
      this.pageHelper.showAlertDialog(this.fieldsNotFilledOutMessage);
      return;
    }

    await this.pageHelper.showSaver();
    if (this.locationId != 0) {
      this.logger.trace(this._className, 'Saving id' + this.locationId);
      this.venueProvider.saveLocationDetails(this.location).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
        },
        (err) => {
          this.pageHelper
            .processRequestError(err, null)
            .subscribe((resp) => { });
        }
      );
    } else {
      this.logger.trace(this._className, 'Creating');
      this.venueProvider.createLocation(this.location).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
          if (resp != null) {
            this.location = resp;
            this.locationId = resp.id;
            this._getWorkflows();
          }
        },
        (err) => {
          this.pageHelper
            .processRequestError(err, null)
            .subscribe((resp) => { });
        }
      );
    }
  }

  /**
   * Navigates to the image management screen if this location is not *new*
   */
  goToImageManagement() {
    this.logger.entry(this._className, 'goToImageManagement():' + this.locationId);
    if (this.locationId != 0) {
      this.router.navigate(
        ['/image-management'],
        { queryParams: { locationId: this.locationId } }
      );
    }
  }
}
