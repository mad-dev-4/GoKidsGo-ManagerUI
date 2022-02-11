import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

// pages
import { NewTagModalPage } from '../new-tag-modal/new-tag-modal.page';
import { NewAmenityModalPage } from '../new-amenity-modal/new-amenity-modal.page';

@Component({
  selector: 'app-tag-search',
  templateUrl: './tag-search.page.html',
  styleUrls: ['./tag-search.page.scss'],
})
export class TagSearchPage implements OnInit {
  private _className = "PostalSearchPage";

  // form data object (tag)
  formObj: any = {};

  // Current signed in users email address
  usersEmail: string;

   // default value of the segment selector
   segmentValue:string = "tag";

  // text message
  tagCreatedSuccessfully: string = "";
  amenityCreatedSuccessfully: string = "";

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public loadingCtrl: LoadingController,
    public logger: Logger,
    public modalCtrl: ModalController,
    public pageHelper: PageHelper,
    public router: Router,
    public translateService: TranslateService
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    // this object mimics the search API input
    this.formObj =
    {
      tagId: '',
      name: '',
      searchable: '',
      viewable: '',
      pageSize: '50'
    };

    // language fallback
    translateService.setDefaultLang('en');

    // load text strings
    this.translateService.get('TAG_CREATED_SUCCESSFULLY').subscribe((value) => {
      this.tagCreatedSuccessfully = value;
    });
    this.translateService.get('AMENITY_CREATED_SUCCESSFULLY').subscribe((value) => {
      this.amenityCreatedSuccessfully = value;
    });

  } // end constructor

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
    this.formObj.type = this.segmentValue == 'tag' ? 'HASHTAG' : 'AMENITY';
    this.router.navigate(['tag-list'], {
      queryParams: this.formObj,
    });
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
        this.formObj.name = x.data.createdElement.name;
        this.formObj.tagId = x.data.createdElement.id;
        this.pageHelper.showToast(this.tagCreatedSuccessfully);
      }
    });

    await modal.present();
  }

  /**
   * Opens the amenity Create New modal
   * @param event 
   */
  async presentAmenityCreateModal(event) {
    this.logger.entry(this._className, 'presentAmenityCreateModal');

    const modal = await this.modalCtrl.create({
      component: NewAmenityModalPage,
      componentProps: { errorMessageKey: "??", isModal: true },
    });

    modal.onDidDismiss().then(x => {
      this.logger.entry(this._className, 'presentAmenityCreateModal - dismiss');
      if (x.data.createdElement != null) {
        this.formObj.name = x.data.createdElement.name;
        this.formObj.tagId = x.data.createdElement.id;
        this.pageHelper.showToast(this.amenityCreatedSuccessfully);
      }
    });

    await modal.present();
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev.detail.value);
    this.segmentValue = ev.detail.value;
  }
}
