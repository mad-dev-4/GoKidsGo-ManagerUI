import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkflowEventPageRoutingModule } from './workflow-event-routing.module';

import { WorkflowEventPage } from './workflow-event.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkflowEventPageRoutingModule
  ],
  declarations: [WorkflowEventPage]
})
export class WorkflowEventPageModule {}
