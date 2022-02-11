import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindAmenityModalPage } from './find-amenity-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindAmenityModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindAmenityModalPageRoutingModule {}
