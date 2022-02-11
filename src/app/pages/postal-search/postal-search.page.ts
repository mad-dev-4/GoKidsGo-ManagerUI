import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-postal-search',
  templateUrl: './postal-search.page.html',
  styleUrls: ['./postal-search.page.scss'],
})
export class PostalSearchPage implements OnInit {
  private _className = 'PostalSearchPage';

  // form data object
  formObj: any = {};

  // Current signed in users email address
  usersEmail: string;

  constructor(
    public navCtrl: NavController,
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    // this object mimics the search API input
    this.formObj = {
      postalCode: null,
      pageSize: '50',
      pageNumber: 1,
      id: null,
      city: null,
      provinceABBR: null,
      minLatitude: null,
      maxLatitude: null,
      minLongitude: null,
      maxLongitude: null,
    };
  }

  ngOnInit() { }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
  }

  /**
   * Navigates to the  list page
   */
  goToSearchResultPage() {
    this.logger.entry(this._className, 'goToSearchResultPage');
    this.router.navigate(['postal-list'], {
      queryParams: this.formObj,
    });
  }

 /**
 * On button click, takes the user to a new postal code page
 */
  async createNewPostalCode(eventValue) {
    this.router.navigate(['postal/0'], {});
  }
}
