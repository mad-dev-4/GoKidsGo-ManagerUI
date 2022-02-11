import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TagSearchPage } from './tag-search.page';

const routes: Routes = [
  {
    path: '',
    component: TagSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TagSearchPageRoutingModule {}
