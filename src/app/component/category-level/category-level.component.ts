import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Logger } from '../../../providers/logger';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';

/**
 * This component is a sub-component of the category-tree component.
 * This component is to be nested as deep as required by the depth of the tree.  
 */
@Component({
  selector: 'app-category-level',
  templateUrl: './category-level.component.html',
  styleUrls: ['./category-level.component.scss'],
})
export class CategoryLevelComponent implements OnInit {
  private _className = 'CategoryLevelComponent';

  // the category input object
  @Input() input: any = {};

  @Input() expandedCategories: any = {};

  // a reference to a category inside the editor. its an object to also know what category is selected
  @Input() categoryEditor: any = {};

  // emits an event when a category group is expanded by clicking
  @Output() buttonCategoryExpandClickEvent = new EventEmitter<any>();

  // emits an event when a category is cliked on
  @Output() buttonCategoryClickEvent = new EventEmitter<any>();

  constructor(
    public logger: Logger,
    public venueProvider: Venue,
    public pageHelper: PageHelper) { }

  ngOnInit() { }

  /**
   * Checks a hash to know if a category is expanded or not.
   * @param categoryId 
   * @returns true/false
   */
  isGroupExpanded(categoryId) {
    return this.expandedCategories[categoryId] != null;
  }

  /**
   * This even is called when a category name is clicked on.
   * @param categoryRelObj Category Relationship object to edit
   * @param parentCategoryObj The parent Category object of the category we are editing
   */
  async categoryClick(categoryRelObj, parentCategoryObj) {
    this.logger.entry(this._className, 'categoryClick');
    this.logger.trace(this._className, 'categoryClick: categoryRelObj.category.id', categoryRelObj.category.id);
    this.logger.trace(this._className, 'categoryClick: parentCategoryObj', parentCategoryObj);

    this.buttonCategoryClickEvent.emit(
      {
        categoryRelObj: categoryRelObj,
        parentCategoryObj: parentCategoryObj
      });
  }

  /**
   * Like inception, every tree can be infinitly deep.  Click actions deeply nested call into here. 
   * categoryClick() is called first.  It calls this method all the way up the stack. 
   * @param obj Event object
   */
  async categoryClickInception(obj: any) {
    this.logger.entry(this._className, 'categoryClickInception', "INTERNAL");
    this.buttonCategoryClickEvent.emit(
      {
        categoryRelObj: obj.categoryRelObj,
        parentCategoryObj: obj.parentCategoryObj
      });
  }

  /**
   * Called when the expand is clicked on a category group
   * @param categoryId unique id of the category clicked
   * @param categoryObj the object of the clicked category 
   */
  async expandGroup(categoryId, categoryObj = null) {
    this.logger.entry(this._className, 'expandGroup');

    this.expandedCategories[categoryId] = this.expandedCategories[categoryId] != null ? null : "true";
    this.logger.trace(this._className, 'expandGroup', this.expandedCategories[categoryId]);

    if (categoryObj != null && categoryObj.childrenRel == null) {
      this._getChildrenCategories(categoryId, categoryObj);
    }
  }

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

}
