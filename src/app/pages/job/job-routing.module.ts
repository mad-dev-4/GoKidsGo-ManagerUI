import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JobPage } from './job.page';

const routes: Routes = [
  {
    path: '',
    component: JobPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobPageRoutingModule {}
