import { Component, OnInit } from '@angular/core';
import { Scheduler } from '../../../providers/scheduler';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-job',
  templateUrl: './job.page.html',
  styleUrls: ['./job.page.scss'],
})
export class JobPage implements OnInit {
  private _className = 'JobsListPage';

  jobList = [];

  selectedJob: any = {
    identifier: null,
    description: "",
    jobParameters: "",
  }

  specificStartTime = false;

  // text strings
  savedSuccessfully = "Saved successfully";

  // Current signed in users email address
  usersEmail: string;

  constructor(
    public schedulerProvider: Scheduler,
    public cache: LTCache,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router,
    public translateService: TranslateService
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;

    // language fallback
    translateService.setDefaultLang('en');
    // load text strings
    this.translateService
      .get('JOB_SUCCESS_CREATED')
      .subscribe((value) => {
        this.savedSuccessfully = value;
      });

  } // end constructor

  ngOnInit() {
  }

  /**
 * This method is called on every page view
 **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._listJobs();
  }

  /**
* This method loads scheduled jobs
**/
  async _listJobs() {
    this.logger.entry(this._className, '_listJobs');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.schedulerProvider.getActiveJobs().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.jobList = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._listJobs();
        });
      }
    );
  }

  /**
   * Called when the job menu is changed
   * @param event 
   */
  async jobSelectionChange(event) {
    this.logger.entry(this._className, 'jobSelectionChange', this.selectedJob.jobParameters);
    if (event && event.target.value) {
      this.jobList.forEach(element => {

        if (element.id == event.target.value) {
          this.logger.trace(this._className, 'jobSelectionChange', 'selected: ' + element.id);

          this.selectedJob = {
            identifier: element.identifier,
            name: element.name,
            description: element.description,
            className: element.className,
            failureRetrySeconds: -1,
            maxNumberOfRuns: 1,
            logActivity: true,
            active: true,
            jobParameters: element.jobParameters
          };
        }
      });
    }
  }

  /**
   * This method validates the input entered and attempts to create the job in the system.
   */
  async createJob() {
    this.logger.entry(this._className, 'createJob', this.selectedJob);

    await this.pageHelper.showSaver();
    if (this.selectedJob.identifierOrig == null) {
      this.selectedJob.identifierOrig = this.selectedJob.identifier;
      this.selectedJob.identifier = this.selectedJob.identifier + '_' + Date.now();
    }else {
      this.selectedJob.identifier = this.selectedJob.identifierOrig + '_' + Date.now();
    }
    this.schedulerProvider.addJobToDatabase(this.selectedJob).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.pageHelper.showToast(this.savedSuccessfully);
        // go back to the job list page
        this.router.navigate(['jobs-list'], {});
      },
      (err) => {
        this.pageHelper
          .processRequestError(err, null)
          .subscribe((resp) => { });
      }
    );
  }

}
