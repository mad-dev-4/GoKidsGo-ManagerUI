import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.page.html',
  styleUrls: ['./tag-list.page.scss'],
})
export class TagListPage implements OnInit {
  private _className = 'TagListPage';

  // input to this page
  pageInput: any = {};

  // result list
  dataResultList: any = [];

  // Current signed in users email address
  usersEmail: string;

  dataResultCount = 0;

  isAmenity = false;

  // text message
  deleteTagMessage: string = '';
  deleteTagTitleMessage: string = '';
  tagDeletedMessage: string = '';

  constructor(
    public navCtrl: NavController,
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
    this.translateService.get('TAG_LIST_CONFIRM_DELETE').subscribe((value) => {
      this.deleteTagTitleMessage = value;
    });
    this.translateService.get('TAG_LIST_CONFIRM_MSG').subscribe((value) => {
      this.deleteTagMessage = value;
    });
    this.translateService.get('TAG_DELETED_SUCCESSFULLY').subscribe((value) => {
      this.tagDeletedMessage = value;
    });


  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.pageInput.searchable = params['searchable'];
      this.pageInput.name = params['name'];
      this.pageInput.id = params['tagId'];
      this.pageInput.viewable = params['viewable'];
      this.pageInput.pageSize = params['pageSize'];
      this.isAmenity = "AMENITY" == params['type']
      this.pageInput.pageNumber = 1;
      this.logger.entry(
        this._className,
        'ngOnInit this.pageInput.id:' + this.pageInput.id
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._search();
  }

  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.pageInput.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._search();
  }

  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageInput.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._search();
  }

  /**
   * Calls the proper search query
   */
  async _search() {
    if (this.isAmenity) {
      this._searchAmenity();
    } else {
      this._searchTags();
    }
  }

  async _searchTags() {
    this.logger.entry(this._className, 'searchTags');
    await this.pageHelper.showLoader();

    this.venueProvider.getTags(
      this.pageInput.name, this.pageInput.id,
      this.pageInput.searchable, this.pageInput.viewable,
      this.pageInput.pageSize, this.pageInput.pageNumber).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          if (resp != null && resp.dataList != null) {
            this.dataResultList = resp.dataList;
            this.pageInput.pageNumber = resp.page;
            this.pageInput.pageSize = resp.pageSize;
            this.dataResultCount = resp.dataResultCount;
          }
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => {
            this._searchTags();
          });
        }
      );
  }

  async _searchAmenity() {
    this.logger.entry(this._className, '_searchAmenity');
    await this.pageHelper.showLoader();

    this.venueProvider.getSearchAmenitiesFuzy(
      this.pageInput.name, this.pageInput.id,
      this.pageInput.pageNumber,
      this.pageInput.pageSize).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          if (resp != null && resp.dataList != null) {
            this.dataResultList = resp.dataList;
            this.pageInput.pageNumber = resp.page;
            this.pageInput.pageSize = resp.pageSize;
            this.dataResultCount = resp.dataResultCount;
          }
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => {
            this._searchTags();
          });
        }
      );
  }

  /**
   * Deletes a tag and reloads the page
   * @param tagId unique id of the tag
   */
  async _callDelete(tagId) {
    this.logger.entry(this._className, '_callDelete');
    await this.pageHelper.showSaver();

    this.venueProvider.deleteTag(tagId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.pageHelper.showToast(this.tagDeletedMessage);
        this._search();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * Button from the UI to delete a tag
   * @param tagId unique id of the tag
   */
  async deleteTag(tagId) {
    this.pageHelper.showAlertOptionDialog(this.deleteTagTitleMessage, this.deleteTagMessage).then(x => {
      if (x == 'ok') {
        this._callDelete(tagId);
      }
    });
  }

}
