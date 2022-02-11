import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewTagModalPage } from './new-tag-modal.page';

const routes: Routes = [
  {
    path: '',
    component: NewTagModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewTagModalPageRoutingModule {}
