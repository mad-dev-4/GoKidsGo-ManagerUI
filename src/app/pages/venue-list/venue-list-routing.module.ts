import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VenueListPage } from './venue-list.page';

const routes: Routes = [
  {
    path: '',
    component: VenueListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenueListPageRoutingModule {}
