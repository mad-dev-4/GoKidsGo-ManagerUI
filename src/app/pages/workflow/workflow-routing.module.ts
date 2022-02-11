import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowPage } from './workflow.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowPageRoutingModule {}
