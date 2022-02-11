import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-find-category-modal',
  templateUrl: './find-category-modal.page.html',
  styleUrls: ['./find-category-modal.page.scss'],
})
export class FindCategoryModalPage implements OnInit {
  private _className = 'FindCategoryModalPage';

  // Current signed in users email address
  usersEmail: string;

  // List of the system categories
  categories: Array<any> = [];

  // the category being edited/selected
  category: any = {};

  // a list of selected categories to add
  selectedCategories: Array<any> = [];

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  }

  ngOnInit() {
  }


  /**
  * A button action to close this modal
  */
  async closeModal() {
    this.modalCtrl.dismiss({});
  }


  /**
     * Is a callback from the tree component.  Will call this method when a category is clicked.
     * @param categoryRelObj 
     */
  async categoryClicked(obj) {
    this.logger.entry(this._className, 'selectCategory', obj);

    var categoryRelObj = obj.categoryRelObj ? obj.categoryRelObj : obj;

    const found = this.selectedCategories.find(element => element.id == categoryRelObj.category.id);

    if (!found) {
      this.selectedCategories.push({
        id: categoryRelObj.category.id,
        name: categoryRelObj.category.description[0].name
      });
    }
  }

  /**
   * Removes a category from a selected set of categories
   * @param categoryId Unique categoryId
   */
  async removeCategory(categoryId) {
    this.logger.entry(this._className, 'removeCategory');
    for (var i = 0; i < this.selectedCategories.length; i++) {
      if (this.selectedCategories[i].id === categoryId) {
        this.selectedCategories.splice(i, 1);
      }
    }
  }

  /**
   * Button that closed the modal and returns all the selected categories
   */
  async closeAndKeepSelections() {
    this.logger.entry(this._className, 'closeAndKeepSelections');
    this.modalCtrl.dismiss({ selectedCategories: this.selectedCategories });
  }
}
