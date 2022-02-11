import { NgModule, ErrorHandler, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

// ionic libs
import { Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { IonicModule, IonicRouteStrategy, AlertController, ModalController, LoadingController, ToastController } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TranslateService, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { EventsService } from '../events/events-service';

// import custom providers
import { User } from '../providers/user';
import { Rating } from '../providers/rating';
import { Venue } from '../providers/venue';
import { Scheduler } from '../providers/scheduler';
import { PageHelper } from '../providers/page-helper';

import { Logger } from '../providers/logger';
import { LTCache } from '../providers/lt-cache';
import { InterceptedHttp } from "./http.interceptor";

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// The LTCache stores name/value pairs.  This function loads dome defaults 
export function ltCacheDefaults(storage: Storage, logger: Logger) {
  return new LTCache(storage, logger);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      } 
    }),
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),

  ],
  providers: [
    Logger,
    Scheduler,
    User,
    Rating,
    Venue,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LTCache, useFactory: ltCacheDefaults, deps: [Storage, Logger] },
    { provide: HTTP_INTERCEPTORS, multi: true, useClass: InterceptedHttp },
    {
      provide: PageHelper,
      useFactory: (translateService: TranslateService, alertCtrl: AlertController, modalCtrl: ModalController, loadingCtrl: LoadingController, logger: Logger, events: EventsService, toastCtrl: ToastController) => {
        return new PageHelper(translateService, alertCtrl, modalCtrl, loadingCtrl, logger, events, toastCtrl);
      },
      deps: [TranslateService, AlertController, ModalController, LoadingController, Logger, EventsService, ToastController]
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
