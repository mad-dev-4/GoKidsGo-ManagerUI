import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-find-location-modal',
  templateUrl: './find-location-modal.page.html',
  styleUrls: ['./find-location-modal.page.scss'],
})
export class FindLocationModalPage implements OnInit {
  private _className = 'FindLocationModalPage';

  // Current signed in users email address
  usersEmail: string;

  // Result table
  locations: any;

  pageNumber = 1;
  resultsPerPage = 10;
  totalResults = 0;
  @Input() searchString = '';

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

  onSearchType(event: any) {
    this.logger.entry(this._className, 'onSearchType:' + event.target.value);
    this.searchString = event.target.value; 
  }

  selectLocation(locationId) {
    this.logger.entry(this._className, 'selectLocation:' + locationId);
    this.locations.forEach(element => {
      if (element.id == locationId) {
        this.modalCtrl.dismiss({location: element});
        return;
      }
    });
    //this.modalCtrl.dismiss({locationId: locationId});
  }

  /**
   * A button action to close this modal
   */
  async closeModal() {
    this.modalCtrl.dismiss({});
  }

 /**
   * This method searches for locations
   **/
  async searchForLocation() {
    this.logger.entry(this._className, '_searchVenue');
    await this.pageHelper.showLoader();

    let params = {pageNumber: this.pageNumber,  pageSize: this.resultsPerPage, SearchString: this.searchString };
    this.logger.entry(this._className, 'this.searchString:' + this.searchString);
    this.venueProvider.getSearchLocationFuzy(params).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        if (resp != null) {
          this.totalResults = resp.dataResultCount;
          this.locations = resp.dataList; 
          this.pageNumber = resp.page;
          this.resultsPerPage = resp.pageSize;
        }
        
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this.searchForLocation();
        });
      }
    );
  }// end get location

}
