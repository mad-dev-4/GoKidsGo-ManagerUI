import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LTCache } from './lt-cache';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

/*
  Used to manage venue data
*/
@Injectable()
export class Scheduler {
  url: string = environment.schedulerUrl;

  constructor(public http: HttpClient, public cache: LTCache) {}

  /**
   * Gets all the jobs in the database
   * @returns a promise
   */
  getActiveJobs() {
    const query = this.http.get<any>(this.url + 'Scheduler/Jobs').pipe(
      tap((res) => {
        console.log('getActiveJobs() successfull', res);
      })
    );
    return query;
  }

  /**
   * This method is usefull mainly to get scheduler time.
   * @returns Information about a specific scheduler node
   */
  getSchedulerInformation() {
    const query = this.http.get<any>(this.url + 'Scheduler/TransientInfo').pipe(
      tap((res) => {
        console.log('getSchedulerInformation() successfull', res);
      })
    );
    return query;
  }

  /**
   * Returns all logs for a job
   * @param scheduledJobsId unique id of a scheduled job
   * @param pageSize number of results to return
   * @param pageNumber page number of the result set
   * @returns a promise
   */
  getJobLog(
    scheduledJobsId: number,
    pageSize: number = 10,
    pageNumber: number = 1
  ) {
    const params = {
      scheduledJobsId: scheduledJobsId,
      pageSize: pageSize,
      pageNumber: pageNumber,
    };
    const query = this.http
      .get<any>(this.url + 'Scheduler/Logs', { params: params })
      .pipe(
        tap((res) => {
          console.log('getJobLog() successfull', res);
        })
      );
    return query;
  }

  /**
   * Tells the system to run a specific in memory job now instead of waiting for the schedule
   * @param scheduledJobsId unique id of a scheduled job
   * @returns a promise
   */
  runJobNow(scheduledJobsId: number) {
    const query = this.http
      .put<any>(this.url + 'Scheduler/RunNow/' + scheduledJobsId, null)
      .pipe(
        tap((res) => {
          console.log('runJobNow() successfull', res);
        })
      );
    return query;
  }
  
  /**
   * Tells the system to disable a specific job 
   * @param scheduledJobsId unique id of a scheduled job
   * @returns a promise
   */
   removeJob(scheduledJobsId: number) {
    const query = this.http
      .delete<any>(this.url + 'Scheduler/Disable/' + scheduledJobsId, {})
      .pipe(
        tap((res) => {
          console.log('removeJob() successfull', res);
        })
      );
    return query;
  }
  

  /**
   * Tells the system to shutdown the scheduler. Only works for 1 scheduler instance
   * @returns a promise
   */
  startShutdownNow() {
    const query = this.http
      .put<any>(this.url + 'Scheduler/Shutdown', null)
      .pipe(
        tap((res) => {
          console.log('startShutdownNow() successfull', res);
        })
      );
    return query;
  }

  /**
   * Performs a log clcean up in the system.
   * @param jobsOlderThan How old the logs are that should be removed from the system
   * @returns a promise
   */
  removeOldJobs(jobsOlderThan: number = 5) {
    const params = {
      olderThanDays: jobsOlderThan,
    };
    const query = this.http
      .delete<any>(this.url + 'Scheduler/Log', { params: params })
      .pipe(
        tap((res) => {
          console.log('removeOldJobs() successfull', res);
        })
      );
    return query;
  }

  /**
   * This method creates a job that will be saved in the database and be picked up by any scheduler.
   * It can run multiple times and even on reboot.
   * {
   * "identifier": "Persisted Job",
   * "name": "Persisted Job",
   * "description": "Input for testing",
   * "className": "Scheduler.Business_Logic.Scheduler.CheckForUpdatesJob",
   * "restDuration": 5,
   * "everyNumOfHours": 0,
   * "everyNumOfMinutes": 5,
   * "specificTimeOfDay": null,
   * "failureRetrySeconds": -1,
   * "maxNumberOfRuns": 0  ,
   * "jobParameters": null,
   * "logActivity": true
   * }
   * @param formObject object to post to create a job
   * @returns
   */
  addJobToDatabase(formObject: any) {
    formObject.active = true;

    const query = this.http
      .post<any>(this.url + 'Scheduler/Add', formObject)
      .pipe(
        tap((res) => {
          console.log('addJobToDatabase() successfull', res);
        })
      );
    return query;
  }

  /**
   * This method creates a job that will be run immediatly and not saved to disk.  Will not run if schedulers are rebooted.
   * {
   * "identifier": "Persisted Job",
   * "name": "Persisted Job",
   * "description": "Input for testing",
   * "className": "Scheduler.Business_Logic.Scheduler.CheckForUpdatesJob",
   * "restDuration": 5,
   * "everyNumOfHours": 0,
   * "everyNumOfMinutes": 5,
   * "specificTimeOfDay": null,
   * "failureRetrySeconds": -1,
   * "maxNumberOfRuns": 0  ,
   * "jobParameters": null,
   * "logActivity": true
   * }
   * @param formObject object to post to create a job
   * @returns
   */
  addJobToMemory(formObject: any) {
    formObject.active = true;

    const query = this.http
      .post<any>(this.url + 'Scheduler/AddTransient', formObject)
      .pipe(
        tap((res) => {
          console.log('addJobToMemory() successfull', res);
        })
      );
    return query;
  }
}
