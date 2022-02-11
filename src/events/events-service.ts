import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private fooSubject = new Subject<any>();

  /**
   * Publish data for this event.  Example:  
   * this.events.publish({ 'user': 'sessionExpired', 'errorMessageKey': 'SESSION_EXPIRED', 'observable': this.reloadObservable });
   * @param data 
   */
  publish(data: any) {
    this.fooSubject.next(data);
  }

  getObservable(): Subject<any> {
    return this.fooSubject;
  }
}
