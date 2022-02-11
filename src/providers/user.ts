import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LTCache } from './lt-cache';
import { environment } from '../environments/environment';
import { HttpParams, HttpClient } from '@angular/common/http';

/*
  Used to manage user data
*/
@Injectable()
export class User {

	url: string = environment.identityUrl;
  
	constructor(public http: HttpClient, public cache: LTCache) { }

  /**
   * Process a login/signup response to store user data
   **/
   _loggedIn(resp) {
    var email = resp[this.cache.KEY_USER_LOGIN_EMAIL];
    var token = resp[this.cache.KEY_HEADER_TOKEN];
    var userId = resp[this.cache.KEY_USER_LOGIN_ID];
    this.cache.setValue(this.cache.KEY_USER_LOGIN_EMAIL,email);
    this.cache.setValue(this.cache.KEY_USER_LOGIN_ID,userId);
    this.cache.setValue(this.cache.KEY_HEADER_TOKEN,token);
  }

  /**
   * Log the user out, which forgets the session
   **/
  logout() {
    this.cache.removeKey(this.cache.KEY_USER_LOGIN_EMAIL);
    this.cache.removeKey(this.cache.KEY_USER_LOGIN_ID);
    this.cache.removeKey(this.cache.KEY_HEADER_TOKEN);
  }

	/**
	 * @returns a list of IDP providers
	 */
	getIDPs() {
		const query = this.http
		  .get<any>(this.url + 'IDP', { })
		  .pipe(tap((res) => { }));
		return query;
	  }

  /**
   * Exchanges an existing live JWT with a new one
   **/
   getExchangeJWT() {
    const query = this.http.get<any>(this.url + 'Jwt/Refresh').pipe(
      tap((res) => {
        console.log('getExchangeJWT() successfull', res);
        if (res[this.cache.KEY_HEADER_TOKEN] != null) {
          this._loggedIn(res);
        }
      })
    );
    return query;
  }
  
  /**
   * Gets a JWT for development only.
   **/
   getDevJWT() {
    const query = this.http.get<any>(this.url + 'JwtDev').pipe(
      tap((res) => {
        console.log('getDevJWT() successfull', res);
        if (res[this.cache.KEY_HEADER_TOKEN] != null) {
          this._loggedIn(res);
        }
      })
    );
    return query;
  }

  /**
   * Searches for users.
   * An example input object to this method:
   *
   * {
   *   "id": "string",
   *   "firstName":"string",
   *   "lastName":"string",
   *   "email":"string",
   *   "idp":"string",
   *   "active":"bool",
   *   "minLastSeenDate":"DateTime",
   *   "pageNumber":"number",
   *   "pageSize":"number"
   * }
   * @param queryParameters parameters to be passed to the getUser search API
   * @returns a promise
   */
  getSearchUser(queryParameters: any) {
    let params: HttpParams = new HttpParams();
    for (const key in queryParameters) {
      if (queryParameters[key] != null && queryParameters[key] != undefined) {
        params = params.append(key, queryParameters[key]);
        //console.log(`${key}: ${queryParameters[key]}`);
      }
    }
    const query = this.http
      .get<any>(this.url + 'UserAdmin', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchUser() successfull', res);
        })
      );
    return query;
  }

  /**
   * @returns The current logged in users profile
   */
  getMyProfile() {
    const query = this.http
      .get<any>(this.url + 'User', {  })
      .pipe(
        tap((res) => {
          console.log('getMyProfile() successfull', res);
        })
      );
    return query;
  }

  /**
   * Requests cookies to be deleted
   * @returns Ok on success 
   */
  logoutUser() {
    const query = this.http
      .delete<any>(this.url + 'User', {  })
      .pipe(
        tap((res) => {
          console.log('logoutUser() successfull', res);
          this.logout();
        })
      );
    return query;
  }
}
