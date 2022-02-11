import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BrowseVenuesPage } from './browse-venues.page';

const routes: Routes = [
  {
    path: '',
    component: BrowseVenuesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BrowseVenuesPageRoutingModule {}
