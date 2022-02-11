import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-new-workflow-modal',
  templateUrl: './new-workflow-modal.page.html',
  styleUrls: ['./new-workflow-modal.page.scss'],
})
export class NewWorkflowModalPage implements OnInit {
  private _className = 'NewWorkflowModalPage';

  @Input() venueId: string = null;
  @Input() locationId: string = null;

  // Current signed in users email address
  usersEmail: string;

  // flag if data is ready to be saved
  isReadyToSave = false;

  // object being created
  workflow: any = {
    id: null,
    venueId: null,
    locationId: null,
    name: null,
    initialEvent: {
      actionTakerUserId: null,
      note: null,
      adminNotes: null
    }
  };

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  }


  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.workflow.locationId = this.locationId;
    this.workflow.venueId = this.venueId;
    this.logger.trace(this._className, 'ngOnInit', 'ngOnInit this.locationId:' + this.workflow.locationId);
    this.logger.trace(this._className, 'ngOnInit', 'ngOnInit this.venueId:' + this.workflow.venueId);
  }


  /**
   * Close and do not save
   */
  closeModal() {
    this.modalCtrl.dismiss({});
  }

  /**
   * Called when data changes on a field
   */
  dataChanged() {
    this.logger.entry(this._className, 'dataChanged');
    this.isReadyToSave = this.workflow.name != '' && this.workflow.initialEvent.node != '';
  }

  /**
   * Closes the modal and saves changes
   */
  closeAndSaveSelections() {
    this.logger.entry(this._className, 'closeAndSaveSelections,');
    this.dataChanged();
    if (this.isReadyToSave) {
      this.createWorkflow();
    }
  }


  /**
   * Creates a workflow in the system
   */
  async createWorkflow() {
    this.logger.entry(this._className, 'createWorkflow');
    await this.pageHelper.showSaver();

    this.venueProvider.createWorkflow(this.workflow).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.workflow.id = resp.id;
        this.modalCtrl.dismiss({ createdElement: this.workflow });
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

}
