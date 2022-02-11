import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

/**
 * This page enables users to manage categories.  Add, delete and navigate all categories.  
 */
@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.page.html',
  styleUrls: ['./category-list.page.scss'],
})
export class CategoryListPage implements OnInit {
  private _className = 'CategoryListPage';

  // Current signed in users email address
  usersEmail: string;

  // List of the system categories
  categories: Array<any> = [];

  // the category being edited
  category: any = {};

  // the parent category of the category being edited
  parentCategory: any = {};

  // true if the form changed
  isReadyToSave: boolean = false;

  // text message
  deleteCategoryMessage: string = '';

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
    this.translateService.get('CATEGORY_CONFIRM_DELETE').subscribe((value) => {
      this.deleteCategoryMessage = value;
    });

  } // end constructor

  ngOnInit() {
  }

  /**
  * This method is called on every page view
  **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
  }

  /**
  * This method loads the top categories
  **/
  private async _getTopCategories() {
    this.logger.entry(this._className, '_getTopCategories');
    await this.pageHelper.showLoader();

    this.venueProvider.getTopNCategories().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null) {
          this.categories = resp;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getTopCategories();
        });
      }
    );
  } // end top categories


  /**
   * This method loads the child categories
   * @param parentCategoryId parent category to get children for
   * @param categoryObj is the category object the children will be appended to
   */
  private async _getChildrenCategories(parentCategoryId, categoryObj) {
    this.logger.entry(this._className, '_getChildrenCategories');
    await this.pageHelper.showLoader();

    this.venueProvider.getChildrenCategories(parentCategoryId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        categoryObj.childrenRel = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getChildrenCategories(parentCategoryId, categoryObj);
        });
      }
    );
  } // end child categories


  /**
   * Button action to delete the selected category
   */
  async deleteCategory() {
    this.pageHelper.showAlertOptionDialog(this.deleteCategoryMessage, this.category.identifier).then(x => {
      if (x == 'ok') {
        this._deleteCategory();
      }
    });
  }


  /**
   * Button to delete a category from the system and reloads the category
   */
  private async _deleteCategory() {
    this.logger.entry(this._className, '_deleteCategory', this.category.id);
    await this.pageHelper.showSaver();

    this.venueProvider.deleteCategory(this.category.id).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        if (this.category.isTop) {
          this._getTopCategories();
        } else {
          this._getChildrenCategories(this.parentCategory.id, this.parentCategory);
        }
        this.category = {};
        this.parentCategory = null;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }


  /**
   * When data on a field is changed, this method specifies the form was changed
   */
  async dataChanged() {
    this.logger.entry(this._className, 'dataChanged');

    this.isReadyToSave = (
      this.category.sequence !== '' &&
      this.category.identifier !== '' &&
      this.category.description[0].name !== null &&
      this.category.description[0].description !== null &&
      this.category.description[0].name !== '' &&
      this.category.description[0].description !== ''
    );
  }


  /**
   * Called from an emitted event
   * @param obj 
   */
  async editCategory(obj: any) {
    this.logger.entry(this._className, 'editCategory2');

    var categoryRelObj = obj.categoryRelObj;
    var parentCategoryObj = obj.parentCategoryObj;
    this.logger.trace(this._className, 'editCategory2', categoryRelObj.category.id);

    this.category = categoryRelObj.category;
    this.category.sequence = categoryRelObj.sequence;
    this.parentCategory = parentCategoryObj;
    if (parentCategoryObj != null) {
      this.category.parentCategoryId = parentCategoryObj.id;
      this.category.parentIdentifier = parentCategoryObj.identifier;
    }
  }


  /**
   * Is a callback from the tree component.  Will call this method when a top category is clicked.
   * @param categoryRelObj 
   */
  async editTopCategory(categoryRelObj) {
    this.logger.entry(this._className, 'editTopCategory', categoryRelObj.id);
    this.category = categoryRelObj.category;
    this.category.sequence = categoryRelObj.sequence;
    this.category.isTop = true;
    this.parentCategory = null;
  }


  /**
   * A button action that saves a category.  Either creates or updates the category.
   */
  async saveCategory() {
    this.logger.entry(this._className, 'saveCategory');
    await this.pageHelper.showSaver();

    if (this.category.new != null && this.category.new) {
      this.venueProvider.createCategory(this.category).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
          this.category.id = resp.id
          this.category.new = null;

          if (this.category.isTopCategory == true) {
            this._getTopCategories();
          }
        },
        (err) => {
          this.pageHelper
            .processRequestError(err, null)
            .subscribe((resp) => { });
        }
      );
    } else {

      this.venueProvider.saveCategory(this.category).subscribe(
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
    }
  }


  /**
   * A button action that adds a sub category to the selected this.category object
   */
  async addSubCategory() {
    this.parentCategory = this.category;
    this.logger.entry(this._className, 'addSubCategory to', this.parentCategory.id);

    this.category = {
      id: null,
      identifier: '',
      hidden: false,
      new: true,
      parentCategoryId: this.parentCategory.id,
      parentIdentifier: this.parentCategory.identifier,
      sequence: 0,
      description: [{
        lang: 'en',
        name: '',
        description: ''
      }]
    }

    var _toCategory = {
      category: this.category
    }
    this.parentCategory?.childrenRel.push(_toCategory);
  }


  /**
   * Button to add a top level category
   */
  async addTopCategory() {
    this.logger.entry(this._className, 'addTopCategory');
    this.category = {
      id: null,
      identifier: '',
      hidden: false,
      new: true,
      isTopCategory: true,
      sequence: 0,
      childrenRel: [],
      description: [{
        lang: 'en',
        name: '',
        description: ''
      }]
    }
    var _topCategory = { 
      category: this.category,
      id: null
    }
    this.categories.push(_topCategory);
  }


  /**
   * Button to cancel a new category from being created
   */
  async cancelChanges() {
    this.isReadyToSave = false;
    this.category = {};
    this.parentCategory = {};
  }


  /**
   * Button to view all venues for the selected category
   */
  async gotoVenueList() {
    if (this.category != null) {
      this.router.navigate(['venue-list'], {
        queryParams: {
          CategoryId: this.category.id,
          ResultsPerPage: 50
        },
      });
    }
  }

}
