import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobLogsListPage } from './job-logs-list.page';

const routes: Routes = [
  {
    path: '',
    component: JobLogsListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobLogsListPageRoutingModule {}
