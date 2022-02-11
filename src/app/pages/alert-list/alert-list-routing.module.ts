import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AlertListPage } from './alert-list.page';

const routes: Routes = [
  {
    path: '',
    component: AlertListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertListPageRoutingModule {}
