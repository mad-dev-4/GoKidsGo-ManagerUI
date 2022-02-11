import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, Platform } from '@ionic/angular';
import { LTCache } from '../providers/lt-cache';
import { EventsService } from '../events/events-service';
import { Logger } from '../providers/logger';
import { environment } from '../environments/environment';
import { User } from '../providers/user';
import { interval, Subscription } from 'rxjs';

// Page Services
import { LoginserviceService } from './services/loginservice.service';

// Pages
import { LoginPage } from './pages/login/login.page';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private _className = 'AppComponent';

  rootPage;

  userDetails = null;
  userEmailAddress = "";
  jstSubscription: Subscription;

  constructor(
    private translateService: TranslateService,
    public platform: Platform,
    public cache: LTCache,
    public userProvider: User,
    public modalCtrl: ModalController,
    public events: EventsService,
    public logger: Logger,
    public route: ActivatedRoute,
    public loginService: LoginserviceService
  ) {
    this.logger.entry(this._className, 'constructor');

    this.cache.load().then(() => {
      this.logger.entry(this._className, 'Cache Loaded');

      // first check the request for a possible jwt
      this.route.queryParams.subscribe((params) => {
        var jwtInRequest = params['jwt'];
        this.logger.trace(this._className, 'ngOnInit this.jwt.id:', jwtInRequest);
        if (jwtInRequest != null) {
            this.getUserDetails(jwtInRequest);
        }
        this.initializeApp();
      });
    });

    // 25 minute interval
    const source = interval(25*60000);
    this.jstSubscription = source.subscribe(val => this.refreshJWT());
  }

  initializeApp() {
    // set languages
    this.translateService.setDefaultLang('en');

    return this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      /*
       * Listen to a session expired event.  If sent, we must show the relogon page
       */
      this.events.getObservable().subscribe((data) => {
        console.log('Event received:', data);

        if (
          data != null &&
          data.user != null &&
          data.user == 'sessionExpired'
        ) {
          console.log('Event: user:sessionExpired');
          console.log('Event observable: ' + data.observable);

          // go to the apps login page
          window.location.href = environment.loginUrl;
          //this.presentModal(data);
        }
      });
    });
  }

  /**
   * This method attempts to refresh the JWT.  exchanges it with a new one
   */
  async refreshJWT() {
    this.userProvider.getExchangeJWT().subscribe((resp) => {
      this.logger.trace(this._className, "refreshJWT");
      this.userEmailAddress = resp.email;
    }, (err) => {
      this.logger.trace(this._className, "refreshJWT", "err");
      window.location.href = environment.loginUrl;
    });
  }

  /**
   * This method gets user deatils
   */
  async getUserDetails(jwtInRequest) {
    console.log("**INIT getUserDetails:" + jwtInRequest);
    await this.cache.setValue(this.cache.KEY_HEADER_TOKEN, jwtInRequest);
 
    this.userProvider.getMyProfile().subscribe((resp) => {
      this.logger.trace(this._className, "getUserDetails");
      this.userDetails = resp;
      this.userEmailAddress = resp.email;
    }, (err) => {
      this.logger.trace(this._className, "getUserDetails", "err");
    });
  }

  /**
   * On cleanup
   */
  ngOnDestroy() {
    this.jstSubscription.unsubscribe();
  }

  /*
  async presentModal(data) {
    const reloadObservable = data.observable;
    console.log('***presentModal***');
    const modal = await this.modalCtrl.create({
      component: LoginPage,
      componentProps: { errorMessageKey: data.errorMessageKey, isModal: true },
    });
    modal.onDidDismiss().then((x) => {
      console.log('dismiss presentModal');
      if (
        x == null ||
        x.data == null ||
        x.data.retry == null ||
        x.data.retry == true
      ) {
        // send message that the modal was dismissed
        reloadObservable.next('*');
        this.userEmailAddress = this.cache.getValue(this.cache.KEY_USER_LOGIN_EMAIL);
      }
    });

    await modal.present();
  }*/
}
