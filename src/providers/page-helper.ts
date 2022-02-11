import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from './logger';
import { EventsService } from '../events/events-service';
import { format, parseISO } from 'date-fns';

import { Observable, Subject } from 'rxjs';

export class PageHelper {
  // Translated text strings
  public errorLoading: string;
  public errorAlertTitle: string;
  public loadingInProgress: string;
  public errorRetry: string;
  public errorCancel: string;
  public savingInProgress: string;
  public errorSavingChange: string;
  public deletingInProgress: string;
  public buttonOk: string;
  public buttonCancel: string;
  public errorAuthorization: string;
  public errorServerNotReachable: string;

  // Login Specific translated text strings
  public loginErrorTitle: string;
  public loginErrorEmptyParam: string;
  public loginInIncorrect: string;

  private reloadObservable = new Subject<any>();
  private loader: Array<any> = [];

  constructor(
    public translateService: TranslateService,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public logger: Logger,
    public events: EventsService,
    public toastCtrl: ToastController
  ) {
    // language fallback
    translateService.setDefaultLang('en');

    // load text strings
    this.translateService.get('ALERT_ERROR_TITLE').subscribe((value) => {
      this.errorAlertTitle = value;
    });
    this.translateService.get('AUTHORIZATION_ERROR').subscribe((value) => {
      this.errorAuthorization = value;
    });
    this.translateService.get('PROGRESS_LOADING').subscribe((value) => {
      this.loadingInProgress = value;
    });
    this.translateService.get('BUTTON_RETRY').subscribe((value) => {
      this.errorRetry = value;
    });
    this.translateService.get('BUTTON_CANCEL').subscribe((value) => {
      this.errorCancel = value;
    });
    this.translateService.get('ERROR_SAVING').subscribe((value) => {
      this.errorSavingChange = value;
    });
    this.translateService.get('PROGRESS_SAVING').subscribe((value) => {
      this.savingInProgress = value;
    });
    this.translateService.get('PROGRESS_DELETING').subscribe((value) => {
      this.deletingInProgress = value;
    });
    this.translateService.get('BUTTON_OK').subscribe((value) => {
      this.buttonOk = value;
    });
    this.translateService.get('BUTTON_CANCEL').subscribe((value) => {
      this.buttonCancel = value;
    });
    this.translateService.get('GENERIC_ERROR_LOADING').subscribe((value) => {
      this.errorLoading = value;
    });
    this.translateService
      .get('ERROR_SERVER_NOT_REACHABLE')
      .subscribe((value) => {
        this.errorServerNotReachable = value;
      });
    this.translateService.get('LOGIN_ERROR_TITLE').subscribe((value) => {
      this.loginErrorTitle = value;
    });
    this.translateService.get('LOGIN_EMPTY_PARAMS').subscribe((value) => {
      this.loginErrorEmptyParam = value;
    });
    this.translateService.get('LOGIN_INCORRECT').subscribe((value) => {
      this.loginInIncorrect = value;
    });
  } // end constructor

  /**
   * Shows the loader indicator to the user
   * @return loadingCtrl reference
   **/
  public async showLoader() {
    var t = await this.loadingCtrl.create({
      spinner: 'bubbles',
      message: this.loadingInProgress,
    });
    this.loader.push(t);
    await t.present();
    return this.loader;
  }

  /**
   * Shows the saving indicator to the user.
   * Do not call this method in a loop.
   * @return loadingCtrl reference
   **/
  public async showSaver() {
    var t = await this.loadingCtrl.create({
      spinner: 'bubbles',
      message: this.savingInProgress,
    });
    this.loader.push(t);
    await t.present();
    return this.loader;
  }

  /**
   * Hides the all loading indicators from the screen.
   * The app is asychronous, so multiple loaders may overlap, requiring all to be removed.
   * @param specificLoader, only specify if a specific loader needs to be hidden
   **/
  public async hideLoader(specificLoader?: any) {
    if (specificLoader != null) {
      specificLoader.dismiss().catch(() => { });
    } else if (this.loader != null) {
      try {
        while (this.loader.length) {
          var p = this.loader.pop();
          await p.dismiss().catch(() => { });
        }
      } catch (e) { }
    }
  }

  /**
   * @param aUTFDate a UTF Date
   * @returns a formatted date
   */
  formatDateAndTime(aUTFDate) {
    if (aUTFDate != null) {
      return aUTFDate != null
        ? format(parseISO(aUTFDate), 'MMM d, yyyy - HH:mm aaa')
        : '';
    }
  }

  /**
   * @param aUTFDate a UTF Date
   * @returns a formatted date without the time
   */
  formatDateOnly(aUTFDate) {
    if (aUTFDate != null) {
      return aUTFDate != null
        ? format(parseISO(aUTFDate), 'MMM d, yyyy')
        : '';
    }
  }

  /**
   * This dialog can be called to show an non-obtrustive dialog with a emssage.
   * No data returned to caller.
   * @param: message, to display
   **/
  async showToast(messageToShow) {
    const toast = await this.toastCtrl.create({
      message: messageToShow,
      duration: 2000,
      position: 'top',
      buttons: [
        {
          text: 'X',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          },
        },
      ],
    });
    toast.present();
  }

  /**
   * This dialog can be called to show an alert dialog with a emssage.  The button says 'ok'.
   * No data returned to caller.
   * @param: message, to display
   **/
  async showAlertDialog(message: string) {
    this.logger.entry('BasePage', 'showAlertDialog');
    const alert = await this.alertCtrl.create({
      message: message,
      buttons: [
        {
          text: this.buttonOk,
          handler: () => { },
        },
      ],
    });
    await alert.present();
  }

  /**
   * This method is used to display a OK/Cancel button option.  The header and message should be set. Usage example:
   * this.pageHelper.showAlertOptionDialog("Save changes?","Chanes are not saved").then(x=>{
   *     if (x == 'ok') {
   *       // do something
   *     }
   *   });
   *
   * @param header
   * @param subHeader
   * @param message
   * @returns a promise on alert dismiss.  Result returens 'cancel' or 'ok'.
   */
  async showAlertOptionDialog(
    header: string,
    message: string = null,
    subHeader: string = null
  ) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-alert-class',
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: [
        {
          text: this.buttonCancel,
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
        },
        {
          text: this.buttonOk,
          role: 'ok',
          id: 'ok-button',
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    return role;
  }

  /**
   * Call when subscribed to a http request that failed.  Send the error object into this method.
   * If the error requires a relogon, a modal is displayed and the observable returned will change when
   * the user logs on again.  Subscribe to the observable and you can possibly reload data after logon.
   * As a side effect, this method hides a loader if it is shown.
   * @param error: the http request error response
   * @param: overrideMessage, overrides the generic error message with this string. Also overrides a server generated message
   * @return Observable: if we need the user to complete an action like relogon or clicking a retry button.
   **/
  public processRequestError(
    error: any,
    overrideMessage?: string
  ): Observable<any> {
    this.logger.entry('BasePage', 'processRequestError');
    this.hideLoader(); // if displayed

    if (typeof error == 'string' && error == 'Unauthorized_401') {
      // Because the user is not authorized, push an event to cause the login screen to apear.
      this.events.publish({
        user: 'sessionExpired',
        errorMessageKey: 'SESSION_EXPIRED',
        observable: this.reloadObservable,
      });
      return this.reloadObservable.asObservable();
    } else if (typeof error == 'string' && error == 'Unreachable_0') {
      // if a status of error.code == 0, then the server is unrachable.  It might be down, CORS may not be configured, SSL may be broken, etc...
      this.showGenericErrorLoadingWithRetry();
      this.reloadObservable = new Subject<any>();
      return this.reloadObservable.asObservable();
    } else {
      // attempt to parse the response for a meangiful error message
      if (error && error.error && error.error.message) {
        let errorMsg = error.error.message;
        this.logger.trace(
          'BasePage',
          'processRequestError',
          'errorMsg:' + errorMsg
        );
        if (errorMsg != null && errorMsg != '') {
          overrideMessage =
            overrideMessage == null ? errorMsg : overrideMessage;
          overrideMessage = errorMsg == null ? overrideMessage : errorMsg;
          this.logger.trace(
            'BasePage',
            'processRequestError',
            'OverrideMessage:' + overrideMessage
          );
        }
      }
      this.showGenericErrorLoading(overrideMessage);
      this.reloadObservable = new Subject<any>();
      return this.reloadObservable.asObservable();
    }
    //return Observable.empty();
  }

  /**
   * Call this method if there was a generic error loading data.  The button says 'ok'.
   * @param: overrideMessage, overrides the generic error message with this string
   **/
  async showGenericErrorLoading(overrideMessage?: string) {
    this.logger.entry('BasePage', 'showGenericErrorLoading');
    const alert = await this.alertCtrl.create({
      message: overrideMessage != null ? overrideMessage : this.errorLoading,
      buttons: [
        {
          text: this.buttonOk,
          handler: () => {
            this.reloadObservable.next('*');
          },
        },
      ],
    });
    await alert.present();
  }

  /**
   * Call this method if there was a generic error loading and you want a retry button.  Callback button says 'Retry'.
   * @param: overrideMessage, overrides the generic error message with this string. The default message is about a communication error.
   **/
  async showGenericErrorLoadingWithRetry(overrideMessage?: string) {
    this.logger.entry('BasePage', 'showGenericErrorLoadingWithRetry');
    let alert = await this.alertCtrl.create({
      message:
        overrideMessage != null
          ? overrideMessage
          : this.errorServerNotReachable,
      buttons: [
        {
          text: this.errorRetry,
          handler: () => {
            this.reloadObservable.next('*');
          },
        },
        {
          text: this.errorCancel,
        },
      ],
    });
    await alert.present();
  }
}
