import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LTCache } from './lt-cache';
import { environment } from '../environments/environment';
import { HttpParams, HttpClient } from '@angular/common/http';

/*
  Used to manage user data
*/
@Injectable()
export class Rating {

  url: string = environment.ratingUrl;

  constructor(public http: HttpClient, public cache: LTCache) { }

  /**
   * @returns a list of user favorite venues providers
   */
  getUserFavorites(
    pageSize: number = 10,
    pageNumber: number = 1) {
    let params = {
      pageNumber: pageNumber,
      pageSize: pageSize,
    };
    const query = this.http
      .get<any>(this.url + 'Rating/User/Favorites', { params: params })
      .pipe(tap((res) => { }));
    return query;
  }

  /**
   * @param venueId, a unique Guid of a venue
   * @returns a users rating of a specific venue
   **/
  getUserVenueRating(venueId: string) {
    const query = this.http.get<any>(this.url + 'Rating/User/Venue/' + venueId)
      .pipe(tap((res) => { }));
    return query;
  }

  /**
   * @param venueId, a unique Guid of a venue
   * @returns a rating for a specific venue
   **/
  getVenueRatings(venueId: string) {
    const query = this.http.get<any>(this.url + 'Rating/Venue/' + venueId)
      .pipe(tap((res) => { }));
    return query;
  }

  /**
   * Returns a tuple.  item1 is the venue rating.  item2 is the user rating of the venue
   * @param venueId, a unique Guid of a venue
   * @returns a rating for a specific venue as well as the user rating of the venue
   **/
   getVenueAndUserRatingsCombined(venueId: string) {
    const query = this.http.get<any>(this.url + 'Rating/User/With/Venue/' + venueId)
      .pipe(tap((res) => { }));
    return query;
  }

  /**
   * A end user action.  Likes or dislikes a specific venue.
   * @param venueId, a unique Guid of a venue
   * @param action, like, dislike or clear
   * @returns a promise (ok on success)
   */
  setVenueApproval(venueId: string, action: string) {
    const params = { venueId: venueId, action: action };
    const query = this.http
      .put<any>(this.url + 'Rating/Venue/Approval', params)
      .pipe(
        tap((res) => {
          console.log('setVenueApproval() successfull', res);
        })
      );
    return query;
  }

  /**
* A end user action.  The user can 'love' (or favorite) a venue. A user cannot hate a venue 
* @param venueId, a unique Guid of a venue
* @param loveFavorite, true to love, false to not love
* @returns a promise (ok on success)
*/
  setVenueFavorite(venueId: string, loveFavorite: boolean) {
    const params = { venueId: venueId, loveFavorite: loveFavorite };
    const query = this.http
      .put<any>(this.url + 'Rating/Venue/Favorite', params)
      .pipe(
        tap((res) => {
          console.log('setVenueFavorite() successfull', res);
        })
      );
    return query;
  }
}
