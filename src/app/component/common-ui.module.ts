import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HeaderComponent } from './header/header.component';
import { VenueCardComponent } from './venue-card/venue-card.component';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { CategoryTreeComponent } from './category-tree/category-tree.component';
import { CategoryLevelComponent } from './category-level/category-level.component';

import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SwiperModule } from 'swiper/angular';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    HeaderComponent,
    ImageGalleryComponent,
    VenueCardComponent,
    CategoryTreeComponent,
    CategoryLevelComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    SwiperModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  exports: [
    HeaderComponent,
    ImageGalleryComponent,
    VenueCardComponent,
    CategoryTreeComponent,
    CategoryLevelComponent,
  ],
})
export class CommonUIModule {}
