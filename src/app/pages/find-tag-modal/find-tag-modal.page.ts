import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-find-tag-modal',
  templateUrl: './find-tag-modal.page.html',
  styleUrls: ['./find-tag-modal.page.scss'],
})
export class FindTagModalPage implements OnInit {
  private _className = 'FindTagModalPage';

  // search filter
  searchFilter: any = "";

  // Current signed in users email address
  usersEmail: string;

  // array of tags loaded
  tags: any;
  tagsFoundDefault: any;
  tagsFoundLength: any;

  // page criteria
  dataResultCount: number = 0;
  pageNumber: number = 1;
  pageSize: number = 50;

  // hash of selected tags
  selectedTags = {};
  numberOfSelections: number = 0;

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
    this._getTags();
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
      setTimeout(this._getTags.bind(this), 1000);
    }
  }

  /**
   * Navigate to the previous result set page
   */
   async previousPage() {
    this.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._getTags();
  }


  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._getTags();
  }


  /**
   * This method loads tags
   **/
  async _getTags() {
    this.logger.entry(this._className, '_getTags');
    //await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.venueProvider.getTags(
      this.searchFilter, null, null, null,
      this.pageSize,
      this.pageNumber).subscribe(

        (resp) => {
          this.pageHelper.hideLoader();
          this.numberOfSelections = 0;

          if (resp != null) {
            this.tags = resp.dataList;
            this.dataResultCount = resp.dataResultCount;
            this.pageNumber = resp.page;
            this.pageSize = resp.pageSize;
            this.searchTextChanges = 0;
          }

        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => {
            this._getTags();
          });
        }
      );
  }// end get tags

  /**
   * Adds and removes tags from memory that are selected or deselected
   * @param tagObj the tag object
   * @param event 
   */
  selectTag(tagObj, event) {
    this.logger.entry(this._className, 'selectTag, event', event.target.checked);
    if (event.target.checked) {
      delete this.selectedTags[tagObj.id];
      this.numberOfSelections--;
      this.logger.trace(this._className, 'deleted');
    } else {
      this.selectedTags[tagObj.id] = tagObj;
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
    this.logger.entry(this._className, 'closeAndKeepSelections');
    this.modalCtrl.dismiss({ selectedTags: this.selectedTags });
  }
}
