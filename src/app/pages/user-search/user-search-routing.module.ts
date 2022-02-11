import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserSearchPage } from './user-search.page';

const routes: Routes = [
  {
    path: '',
    component: UserSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserSearchPageRoutingModule {}
