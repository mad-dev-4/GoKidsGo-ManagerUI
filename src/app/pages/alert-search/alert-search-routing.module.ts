import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlertSearchPage } from './alert-search.page';

const routes: Routes = [
  {
    path: '',
    component: AlertSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertSearchPageRoutingModule {}
