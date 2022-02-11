import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobsListPage } from './jobs-list.page';

const routes: Routes = [
  {
    path: '',
    component: JobsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsListPageRoutingModule {}
