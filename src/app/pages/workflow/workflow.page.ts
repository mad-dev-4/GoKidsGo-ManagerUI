import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.page.html',
  styleUrls: ['./workflow.page.scss'],
})
export class WorkflowPage implements OnInit {
  private _className = 'WorkflowPage';

  // param passed in
  workflowId;

  // flag to symbolize if a workflow can be closed
  canCloseWorkflow = true;

  // data objects
  workflow: any = {};
  workflowEventList = [];
  venueOrLocation: any = {};

  // Current signed in users email address 
  usersEmail: string;

  // new event fields
  newEventActionTaker = '';
  newEventNotes = '';


  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router) {

    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, "ngOnInit");
    this.route.params.subscribe((params) => {
      this.workflowId = params['id'];
      this.logger.trace(this._className, 'ngOnInit id:' + this.workflowId);
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._getWorkflow();
  }

  /**
   * Saves a new event
   */
  async saveEvent() {
    this.logger.entry(this._className, 'saveEvent');
    await this.pageHelper.showSaver();

    const workflowEvent = { "note": this.newEventNotes, "actionTakerUserId": this.newEventActionTaker };
    this.venueProvider.createWorkflowEvent(this.workflowId, workflowEvent).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.newEventNotes = '';
        this.newEventActionTaker = '';
        this._getWorkflow();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * This method loads workflow by this.workflowId
   **/
  async _getWorkflow() {
    this.logger.entry(this._className, '_getWorkflow');
    await this.pageHelper.showLoader();

    this.venueProvider.getWorkflowById(this.workflowId).subscribe(
      (resp) => {
        if (resp.venueId != null && resp.venueId !== "00000000-0000-0000-0000-000000000000") {
          this._getVenue(resp.venueId);
        } else if (resp.locationId != null && resp.locationId !== "00000000-0000-0000-0000-000000000000") {
          this._getLocation(resp.locationId);
        }
        this.pageHelper.hideLoader();
        this.workflow = resp;
        this.canCloseWorkflow = (resp.status != 'Closed' && resp.status != 'Cancelled');
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getWorkflow();
        });
      }
    );
  }

  /**
   * Button action to approve and close a workflow (if it allows)
   */
  async closeAndApproveWorkflow() {
    this.logger.entry(this._className, 'closeAndApproveWorkflow');
    await this.pageHelper.showSaver();

    const workflowEvent = { "note": "Approved and closing workflow" };
    this.venueProvider.createWorkflowEvent(this.workflowId, workflowEvent).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.approveWorkflow();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * Closes a workflow
   */
  async approveWorkflow() {
    this.logger.entry(this._className, 'approveWorkflow');
    await this.pageHelper.showSaver();

    this.venueProvider.updateWorkflowStatus(this.workflowId, "Closed").subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.workflow.status = "Closed";
        this.canCloseWorkflow = false;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this.approveWorkflow();
        });
      }
    );
  }


  /**
   * This method load a venue
   **/
  async _getVenue(venueId) {
    this.logger.entry(this._className, '_getVenue');
    this.venueProvider.getSimpleVenueById(venueId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.venueOrLocation = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getVenue(venueId);
        });
      }
    );
  }// end get venue


  /**
   * This method loads a location
   **/
  async _getLocation(locationId) {
    this.logger.entry(this._className, '_getLocation');
    this.venueProvider.getLocationById(locationId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.venueOrLocation = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getLocation(locationId);
        });
      }
    );
  }// end get location
}
