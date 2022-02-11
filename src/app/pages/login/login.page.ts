import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ModalController, ToastController } from '@ionic/angular';
import { User } from '../../../providers/user';
import { LTCache } from '../../../providers/lt-cache';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { LoginserviceService } from '../../services/loginservice.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  private _className = 'LoginPage';

  private errorMessageKey: string;
  private isModal: boolean;

  idpList: Array<any> = [];
  isDevMode = !environment.production;

  constructor(
    public translateService: TranslateService,
    public pageHelper: PageHelper,
    public router: Router,
    public loginService: LoginserviceService,
    public userProvider: User,
    public modalCtrl: ModalController,
    public cache: LTCache,
    public logger: Logger,
    public toastController: ToastController) {

    // check if this page was brought up as a modal/popover
    this.isModal = loginService.getIsModal();
    this.errorMessageKey = loginService.getErrorMessageKey();
  }

  ngOnInit() { }

  ionViewDidEnter() {
    this._getIDP();
  }

  /**
  * This method loads IDP providers
  **/
  private async _getIDP() {
    this.logger.entry(this._className, '_getIDP');
    await this.pageHelper.showLoader();

    this.userProvider.getIDPs().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.idpList = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getIDP();
        });
      }
    );
  }

  /**
   * Takes the user to an IDP
   */
  async gotoIDP(redirectUrl) {
    this.logger.entry(this._className, "gotoIDP");
    window.location=redirectUrl;
  }


  /**
   * executes a login only for developers
   */
  private async loginNow() {
    this.userProvider.getDevJWT().subscribe((resp) => {
      this.logger.trace(this._className, "loginNow", "Login Successful");
      this.pageHelper.hideLoader();

      if (this.isModal) {
        this.modalCtrl.dismiss({});
      } else {
        this.router.navigate(['']);
      }
    }, (err) => {
      this.logger.trace(this._className, "loginNow", "Login failed");
      this.pageHelper.hideLoader();
      this.pageHelper.showToast(this.pageHelper.loginInIncorrect);
    });
  }


  /**
   * button to login as a dev user.  dev mode only
   */
  public loginDev() {
    this.loginNow();
  }

}
