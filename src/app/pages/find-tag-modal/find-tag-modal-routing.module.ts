import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindTagModalPage } from './find-tag-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindTagModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindTagModalPageRoutingModule {}
