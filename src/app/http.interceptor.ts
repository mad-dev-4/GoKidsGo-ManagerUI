import { Injectable } from "@angular/core";
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { LTCache } from '../providers/lt-cache';
import {
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse
} from '@angular/common/http';

/**
 * Api is a generic REST Http interceptor. 
 */
@Injectable()
export class InterceptedHttp implements HttpInterceptor {

	// APIs allowed to throw a 401 and 403 without forcing the user to the logon screen
	public API_WHITELIST_FOR_401: Array<string> = ["/api/ping", "/api/Jwt"];
	public API_NO_CONTENTYPE_HEADERS: Array<string> = ["/api/Image/Upload"];

	constructor(
		public cache: LTCache) {
	}



	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		let bearer = this.cache.getValue(this.cache.KEY_HEADER_TOKEN);

		if (bearer != null) {
			request = request.clone({ headers: request.headers.set('Authorization', "Bearer " + bearer) });
		}
		request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

		if (!this.isSetNoContentTypeHeader(request.url)) {
			request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
		}

		return next.handle(request).pipe(
			map((event: HttpEvent<any>) => {
				if (event instanceof HttpResponse) {
					console.log('event--->>>', event);
				}
				return event;
			}),

			catchError((error: HttpErrorResponse) => {
				/*
				let data = {};
				data = {
					reason: error && error.error && error.error.reason ? error.error.reason : '',
					status: error.status
				};
				*/

				// ignore a white list of APIs
				var stringUrl = request.url;
				if ((error.status === 401 || error.status === 403)
					&& (window.location.href.match(/\?/g) || []).length < 2
					&& !this.isOnWhiteList(stringUrl)) {
					console.log('TRACE: InterceptedHttp.request.status: 401 or 403 returned from request: ' + stringUrl);
					return throwError("Unauthorized_401");
				}
				else if (error.status === 0) {
					console.log('TRACE: InterceptedHttp.request.status: 0 returned from request: ' + stringUrl);
					return throwError("Unreachable_0");
				}

				/* 
				 * send logged out signal.  We don't want to redirect the whole app to the login page
				 * because it could be very disruptive.  We just want to pop up a modal and ask the user
				 * to login again.  When successful, then the modal is removed.
				 */
				//this.authObservable.sendMessage(this.authObservable.Message_Unauthorized);
				//this.dismissObserver.next({"url":url, "options":options});

				return throwError(error);
			}));

	}

	/*
	 * Returns true if the given URL ends with something on our whitelist. 
	 * The whitelist allows URLs to throw a 401 or 403 without forcing the user to logon again.
	 */
	private isOnWhiteList(url: string) {
		for (var i = 0; i < this.API_WHITELIST_FOR_401.length; i++) {
			if (url.endsWith(this.API_WHITELIST_FOR_401[i])) {
				return true;
			}
		}
	}

	/*
	* Returns true if the given URL ends with something on our ignore content-type list. 
	* The whitelist tells the system not to set the content-type header for a given url.
	*/
	private isSetNoContentTypeHeader(url: string) {
		for (var i = 0; i < this.API_NO_CONTENTYPE_HEADERS.length; i++) {
			if (url.endsWith(this.API_NO_CONTENTYPE_HEADERS[i])) {
				return true;
			}
		}
	}
	
}
