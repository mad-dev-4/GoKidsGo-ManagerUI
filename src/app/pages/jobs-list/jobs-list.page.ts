import { Component, OnInit } from '@angular/core';
import { Scheduler } from '../../../providers/scheduler';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.page.html',
  styleUrls: ['./jobs-list.page.scss'],
})
export class JobsListPage implements OnInit {
  private _className = 'JobsListPage';

  // data object
  jobs = [];
  schedulerInfo:any = {};

  // Current signed in users email address
  usersEmail: string;

  // text strings
  textJobRunSuccess: string = 'Success';
  textJobDeleteSuccess: string = 'Success';

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
    this.translateService.get('JOB_RUN_SUCCESS').subscribe((value) => {
      this.textJobRunSuccess = value;
    });
    this.translateService.get('JOB_REMOVED_SUCCESS').subscribe((value) => {
      this.textJobDeleteSuccess = value;
    });
  } // end constructor

  ngOnInit() { }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._listJobs();
  }

  async runJobNow(scheduledJobId) {
    this.logger.entry(this._className, 'runJobNow');
    await this.pageHelper.showSaver();

    // Load the users profile and update the UI
    this.schedulerProvider.runJobNow(scheduledJobId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.pageHelper.showAlertDialog(this.textJobRunSuccess);
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * This method loads scheduled jobs
   **/
  async _listJobs() {
    this.logger.entry(this._className, '_listJobs');
    await this.pageHelper.showLoader();

    this.schedulerProvider.getActiveJobs().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.jobs = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._listJobs();
        });
      }
    );

    this.schedulerProvider.getSchedulerInformation().subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.schedulerInfo = resp;
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {});
      }
    );
  }

  /**
   * Refreshes the jobs on the screen.  Is a button in the header.
   * @param eventValue 
   */
  async refreshJobs(eventValue) {
    this._listJobs();
  }

  /**
  * On button click, takes the user to a new postal code page
  */
  async createNewJob(eventValue) {
    this.router.navigate(['job'], {});
  }

  /**
   * Removes a job from the system
   * @param jobId unique job id
   */
  async removeJob(scheduledJobId) {
    this.logger.entry(this._className, 'removeJob');
    await this.pageHelper.showSaver();

    // Load the users profile and update the UI
    this.schedulerProvider.removeJob(scheduledJobId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.pageHelper.showAlertDialog(this.textJobDeleteSuccess);
        this._listJobs();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }
}
