import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenuePage } from './venue.page';

const routes: Routes = [
  {
    path: '',
    component: VenuePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenuePageRoutingModule {}
