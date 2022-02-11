import { Component, OnInit } from '@angular/core';
import { Scheduler } from '../../../providers/scheduler';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-job-logs-list',
  templateUrl: './job-logs-list.page.html',
  styleUrls: ['./job-logs-list.page.scss'],
})
export class JobLogsListPage implements OnInit {
  private _className = 'JobLogsListPage';

  // data object
  logs = [];
  scheduledJobsId: number = 0;
  pageNumber: number = 1;
  pageSize: number = 10;
  dataResultCount: number = 0;

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
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.params.subscribe((params) => {
      this.scheduledJobsId = params['id'];
      this.logger.entry(
        this._className,
        'ngOnInit this.scheduledJobsId:' + this.scheduledJobsId
      );
    });
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._listLogs();
  }

  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.pageNumber--;
    this.logger.entry(this._className, 'previousPage');
    this._listLogs();
  }

  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._listLogs();
  }

  /**
   * This method loads scheduled job logs
   **/
  async _listLogs() {
    this.logger.entry(this._className, '_listJobs');
    await this.pageHelper.showLoader();

    // Load the users profile and update the UI
    this.schedulerProvider
      .getJobLog(this.scheduledJobsId, this.pageSize, this.pageNumber)
      .subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.logs = resp.dataList;
          this.dataResultCount = resp.dataResultCount;
          this.pageNumber = resp.page;
          this.pageSize = resp.pageSize;
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => {
            this._listLogs();
          });
        }
      );
  }
}
