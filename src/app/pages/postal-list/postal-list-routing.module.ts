import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostalListPage } from './postal-list.page';

const routes: Routes = [
  {
    path: '',
    component: PostalListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostalListPageRoutingModule {}
