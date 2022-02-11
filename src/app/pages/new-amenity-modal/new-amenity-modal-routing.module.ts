import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewAmenityModalPage } from './new-amenity-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NewAmenityModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewAmenityModalPageRoutingModule {}
