import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { PipesModule } from '../../pipes/pipes.module';
import { CommonUIModule } from '../../component/common-ui.module';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

// slide swiper. 
import { SwiperModule } from 'swiper/angular';
import { VenuePageRoutingModule } from './venue-routing.module';

import { VenuePage } from './venue.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    PipesModule,
    CommonUIModule,
    VenuePageRoutingModule,
    SwiperModule, 
    
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [VenuePage]
})
export class VenuePageModule {}
