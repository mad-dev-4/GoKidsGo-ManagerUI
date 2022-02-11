import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-venue-search',
  templateUrl: './venue-search.page.html',
  styleUrls: ['./venue-search.page.scss'],
})
export class VenueSearchPage implements OnInit {
  private _className = 'VenueSearchPage';

  @ViewChild('input') myInput;

  // Search data group
  searchVenueForm: FormGroup;

  // form data object
  venue: any;

  // drop down for tags
  tags: any;

  // Current signed in users email address
  usersEmail: string;

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public formBuilder: FormBuilder,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    this.venue = {
      VenueId: '',
      LocationId: '',
      Description: '',
      Active: '',
      Hidden: '',
      ResultsPerPage: '50',
      Name: '',
      Title: '',
      Tags: '',
      PageNumber: 1,
    };

    // Add form validators
    this.searchVenueForm = formBuilder.group({
      VenueId: ['', null],
      LocationId: ['', null],
      Description: ['', null],
      Title: ['', null],
      Name: ['', null],
      Active: ['', null],
      Hidden: ['', null],
      ResultsPerPage: ['', null],
      Tags: ['', null],
    });
  } // end constructor

  ngOnInit() {}

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._loadTags();
  }

  /**
   * Submit button on form to submit search
   * @param value 
   */
  searchVenue(value: string): void {
    this.logger.entry(this._className, 'searchVenue');

    if (!this.searchVenueForm.valid) {
      return;
    }
    this.logger.trace(this._className,'searchVenue', 'this.venue.LocationId:' + this.venue.LocationId)
    this.logger.trace(this._className,'searchVenue', 'this.venue.LocationId:' + this.venue.VenueId);

    this.router.navigate(['venue-list'], {
      queryParams: {
        VenueId: this.venue.VenueId,
        LocationId: this.venue.LocationId,
        Description: this.venue.Description,
        Title: this.venue.Title,
        Name: this.venue.Name,
        Active: this.venue.Active,
        Hidden: this.venue.Hidden,
        ResultsPerPage: this.venue.ResultsPerPage,
        Tags: this.venue.Tags,
        PageNumber: this.venue.PageNumber,
      },
    });
  }


  /**
   * On button click, takes the user to a new venue page
   */
  createNewVenue(eventValue) {
    this.router.navigate(['venue/0'], {});
  }

  /**
   * This method loads the first 100 tags in the system
   **/
  async _loadTags() {
    this.logger.entry(this._className, '_loadTags');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getTags().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        // Watch the form for changes, and
        if (resp != null && resp.dataList != null) {
          this.tags = resp.dataList;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._loadTags();
        });
      }
    );
  }
}
