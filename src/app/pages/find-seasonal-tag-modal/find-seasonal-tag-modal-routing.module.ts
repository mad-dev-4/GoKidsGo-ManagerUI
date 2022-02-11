import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FindSeasonalTagModalPage } from './find-seasonal-tag-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FindSeasonalTagModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FindSeasonalTagModalPageRoutingModule {}
