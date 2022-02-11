import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkflowEventPage } from './workflow-event.page';

const routes: Routes = [
  {
    path: '',
    component: WorkflowEventPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkflowEventPageRoutingModule {}
