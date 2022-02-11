import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindCategoryModalPage } from './find-category-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindCategoryModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindCategoryModalPageRoutingModule {}
