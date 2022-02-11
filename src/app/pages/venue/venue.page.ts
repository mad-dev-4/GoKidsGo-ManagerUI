import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

// Pages
import { FindLocationModalPage } from '../find-location-modal/find-location-modal.page';
import { FindTagModalPage } from '../find-tag-modal/find-tag-modal.page';
import { FindSeasonalTagModalPage } from '../find-seasonal-tag-modal/find-seasonal-tag-modal.page';
import { FindAmenityModalPage } from '../find-amenity-modal/find-amenity-modal.page';
import { FindCategoryModalPage } from '../find-category-modal/find-category-modal.page';
import { NewAmenityModalPage } from '../new-amenity-modal/new-amenity-modal.page';
import { NewTagModalPage } from '../new-tag-modal/new-tag-modal.page';
import { NewWorkflowModalPage } from '../new-workflow-modal/new-workflow-modal.page';

@Component({
  selector: 'app-venue',
  templateUrl: './venue.page.html',
  styleUrls: ['./venue.page.scss'],
})
export class VenuePage implements OnInit {
  private _className = "VenuePage";

  // Venue form
  //venueForm: FormGroup;

  // form data object
  venue: any = {
    identifier: "",
    locationId: "",
    description: [{
      title: "",
      name: ""
    }]
  };

  // param of venue guid passed to page
  venueId: any;

  // Current signed in users email address
  usersEmail: string;

  // true if the form changed
  isReadyToSave: boolean;

  // open workflows
  workflows: Array<any> = [];

  // categories the venue belongs to
  categories: Array<any> = [];

  // current and future schedules. and tags
  scheduleGroups: Array<any> = [];
  seasonalTags: Array<any> = [];

  public fieldsNotFilledOutMessage: string;
  public fieldsNotSavedMessage: string;
  public fieldsNotSavedTitleMessage: string;

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
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
    this.translateService.get('VENUE_FIELDS_NOT_FILLED').subscribe((value) => {
      this.fieldsNotFilledOutMessage = value;
    });
    this.translateService.get('VENUE_FIELDS_NOT_SAVED').subscribe((value) => {
      this.fieldsNotSavedTitleMessage = value;
    });
    this.translateService.get('VENUE_FIELDS_NOT_SAVED_CONTINUE').subscribe((value) => {
      this.fieldsNotSavedMessage = value;
    });


  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.params.subscribe((params) => {
      this.venueId = params['id'];
      this.logger.trace(this._className, 'ngOnInit this.VenueId', this.venueId);
    });

    this.route.queryParams.subscribe((params) => {
      let locationId = params['newFromLocationId'];
      this.logger.trace(this._className, 'ngOnInit newFromLocationId', locationId);
      if (locationId != null) {
        this.createfromLocation(locationId);
      }
    });
  }

  /**
   * This method loads the location and creates a venue by copying location details
   **/
  async createfromLocation(locationId) {
    this.logger.entry(this._className, 'createfromLocation');
    await this.pageHelper.showLoader();

    this.venueProvider.getLocationById(locationId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null) {
          this.dataChanged();
          this.venue.identifier = resp.identifier;
          this.venue.locationId = resp.id;
          this.venue.location = resp;
          if (resp.description != null) {
            this.venue.description = [
              {
                title: resp.description[0].title,
                name: resp.description[0].name,
                lang: 'en',
                description: resp.description[0].description,
                webSiteURL: resp.description[0].webSiteURL,
              },
            ];
          }
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  } // end get location

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');

    // check if this page is about adding to a new venue
    if (this.venueId == 0) {
      this.venue = {
        identifier: "",
        description: [{
          title: "",
          name: "",
          lang: "en"
        }]
      };
    } else {
      this._getVenue().then(o => {
        this.isReadyToSave = false;
        this._getWorkflows();
        this._getSchedules();
        this._getCategories();
      });
    }

  }

  /**
   * A button that navigates to the selected location
   */
  async gotoLocation() {
    this.logger.entry(this._className, 'gotoLocation');

    if (this.isReadyToSave) {
      this.pageHelper.showAlertOptionDialog(this.fieldsNotSavedTitleMessage, this.fieldsNotSavedMessage).then(x => {
        if (x == 'ok') {
          this.router.navigate(['location', this.venue.locationId], {});
        }
      });
    } else {
      this.router.navigate(['location', this.venue.locationId], {});
    }

  }

  /**
   * Saves the current venue details
   */
  async saveVenue() {
    this.logger.entry(this._className, 'saveVenue');

    var venueDetails = {
      "id": this.venue.id,
      "identifier": this.venue.identifier,
      "locationId": this.venue.locationId,
      "hidden": this.venue.hidden,
      "description": [{
        "description": this.venue.description[0].description,
        "name": this.venue.description[0].name,
        "title": this.venue.description[0].title,
        "lang": "en",
        "webSiteURL": this.venue.description[0].webSiteURL
      }]
    };

    if (this.venue.identifier == '' || this.venue.locationId == '' ||
      this.venue.description[0].name == '' || this.venue.description[0].title == '') {
      this.pageHelper.showAlertDialog(this.fieldsNotFilledOutMessage);
      return;
    }

    await this.pageHelper.showSaver();
    if (this.venueId != 0) {
      this.logger.trace(this._className, 'Saving: ' + venueDetails);
      this.venueProvider.saveVenueDetails(venueDetails).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
        },
        (err) => {
          this.pageHelper.processRequestError(err, null).subscribe((resp) => { });
        }
      );
    } else {
      this.logger.trace(this._className, 'Creating: ' + venueDetails);
      this.venueProvider.createVenue(venueDetails).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
          if (resp != null) {
            this.venue = resp;
            this.venueId = resp.id;
            this._getWorkflows();
          }
        },
        (err) => {
          this.pageHelper.processRequestError(err, null).subscribe((resp) => { });
        }
      );
    }
  }

  dataChanged() {
    this.logger.entry(this._className, 'dataChanged');
    this.isReadyToSave = true;
  }




  /**
   * This method loads venues
   **/
  async _getVenue() {
    this.logger.entry(this._className, '_getVenue');
    await this.pageHelper.showLoader();

    this.venueProvider.getVenueById(this.venueId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        if (resp != null) {
          this.venue = resp;
          this.cache.addRecentView(this.venue.description[0].name, this.venue.id, "Venue", "/venue");
        }

      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getVenue();
        });
      }
    );
  }// end get venue


  /**
   * Loads the workflow for the venue
   */
  async _getWorkflows() {
    this.logger.entry(this._className, '_getWorkflows');
    //await this.pageHelper.showLoader();

    this.venueProvider.getWorkflowSearchOpenOrCLosed(this.venueId, null, true, 1, 10).subscribe(
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
   * Loads all associated categories for a venue
   */
  async _getCategories() {
    this.logger.entry(this._className, '_getCategories');
    //await this.pageHelper.showLoader();

    this.venueProvider.getCategoriesVenueById(this.venueId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.categories = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getCategories();
        });
      }
    );
  }

  /**
   * Loads the group schedules for a venue
   */
  async _getSchedules() {
    this.logger.entry(this._className, '_getSchedules');
    //await this.pageHelper.showLoader();

    this.venueProvider.getSchedulesVenueById(this.venueId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null) {
          this.scheduleGroups = resp;
          for (var w = 0; w < this.scheduleGroups.length; w++) {

            this.scheduleGroups[w].startDateFormatted =
              this.pageHelper.formatDateOnly(this.scheduleGroups[w].startDate);
            this.scheduleGroups[w].endDateFormatted =
              this.pageHelper.formatDateOnly(this.scheduleGroups[w].endDate);
          }
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getSchedules();
        });
      }
    );
  }



  /**
   * Loads seasonal tags for a venue
   */
  async _getSeasonalTags() {
    this.logger.entry(this._className, '_getSeasonalTags');
    this.venueProvider.getSeasonalTagsVenueById(this.venueId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.seasonalTags = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getSeasonalTags();
        });
      }
    );
  }

  /**
   * Shows the Create New Workflow dialog and if a work task is created, this method adds 
   * it to the Venue screen
   * @param event 
   */
  async presentNewWorkflowModal(event) {
    this.logger.entry(this._className, 'presentNewWorkflowModal', this.venueId);

    const modal = await this.modalCtrl.create({
      component: NewWorkflowModalPage,
      componentProps: { venueId: this.venueId, errorMessageKey: "??", isModal: true },
      animated: true,
      swipeToClose: true,
      breakpoints: [0.1, 0.5, 1],
      initialBreakpoint: 0.9
    });
    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentNewWorkflowModal - dismiss');
      if (x.data.createdElement != null) {
        this.workflows.push(x.data.createdElement);
      }
    });
    await modal.present();
  }


  /**
   * Opens the seasonal  modal
   * @param event 
   */
  async presentSeasonalTagSearchModal(event) {
    this.logger.entry(this._className, 'presentSeasonalTagSearchModal');

    const modal = await this.modalCtrl.create({
      component: FindSeasonalTagModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
      animated: true,
      swipeToClose: true,
      breakpoints: [0.1, 0.5, 1],
      initialBreakpoint: 1.0
    });
    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentSeasonalTagSearchModal - dismiss');

      var tagIdsToAssociate = [];
      // on close of modal, add tags if any were selected
      if (x != null && x.data != null && x.data.selectedTags != null) {
        if (this.venue.seasonalTags == null) {
          this.venue.seasonalTags = [];
        }
        for (var prop in x.data.selectedTags) {
          if (!this._isSeasonalTagSelected(x.data.selectedTags[prop].id)) {
            this.venue.seasonalTags.push(x.data.selectedTags[prop]);
            tagIdsToAssociate.push(x.data.selectedTags[prop].id);
          }
        }

        if (tagIdsToAssociate.length > 0) {
          this.associateAndSaveTags(tagIdsToAssociate);
        }
      }
    });
    await modal.present();
  }

  /**
   * Opens the search modal
   * @param event 
   */
  async presentTagSearchModal(event) {
    this.logger.entry(this._className, 'presentTagSearchModal');

    const modal = await this.modalCtrl.create({
      component: FindTagModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
      animated: true,
      swipeToClose: true,
      breakpoints: [0.1, 0.5, 1],
      initialBreakpoint: 1.0
    });
    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentTagSearchModal - dismiss');

      var tagIdsToAssociate = [];
      // on close of modal, add tags if any were selected
      if (x != null && x.data != null && x.data.selectedTags != null) {
        if (this.venue.tags == null) {
          this.venue.tags = [];
        }
        for (var prop in x.data.selectedTags) {
          if (!this._isTagSelected(x.data.selectedTags[prop].id)) {
            this.venue.tags.push(x.data.selectedTags[prop]);
            tagIdsToAssociate.push(x.data.selectedTags[prop].id);
          }
        }

        if (tagIdsToAssociate.length > 0) {
          this.associateAndSaveTags(tagIdsToAssociate);
        }
      }
    });
    await modal.present();
  }

  /**
   * A button click event showing the Find Category modal
   * @param event 
   */
  async presentFindCategoryModal(event) {
    this.logger.entry(this._className, 'presentFindCategoryModal');

    const modal = await this.modalCtrl.create({
      component: FindCategoryModalPage,
      componentProps: { locationId: this.venueId, errorMessageKey: "??", isModal: true },
      animated: true,
      swipeToClose: true,
      breakpoints: [0.1, 0.5, 1],
      initialBreakpoint: 1.0
    });
    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentFindCategoryModal - dismiss');

      if (x != null && x.data != null && x.data.selectedCategories != null) {
        var z = x.data.selectedCategories;
        for (var prop in z) {
          const found = this.categories.find(element => element.fromCategory.id == z[prop].id);
          if (!found) {
            this.logger.trace(this._className, 'presentFindCategoryModal - adding category', z[prop].id);
            this.associateVenueToCategories(z[prop].id, 0, z[prop].name);
          }
        }
      }
    });
    await modal.present();
  }

  /**
   * @param tagId 
   * @returns true if the tagId is already found associated to the venue
   */
  _isTagSelected(tagId) {
    for (var i = 0; i < this.venue.tags.length; i++) {
      if (this.venue.tags[i].id === tagId) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param amenityId 
   * @returns true if the amenityId is already found associated to the venue
   */
  _isAmenitySelected(amenityId) {
    for (var i = 0; i < this.venue.amenities.length; i++) {
      if (this.venue.amenities[i].id === amenityId) {
        return true;
      }
    }
    return false;
  }

  /**
 * @param tagId 
 * @returns true if the seasonal tag is already found associated to the venue
 */
  _isSeasonalTagSelected(tagId) {
    for (var i = 0; i < this.venue.seasonalTags.length; i++) {
      if (this.venue.seasonalTags[i].id === tagId) {
        return true;
      }
    }
    return false;
  }


  /**
   * @param imageId removes a image from a venue
   */
  private removeImageFromVenue(imageId) {
    for (var i = 0; i < this.venue.images.length; i++) {
      if (this.venue.images[i].id === imageId) {
        this.venue.images.splice(i, 1);
      }
    }
  }

  /**
   * Opens the search modal
   * @param event 
   */
  async presentLocationSearchModal(event) {
    this.logger.entry(this._className, 'presentLocationSearchModal');

    const modal = await this.modalCtrl.create({
      component: FindLocationModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
    });
    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentLocationSearchModal - dismiss');

      if (x != null && x.data != null && x.data.location != null) {
        this.venue.locationId = x.data.location.id;
        this.venue.location = x.data.location;
        this.dataChanged();
      }
    });
    await modal.present();
  }

  /**
   * Opens the amenities search modal
   * @param event 
   */
  async presentAmenitiesSearchModal(event) {
    this.logger.entry(this._className, 'presentAmenitiesSearchModal');

    const modal = await this.modalCtrl.create({
      component: FindAmenityModalPage,
      componentProps: { locationId: this.venue.locationId, errorMessageKey: "??", isModal: true },
    });

    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentAmenitiesSearchModal - dismiss');

      var tagIdsToAssociate = [];
      // on close of modal, add tags if any were selected
      if (x != null && x.data != null && x.data.selectedTags != null) {
        if (this.venue.amenities == null) {
          this.venue.amenities = [];
        }
        for (var prop in x.data.selectedTags) {
          if (!this._isAmenitySelected(x.data.selectedTags[prop].id)) {
            this.venue.amenities.push(x.data.selectedTags[prop]);
            tagIdsToAssociate.push(x.data.selectedTags[prop].id);
          }
        }

        if (tagIdsToAssociate.length > 0) {
          this.associateAndSaveTags(tagIdsToAssociate);
        }
      }

    });

    await modal.present();
  }

  /**
   * Opens the amenities Create New modal
   * @param event 
   */
  async presentAmenitiesCreateModal(event) {
    this.logger.entry(this._className, 'presentAmenitiesCreateModal');

    const modal = await this.modalCtrl.create({
      component: NewAmenityModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
    });

    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentAmenitiesCreateModal - dismiss');
      if (x.data.createdElement != null) {
        x.data.createdElement.venueId = this.venueId;
        this.createTagAssociation(x.data.createdElement, true);
      }
    });

    await modal.present();
  }

  /**
   * Opens the tag Create New modal
   * @param event 
   */
  async presentTagCreateModal(event) {
    this.logger.entry(this._className, 'presentTagCreateModal');

    const modal = await this.modalCtrl.create({
      component: NewTagModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
    });

    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentTagCreateModal - dismiss');
      if (x.data.createdElement != null) {
        x.data.createdElement.venueId = this.venueId;
        this.createTagAssociation(x.data.createdElement, false);
      }
    });

    await modal.present();
  }

  /**
   * @param tasToSave array of tag IDs to associate to a venue
   */
  async associateAndSaveTags(tagIdsToSave) {
    this.logger.entry(this._className, 'associateAndSaveTags');
    await this.pageHelper.showSaver();

    this.venueProvider.associateTagsToVenue(this.venueId, tagIdsToSave).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * @param tagId a single tagId to remove as an assoication
   * @param tagType is either HASHTAG or SEASONAL
   */
  async removeTagFromVenue(tagId, tagType = "HASHTAG") {
    this.logger.entry(this._className, 'removeTagFromVenue');
    await this.pageHelper.showSaver();

    var array = [tagId];
    this.venueProvider.dissassociateTagsToVenue(this.venueId, array).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        // remove the tags from the view
        if (tagType == 'SEASONAL') {
          for (var i = 0; i < this.venue.seasonalTags.length; i++) {
            if (this.venue.seasonalTags[i].id === tagId) {
              this.venue.seasonalTags.splice(i, 1);
            }
          }
        } else {
          for (var i = 0; i < this.venue.tags.length; i++) {
            if (this.venue.tags[i].id === tagId) {
              this.venue.tags.splice(i, 1);
            }
          }
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  async removeCategoryFromVenue(categoryId) {
    this.logger.entry(this._className, 'removeCategoryFromVenue', categoryId);
    await this.pageHelper.showSaver();

    this.venueProvider.removeVenueFromCategory(this.venueId, categoryId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        // remove the category from the view
        for (var i = 0; i < this.categories.length; i++) {
          if (this.categories[i].fromCategory.id === categoryId) {
            this.categories[i].splice(i, 1);
          }
        }

      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * Creates a tag element
   * @param tagDocument A document to post to the CreateTag API
   * @param isAmenity True if we are associating an amenity
   */
  async createTagAssociation(tagDocument, isAmenity = false) {
    this.logger.entry(this._className, 'createTagAssociation');
    await this.pageHelper.showSaver();
    await this.venueProvider.associateTagsToVenue(this.venueId, [tagDocument.id]).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (isAmenity) {
          if (this.venue.amenities == null) {
            this.venue.amenities = [];
          }
          this.venue.amenities.push(tagDocument);
        } else {
          if (this.venue.tags == null) {
            this.venue.tags = [];
          }
          this.venue.tags.push(tagDocument);
        }
      },
      (err2) => {
        this.pageHelper.processRequestError(err2).subscribe((resp) => { });
      }
    );
  }


  /**
   * Delets an amentiy from a venue
   * @param amenityId unique id of the amenity
   */
  async removeAmenityFromVenue(amenityId) {
    this.logger.entry(this._className, 'removeAmenityFromVenue');
    await this.pageHelper.showLoader();

    this.venueProvider.deleteAmenityInVenue(amenityId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        // remove from the current view
        for (var i = 0; i < this.venue.amenities.length; i++) {
          if (this.venue.amenities[i].id === amenityId) {
            this.venue.amenities.splice(i, 1);
          }
        }

      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * Associates a venue with a category and updates the display
   * @param categoryId The unique GUID/id of the category to add the venue to
   * @param sequence the sequence of the venue in the category
   * @param catName The name of the category to associate.  Used to decorate the venue screen after update
   */
  async associateVenueToCategories(categoryId: string, sequence: number = 0, catName: string) {
    this.logger.entry(this._className, 'associateVenueToCategories');
    await this.pageHelper.showSaver();
    await this.venueProvider.associateVenueToCategory(this.venueId, categoryId, sequence).subscribe(
      (resp) => {
        this.categories.push({ fromCategory: { id: categoryId, description: [{ name: catName }] } });
        this.pageHelper.hideLoader();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

}
