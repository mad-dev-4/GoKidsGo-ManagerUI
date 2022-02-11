import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-postal',
  templateUrl: './postal.page.html',
  styleUrls: ['./postal.page.scss'],
})
export class PostalPage implements OnInit {
  private _className = 'PostalPage';

  postalCode = {
    "id": "",
    "code": "",
    "city": "",
    "provinceABBR": "ON",
    "timeZone": "",
    "latitude": 0,
    "longitude": 0
  }

  // param of code id passed to page
  postalCodeId: any;

  // Current signed in users email address
  usersEmail: string;

  // true if the form changed
  isReadyToSave: boolean = false;

  public fieldsNotFilledOutMessage: string;

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
    this.translateService
      .get('POSTAL_FIELDS_NOT_FILLED')
      .subscribe((value) => {
        this.fieldsNotFilledOutMessage = value;
      });
  } // end constructor


  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.params.subscribe((params) => {
      this.postalCodeId = params['id'];
      this.logger.entry(
        this._className,
        'ngOnInit this.postalCodeId:' + this.postalCodeId
      );
    });
  }

 /**
 * This method is called on every page view
 **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');

    if (this.postalCodeId != null && this.postalCodeId != 0) {
      this._getPostalCode().then((o) => {
        this.isReadyToSave = false;
      });
    }
  }


  /**
   * This method loads the postal code
   **/
  private async _getPostalCode() {
    this.logger.entry(this._className, '_getPostalCode');
    await this.pageHelper.showLoader();

    this.venueProvider.getPostalCodeById(this.postalCodeId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.postalCode = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getPostalCode();
        });
      }
    );
  } // end get postal code

  /**
   * When data on a field is changed, this method specifies the form was changed
   */
  async dataChanged() {
    this.logger.entry(this._className, 'dataChanged');
    this.isReadyToSave = true;
  }

  /**
   * Button on the UI to save postal code details. 
   * The form is validated to ensure all fields are filled in.
   */
  async savePostalDetails() {
    this.logger.entry(this._className, 'savePostalDetails');
    if (
      this.postalCode.code == '' ||
      this.postalCode.city == '' ||
      this.postalCode.latitude == 0 ||
      this.postalCode.longitude == 0
    ) {
      this.pageHelper.showAlertDialog(this.fieldsNotFilledOutMessage);
      return;
    }

    await this.pageHelper.showSaver();
    if (this.postalCodeId != 0) {
      this.logger.trace(this._className, 'Saving id' + this.postalCodeId);
      this.venueProvider.savePostalCodeDetails(this.postalCode).subscribe(
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
    } else {
      this.logger.trace(this._className, 'Creating');
      this.venueProvider.createPostalCode(this.postalCode).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isReadyToSave = false;
          if (resp != null) {
            this.postalCode = resp;
            this.postalCodeId = resp.id;
          }
        },
        (err) => {
          this.pageHelper
            .processRequestError(err, null)
            .subscribe((resp) => { });
        }
      );
    }

  }
}
