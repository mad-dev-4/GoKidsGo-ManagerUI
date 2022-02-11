import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindLocationModalPage } from './find-location-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindLocationModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindLocationModalPageRoutingModule {}
