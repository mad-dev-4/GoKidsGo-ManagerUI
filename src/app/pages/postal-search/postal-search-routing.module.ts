import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostalSearchPage } from './postal-search.page';

const routes: Routes = [
  {
    path: '',
    component: PostalSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostalSearchPageRoutingModule {}
