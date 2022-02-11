import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostalPage } from './postal.page';

const routes: Routes = [
  {
    path: '',
    component: PostalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostalPageRoutingModule {}
