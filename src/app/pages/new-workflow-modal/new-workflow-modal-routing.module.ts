import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewWorkflowModalPage } from './new-workflow-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NewWorkflowModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewWorkflowModalPageRoutingModule {}
