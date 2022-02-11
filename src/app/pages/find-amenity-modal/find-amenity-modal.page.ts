import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-find-amenity-modal',
  templateUrl: './find-amenity-modal.page.html',
  styleUrls: ['./find-amenity-modal.page.scss'],
})
export class FindAmenityModalPage implements OnInit {
  private _className = 'FindAmenityModalPage';

  // search filter
  searchFilter: any = '';

  // Current signed in users email address
  usersEmail: string;

  // array of the object loaded
  elements: any;

  // page criteria
  dataResultCount: number = 0;
  pageNumber: number = 1;
  pageSize: number = 50;

  // hash of selected objects
  selectedElements = {};
  numberOfSelections: number = 0;

  // Input to dialog to look up location level amenities
  @Input() locationId: string = null;

  //simple counter for the number of text data change events.  
  searchTextChanges: number = 0;

  constructor(
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
  }

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this._getElements();
  }

  /**
   * Called on change for the search bar
   * @param $event 
   */
  async searchTextChange($event) {
    this.logger.entry(this._className, 'searchTextChange', this.searchTextChanges);
    // we don't want to fire too many events, so we wait 1 second before issuing a query.  
    if (this.searchTextChanges <= 0) {
      this.searchTextChanges++;
      setTimeout(this._getElements.bind(this), 1000);
    }
  }

  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._getElements();
  }

  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._getElements();
  }


  /**
   * This method loads the elements
   **/
  async _getElements() {
    this.logger.entry(this._className, '_getElements');

    //await this.pageHelper.showLoader();
    this.venueProvider.getSearchAmenitiesFuzy(this.searchFilter, null, this.pageNumber, this.pageSize).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.numberOfSelections = 0;
        if (resp != null) {
          this.elements = resp.dataList;
          this.dataResultCount = resp.dataResultCount;
          this.pageNumber = resp.page;
          this.pageSize = resp.pageSize;
          this.searchTextChanges = 0;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getElements();
        });
      }
    );
  }

  /**
   * Adds and removes elements from memory that are selected or deselected
   * @param selectedElement
   * @param event 
   */
  selectElement(selectedElement, event) {
    this.logger.entry(this._className, 'selectTag, event: ' + event.target.checked);
    if (event.target.checked) {
      delete this.selectedElements[selectedElement.id];
      this.numberOfSelections--;
      this.logger.trace(this._className, 'deleted');
    } else {
      this.selectedElements[selectedElement.id] = selectedElement;
      this.numberOfSelections++;
      this.logger.trace(this._className, 'added');
    }

  }

  /**
   * Close and do not save
   */
  closeModal() {
    this.modalCtrl.dismiss({});
  }

  /**
   * Closes the modal and saves changes
   */
  closeAndKeepSelections() {
    this.logger.entry(this._className, 'closeAndKeepSelections,');
    this.modalCtrl.dismiss({ selectedTags: this.selectedElements });
  }

}
