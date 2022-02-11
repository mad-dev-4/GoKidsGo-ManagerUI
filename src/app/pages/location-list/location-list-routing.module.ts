import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocationListPage } from './location-list.page';

const routes: Routes = [
  {
    path: '',
    component: LocationListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocationListPageRoutingModule {}
