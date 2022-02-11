import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageManagementPage } from './image-management.page';

const routes: Routes = [
  {
    path: '',
    component: ImageManagementPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageManagementPageRoutingModule {}
