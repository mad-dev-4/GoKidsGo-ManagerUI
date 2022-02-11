import { Component, OnInit } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
 
@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.page.html',
  styleUrls: ['./workflow-list.page.scss'],
})
export class WorkflowListPage implements OnInit {
  private _className = 'WorkflowListPage';

  // input parameter
  statusName: string = "";

  // data object
  workflowList = [];

  // Current signed in users email address & other objects
  usersEmail: string;
  pageNumber = 1;
  pageSize = 50;
  totalResultCount = 0;
  resultsOnPage = 0;

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
    this.logger.entry(this._className, 'ngOnInit');
    this.route.params.subscribe((params) => {
      this.statusName = params['status'];
      this.logger.trace(this._className, 'ngOnInit', 'status:' + this.statusName);
    });
  }
    
  /**
   * This method is called on every page view
   **/
   ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this._searchWorkflows();
  }


  /**
   * Navigate to the previous result set page
   */
  async previousPage() {
    this.pageNumber--;
    this.logger.entry(this._className, 'nextPage');
    this._searchWorkflows();
  }
  
  /**
   * Navigate to the next result set page
   */
  async nextPage() {
    this.pageNumber++;
    this.logger.entry(this._className, 'nextPage');
    this._searchWorkflows();
  }

  /**
   * This method loads workflows by the status
   **/
  async _searchWorkflows() {
    this.logger.entry(this._className, '_searchWorkflows');
    await this.pageHelper.showLoader();
    this.pageSize = 3;
    
    this.venueProvider.getWorkflowSearchByStatus(null, null, [this.statusName], this.pageNumber, this.pageSize).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();

        // Watch the form for changes, and
        if (resp != null && resp.dataList != null) {
          this.workflowList = resp.dataList;
          this.resultsOnPage = resp.dataList.length;
          this.totalResultCount = resp.dataResultCount;
          this.pageNumber = resp.page;
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._searchWorkflows();
        });
      }
    );
  }
  


  
}
