import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Logger } from '../../../providers/logger';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';

/**
 * This component can be added to a page/modal that wants to display a list of categories.  The 2 
 * events the calling page needs to listen to are the top category and category clicks.  
 * 
 * Example:
 * <app-category-tree 
 *	[categories]="categories"
 *	[categoryEditor]="category"
 *	(buttonTopCategoryExpandClickEvent)="editTopCategory($event)"
 *	(buttonCategoryClickEvent)="editCategory($event)">
 * </app-category-tree>
 */
@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.scss'],
})
export class CategoryTreeComponent implements OnInit {
  private _className = 'CategoryTreeComponent';

  // List of the system categories. The input list should be empty
  @Input() categories: Array<any> = [];

  // A hash of expanded categories
  expandedCategoryList = {};

  // a reference to a category inside the editor. its an object to also know what category is selected
  @Input() categoryEditor: any = {};

  // emits an event when a top category is cliked on
  @Output() buttonTopCategoryExpandClickEvent = new EventEmitter<any>();

  // emits an event when a category is cliked on
  @Output() buttonCategoryClickEvent = new EventEmitter<any>();

  constructor(
    public logger: Logger,
    public venueProvider: Venue,
    public pageHelper: PageHelper) { }


  ngOnInit() { }

  /**
   * This method is called on every page view
   **/
  ngAfterViewInit() {
    this.logger.entry(this._className, 'ngAfterViewInit');
    this._getTopCategories();
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

  isGroupExpanded(categoryId) {
    return this.expandedCategoryList[categoryId] != null;
  }

  /**
   * This even is called when a category name is clicked on.
   * The click action is NOT in this component. It is in the category-level component.  
   * This method is a passthrough emitter.
   * @param obj  {categoryRelObj, parentCategoryObj}  Category Relationship object to edit and parent Category object of the category we are editing
   */
  async categoryClick(obj: any) {
    this.logger.entry(this._className, 'categoryClick');
    this.logger.trace(this._className, 'categoryClick: categoryRelObj.category.id', obj.categoryRelObj.category.id);
    this.logger.trace(this._className, 'categoryClick: parentCategoryObj', obj.parentCategoryObj);
    this.buttonCategoryClickEvent.emit(obj);
  }

  /**
   * Called when a top category is clicked on
   * @param categoryRelObj 
   */
  async topCategoryClick(categoryRelObj) {
    this.logger.entry(this._className, 'editTopCategory', categoryRelObj.id);
    this.buttonTopCategoryExpandClickEvent.emit(categoryRelObj);
  }

  /**
  * Expands the top level category groups
  * @param categoryId 
  * @param categoryObj 
  */
  async expandGroup(categoryId, categoryObj = null) {
    this.logger.entry(this._className, 'expandGroup', categoryId);
    this.expandedCategoryList[categoryId] = this.expandedCategoryList[categoryId] != null ? null : "true";
    this.logger.trace(this._className, 'expandGroup', this.expandedCategoryList[categoryId]);

    if (categoryObj != null && categoryObj.childrenRel == null) {
      this._getChildrenCategories(categoryId, categoryObj);
    }
  }
}
