import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { LTCache } from './lt-cache';
import { Observable } from 'rxjs';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

/*
  Used to manage venue data
*/
@Injectable()
export class Venue {
  url: string = environment.venueUrl;

  constructor(public http: HttpClient, public cache: LTCache) { }


  /**
   * An internal helper to add parameter values if the obj is not null
   * @param params HttpParams object
   * @param appendString string name of the param to add
   * @param obj the value to add if not null
   * @returns the params object
   */
  private addP(params, appendString, obj) {
    if (obj != null) {
      params = params.append(appendString, obj);
    }
    return params;
  }

  /**
   * Gets top categories.
   * @returns a promise
   */
  getTopNCategories() {
    const params = { lang: 'en' };
    const query = this.http
      .get<any>(this.url + 'Category/TopN', { params: params })
      .pipe(tap((res) => { }));
    return query;
  }

  /**
   * Gets all direct children of the specified category 
   * @param parentCategoryId GUID of the parent category
   * @returns a promise
   */
  getChildrenCategories(parentCategoryId) {
    const params = { lang: 'en' };
    const query = this.http
      .get<any>(this.url + 'Category/Children/' + parentCategoryId, { params: params })
      .pipe(tap((res) => { }));
    return query;
  }


  /**
  * @param updateData A job object with values to update for the category
  * @returns a promise
  */
  saveCategory(updateData) {
    const query = this.http.put<any>(this.url + 'Category', updateData).pipe(
      tap((res) => {
        console.log('saveCategory() successfull', res);
      })
    );
    return query;
  }

  /**
   * Deletes a category in the system
   * @param categoryUniqueId Unique Id of a category
   * @returns a promise
   */
  deleteCategory(categoryUniqueId) {
    const query = this.http.delete<any>(this.url + 'Category/' + categoryUniqueId).pipe(
      tap((res) => {
        console.log('deleteCategory() successfull', res);
      })
    );
    return query;
  }

  /**
  * @param updateData A job object with values to create a category
  * @returns a promise
  */
  createCategory(updateData) {
    const query = this.http.post<any>(this.url + 'Category', updateData).pipe(
      tap((res) => {
        console.log('createCategory() successfull', res);
      })
    );
    return query;
  }

  /**
   * Gets tags by name search
   * @param tagNameStartsWith
   * @param id
   * @param searchable
   * @param viewable
   * @param tagType is one of HASHTAG or SEASONAL
   * @returns a promise
   */
  getTags(
    tagNameStartsWith: string = null,
    id: string = null,
    searchable: boolean = null,
    viewable: boolean = null,
    resultsPerPage: number = 10,
    pageNumber: number = 1,
    tagType: string = "HASHTAG"
  ) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      lang: 'en',
      pageNumber: pageNumber,
      pageSize: resultsPerPage,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'nameStartsWith', tagNameStartsWith);
    params = this.addP(params, 'id', id);
    params = this.addP(params, 'searchable', searchable);
    params = this.addP(params, 'viewable', viewable);

    if (tagType == "SEASONAL") {
      const query = this.http.get<any>(this.url + 'Seasonal', { params: params }).pipe(
        tap((res) => {
          console.log('getTags() successfull', res);
        })
      );
      return query;
    } else {
      const query = this.http.get<any>(this.url + 'Tag', { params: params }).pipe(
        tap((res) => {
          console.log('getTags() successfull', res);
        })
      );
      return query;
    }
  }

  /**
   * @returns A list of audit entity types
   */
  getAuditEntityTypes() {
    const query = this.http.get<any>(this.url + 'Audit/EntityType').pipe(
      tap((res) => {
        console.log('getAuditEntityTypes() successfull', res);
      })
    );
    return query;
  }

  /**
   * An example input object to this method:
   *
   * {
   *   "id": "string",
   *   "entityType":"string",
   *   "userIdentifier":"string",
   *   "minUpdatedDate":"string",
   *   "maxUpdatedDate":"string",
   *   "pageNumber":"number",
   *   "pageSize":"number"
   * }
   * @param queryParameters parameters to be passed to the getPostalCode search API
   * @returns a promise
   */
  getSearchAudit(queryParameters: any) {
    let params: HttpParams = new HttpParams();
    for (const key in queryParameters) {
      if (queryParameters[key] != null && queryParameters[key] != undefined) {
        params = params.append(key, queryParameters[key]);
        //console.log(`${key}: ${queryParameters[key]}`);
      }
    }
    const query = this.http
      .get<any>(this.url + 'Audit', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchAudit() successfull', res);
        })
      );
    return query;
  }

  /**
   * An example input object to this method:
   *
   * {
   *  pageSize: '50',
   *  pageNumber: 1,
   *  id: "number",
   *  city: "string",
   *  postalCode: "string",
   *  provinceABBR: "string",
   *  minLatitude: "number",
   *  maxLatitude: "number",
   *  minLongitude: "number",
   *  maxLongitude: "number"
   * };
   * @param queryParameters parameters to be passed to the getPostalCode search API
   * @returns a promise
   */
  getSearchPostalCode(queryParameters: any) {
    let params: HttpParams = new HttpParams();
    for (const key in queryParameters) {
      if (queryParameters[key] != null && queryParameters[key] != undefined) {
        params = params.append(key, queryParameters[key]);
        //console.log(`${key}: ${queryParameters[key]}`);
      }
    }
    const query = this.http
      .get<any>(this.url + 'PostalCode', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchPostalCode() successfull', res);
        })
      );
    return query;
  }

  /**
   * Gets amenities.
   **/
  getSearchAmenitiesFuzy(searchString: string = '', id: string = null, pageNumber: number = 1, pageSize: number = 50) {
    let params: HttpParams = new HttpParams();
    const constParams = {
      lang: 'en',
      pageNumber: pageNumber,
      pageSize: pageSize,
      searchString: searchString,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'id', id);

    const query = this.http
      .get<any>(this.url + 'Amenity', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchAmenitiesFuzy() successfull', res);
        })
      );
    return query;
  }

  /**
   * Searches for a venue
   * venueObj = {
   *   "id": "string",	
   *   "locationId": "string",	
   *   "description": "string", 
   *   "title": "string",	
   *   "name": "string", 
   *   "categoryId": "string", 
   *   "active": "boolean", 
   *   "hidden": "boolean", 
   *   "latitude": "number",
   *   "longitude": "number",
   *   "postalCode": "string",
   *   "distance": "number",
   *   "pageSize": "number", 
   *   "pageNumber": "number"
   * }
   * @param venueObj 	the venue search data object
   * @param fetchTags set to true to return venue tags
   * @param fetchAmenities set to true to return venue amenities
   * @param fetchLocation set to true to return venue location
   * @param fetchImages set to true to return venue images
   */
  getSearchVenue(venueObj: any, fetchTags = false, fetchAmenities = false, fetchLocation = false, fetchImages = false) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      lang: 'en',
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'distance', venueObj.distance);
    params = this.addP(params, 'postalCode', venueObj.postalCode);
    params = this.addP(params, 'pageSize', venueObj.pageSize);
    params = this.addP(params, 'pageNumber', venueObj.pageNumber);
    params = this.addP(params, 'description', venueObj.description);
    params = this.addP(params, 'active', venueObj.active);
    params = this.addP(params, 'hidden', venueObj.hidden);
    params = this.addP(params, 'title', venueObj.title);
    params = this.addP(params, 'locationId', venueObj.locationId);
    params = this.addP(params, 'id', venueObj.id);
    params = this.addP(params, 'name', venueObj.name);
    params = this.addP(params, 'categoryId', venueObj.categoryId);
    params = this.addP(params, 'latitude', venueObj.latitude);
    params = this.addP(params, 'longitude', venueObj.longitude);

    params = fetchTags ? this.addP(params, 'key[tags]', true) : params;
    params = fetchAmenities ? this.addP(params, 'key[amenities]', true) : params;
    params = fetchLocation ? this.addP(params, 'key[location]', true) : params;
    params = fetchImages ? this.addP(params, 'key[images]', true) : params;

    const query = this.http
      .get<any>(this.url + 'Venue', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchVenue() successfull', res);
        })
      );
    return query;
  }

  /**
   * Searches for a location
   * locationObj =  {
   *   "id": "string"",
   *   "active": "boolean",
   *   "hidden": "boolean",
   *   "description": "string",
   *   "searchString": "string",
   *   "minUpdatedDate": "string",
   *   "maxUpdatedDate": "string",
   *   "ResultsPerPage": "50",
   *   "PageNumber": 1,
   * };
   * @param locationObj
   * @returns a promise
   */
  getSearchLocationFuzy(locationObj: any) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      lang: 'en',
      pageNumber: locationObj.pageNumber,
      pageSize: locationObj.pageSize,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'id', locationObj.id);
    params = this.addP(params, 'description', locationObj.description);
    params = this.addP(params, 'searchString', locationObj.searchString);
    params = this.addP(params, 'active', locationObj.active);
    params = this.addP(params, 'hidden', locationObj.hidden);
    params = this.addP(params, 'minUpdatedDate', locationObj.minUpdatedDate);
    params = this.addP(params, 'maxUpdatedDate', locationObj.maxUpdatedDate);
    params = this.addP(params, 'city', locationObj.city);
    params = this.addP(params, 'province', locationObj.province);
    params = this.addP(params, 'distance', locationObj.distance);
    params = this.addP(params, 'postalCode', locationObj.postalCode);

    const query = this.http
      .get<any>(this.url + 'Location', { params: params })
      .pipe(
        tap((res) => {
          console.log('getSearchLocationFuzy() successfull', res);
        })
      );
    return query;
  }

  /**
   * Gets a venue without all the deatils by unique id
   * @param venueId
   * @returns a promise
   */
  getSimpleVenueById(venueId: string) {
    const query = this.http.get<any>(this.url + 'Venue/' + venueId, {}).pipe(
      tap((res) => {
        console.log('getSimplyVenueById() successfull', res);
      })
    );
    return query;
  }

  /**
   * Gets a venue with details by unique id
   * @param venueId
   * @returns
   */
  getVenueById(venueId: string) {
    const query = this.http
      .get<any>(this.url + 'Venue/' + venueId + '/Details', {})
      .pipe(
        tap((res) => {
          console.log('getVenueById() successfull', res);
        })
      );
    return query;
  }

  /**
   * Gets a location with details by unique id
   * @param locationId
   * @returns
   */
  getLocationById(locationId: string) {
    const query = this.http
      .get<any>(this.url + 'Location/' + locationId + '/Details', {})
      .pipe(
        tap((res) => {
          console.log('getLocationById() successfull', res);
        })
      );
    return query;
  }

  /**
   * Gets a postal code by it's unique id
   * @param postalCodeId Unique postal code id
   * @returns a promise
   */
  getPostalCodeById(postalCodeId: number) {
    const query = this.http
      .get<any>(this.url + 'PostalCode/' + postalCodeId, {})
      .pipe(
        tap((res) => {
          console.log('getPostalCodeById() successfull', res);
        })
      );
    return query;
  }

  /**
   * @returns Statistics about all workflows
   */
  getWorkflowStats() {
    const query = this.http.get<any>(this.url + 'Workflow/Stats', {}).pipe(
      tap((res) => {
        console.log('getWorkflowStats() successfull', res);
      })
    );
    return query;
  }

  /**
   * Fetches all future and current schedules for a venue
   * @param venueId Unique Guid of a venue
   * @returns a promise
   */
  getSchedulesVenueById(venueId: string) {
    const params = {
      currentAndFuture: true,
    };
    const query = this.http
      .get<any>(this.url + 'Schedule/Venue/' + venueId, { params: params })
      .pipe(
        tap((res) => {
          console.log('getSchedulesVenueById() successfull', res);
        })
      );
    return query;
  }

  /**
   * Fetches all seasonal tag associated to a venue
   * @param venueId Unique Guid of a venue
   * @returns a promise
   */
  getSeasonalTagsVenueById(venueId: string) {
    const params = {
      currentAndFuture: true,
    };
    const query = this.http
      .get<any>(this.url + 'Seasonal/Venue/' + venueId, { params: params })
      .pipe(
        tap((res) => {
          console.log('getSeasonalTagsVenueById() successfull', res);
        })
      );
    return query;
  }

  /**
   * Fetches all categoris a venue resides in
   * @param venueId Unique Guid of a venue
   * @returns a promise
   */
  getCategoriesVenueById(venueId: string) {
    const params = {
      lang: 'en',
      hidden: 0
    };
    const query = this.http
      .get<any>(this.url + 'Category/Venue/' + venueId, { params: params })
      .pipe(
        tap((res) => {
          console.log('getCategoriesVenueById() successfull', res);
        })
      );
    return query;
  }

  /**
   * Fetches a workflow object by a unique id
   * @param workflowId unique workflow id
   * @returns a promise
   */
  getWorkflowById(workflowId: string) {
    const query = this.http.get<any>(this.url + 'Workflow/' + workflowId).pipe(
      tap((res) => {
        console.log('getWorkflowById() successfull', res);
      })
    );
    return query;
  }

  /**
   * Creates a workflow event.  The data object may look like:
   * {
   *   "actionTakerUserId": "string",
   *   "note": "string",
   *   "adminNotes": "string"
   * }
   * @param workflowId unique workflow id
   * @param workflowEventData workflow event object
   * @returns a promise
   */
  createWorkflowEvent(workflowId: number, workflowEventData: any) {
    const query = this.http
      .post<any>(
        this.url + 'Workflow/' + workflowId + '/Event',
        workflowEventData
      )
      .pipe(
        tap((res) => {
          console.log('createWorkflowEvent() successfull', res);
        })
      );
    return query;
  }

  /**
   * Creates a workflow in the system. 
   * 
   * @param workflowData workflow create object
   * @returns a promise
   */
  createWorkflow(workflowData: any) {
    const query = this.http
      .post<any>(
        this.url + 'Workflow',
        workflowData
      )
      .pipe(
        tap((res) => {
          console.log('createWorkflow() successfull', res);
        })
      );
    return query;
  }

  /**
   * @param workflowId unique id of the workflow
   * @param status a valid satus to update to
   * @returns a promise
   */
  updateWorkflowStatus(workflowId: number, status: string) {
    const query = this.http
      .put<any>(this.url + 'Workflow/' + workflowId + '/Status/' + status, null)
      .pipe(
        tap((res) => {
          console.log('updateWorkflowStatus() successfull', res);
        })
      );
    return query;
  }

  /**
   * Searches for a workflow.  Specify either a venueId or locationId (not both)
   * @param venueId Unique Guid primary id
   * @param locationId Unique Guid primary id
   * @param isOpenStatus True if workflow is open status.. False otherwise
   * @param pageNumber Page number starting at 1
   * @param pageSize The number of results per page
   * @returns a promise
   */
  getWorkflowSearchOpenOrCLosed(
    venueId: string,
    locationId: string,
    isOpenStatus: boolean,
    pageNumber: number = 1,
    pageSize: number = 10
  ) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      statusOpen: isOpenStatus,
      pageNumber: pageNumber,
      pageSize: pageSize,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'venueId', venueId);
    params = this.addP(params, 'locationId', locationId);

    const query = this.http
      .get<any>(this.url + 'Workflow', { params: params })
      .pipe(
        tap((res) => {
          console.log('getWorkflowSearchOpenOrCLosed() successfull', res);
        })
      );
    return query;
  }

  /**
   * Searches for a workflow.  Specify either a venueId or locationId (not both)
   * @param venueId Unique Guid primary id
   * @param locationId Unique Guid primary id
   * @param statuses Array of status names
   * @param pageNumber Page number starting at 1
   * @param pageSize The number of results per page
   * @returns a promise
   */
  getWorkflowSearchByStatus(
    venueId: string,
    locationId: string,
    statuses: Array<string>,
    pageNumber: number = 1,
    pageSize: number = 10
  ) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      pageNumber: pageNumber,
      pageSize: pageSize,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'venueId', venueId);
    params = this.addP(params, 'locationId', locationId);

    if (statuses != null) {
      for (var i = 0; i < statuses.length; i++) {
        params = params.append('status', statuses[i]);
      }
    }
    const query = this.http
      .get<any>(this.url + 'Workflow', { params: params })
      .pipe(
        tap((res) => {
          console.log('getWorkflowSearchByStatus() successfull', res);
        })
      );
    return query;
  }

  /**
   * This method is used to upload a image file to the server
   * @param venueId unique id of the venue
   * @param usage a usage type as specified on teh server
   * @param formData
   * @returns a promise
   */
  uploadImageForVenue(venueId: string, usage: string, formData) {
    const params = { venueId: venueId, usage: usage };
    const query = this.http
      .post<any>(this.url + 'Image/Upload', formData, { params: params })
      .pipe(
        tap((res) => {
          console.log('uploadImageForVenue() successfull', res);
        })
      );
    return query;
  }

  /**
   * This method is used to upload a image file to the server
   * @param locationId unique id of the location
   * @param usage a usage type as specified on the server
   * @param formData
   * @returns a promise
   */
  uploadImageForLocation(locationId: string, usage: string, formData) {
    const params = { locationId: locationId, usage: usage };
    const query = this.http
      .post<any>(this.url + 'Image/Upload', formData, { params: params })
      .pipe(
        tap((res) => {
          console.log('uploadImageForLocation() successfull', res);
        })
      );
    return query;
  }

  /**
 * This method is used to upload and update an image on the server
 * @param id unique id of the existing image
 * @param altText a description for the image
 * @param usage a usage type as specified on the server
 * @param formData the file being uploaded
 * @returns a promise
 */
  uploadUpdateImageForLocation(id: string, altText: string, usage: string, sequence: number, formData) {
    const params = { id: [id], altText: [altText], usage: [usage], sequence: [sequence] };
    const query = this.http
      .put<any>(this.url + 'Image/Upload', formData, { params: params })
      .pipe(
        tap((res) => {
          console.log('uploadUpdateImageForLocation() successfull', res);
        })
      );
    return query;
  }

  /**
   * Updates an image's alternative text only.  Does not upload a new imaeg
   * @param imageId the imaeg unique Id
   * @param altText the text to update
   * @param lang 2 character language code
   * @returns a promise
   */
  saveImageAltText(imageId: string, altText: string, lang: string = null, sequence: number) {
    const updateData = { Id: imageId, altText: altText, lang: lang, sequence: sequence };
    const query = this.http
      .put<any>(this.url + 'Image', updateData)
      .pipe(
        tap((res) => {
          console.log('saveImageAltText() successfull', res);
        })
      );
    return query;
  }

  /**
   * Fetches all images for either a venue or location (not both)
   * @param venueId unique id of the venue
   * @param locationId unique id of the location
   * @param lang a 2 letter language code
   * @returns a promise
   */
  getImages(
    venueId: string,
    locationId: string,
    lang: string = "en"
  ) {
    let params: HttpParams = new HttpParams();
    let constParams = {
      lang: lang,
    };
    params = params.appendAll(constParams);
    params = this.addP(params, 'venueId', venueId);
    params = this.addP(params, 'locationId', locationId);

    const query = this.http
      .get<any>(this.url + 'Image', { params: params })
      .pipe(
        tap((res) => {
          console.log('getImages() successfull', res);
        })
      );
    return query;
  }

  /**
   * This API deletes a postal code from the system
   * @param postalCodeId unique Id of the postal code
   * @returns a promise
   */
  deletePostalCode(postalCodeId: number) {
    const query = this.http.delete<any>(this.url + 'PostalCode', { params: { id: postalCodeId } }).pipe(
      tap((res) => {
        console.log('deletePostalCode() successfull', res);
      })
    );
    return query;
  }

  /**
   * Deletes an image from the system.
   * @param imageId Guid unique id
   * @returns a promise
   */
  deleteImage(imageId: string) {
    const query = this.http.delete<any>(this.url + 'Image/' + imageId).pipe(
      tap((res) => {
        console.log('deleteImage() successfull', res);
      })
    );
    return query;
  }

  /**
   * Deletes a tag from the system.
   * @param tagId unique id
   * @returns a promise
   */
  deleteTag(tagId: string) {
    const query = this.http.delete<any>(this.url + 'Tag/' + tagId).pipe(
      tap((res) => {
        console.log('deleteTag() successfull', res);
      })
    );
    return query;
  }

  /**
   * @param updateData A job object with values to update for the location
   * @returns a promise
   */
  saveLocationDetails(updateData) {
    const query = this.http.put<any>(this.url + 'Location', updateData).pipe(
      tap((res) => {
        console.log('saveLocationDetails() successfull', res);
      })
    );
    return query;
  }

  /**
   * @param locationData A job object with values to POST for the location
   * @returns a promise
   */
  createLocation(locationData) {
    const query = this.http.post<any>(this.url + 'Location', locationData).pipe(
      tap((res) => {
        console.log('createLocation() successfull', res);
      })
    );
    return query;
  }

  /**
  * @param postalCodeData A job object with values to POST for the postal code
  * @returns a promise
  */
  createPostalCode(postalCodeData) {
    const query = this.http.post<any>(this.url + 'PostalCode', postalCodeData).pipe(
      tap((res) => {
        console.log('createPostalCode() successfull', res);
      })
    );
    return query;
  }

  /**
  * @param postalCodeData A job object with values to update for the postal code
  * @returns a promise
  */
  savePostalCodeDetails(postalCodeData) {
    const query = this.http.put<any>(this.url + 'PostalCode', postalCodeData).pipe(
      tap((res) => {
        console.log('savePostalCodeDetails() successfull', res);
      })
    );
    return query;
  }

  /**
   * @param updateData A job object with values to update for the venue
   * @returns a promise
   */
  saveVenueDetails(updateData) {
    const query = this.http.put<any>(this.url + 'Venue', updateData).pipe(
      tap((res) => {
        console.log('saveVenueDetails() successfull', res);
      })
    );
    return query;
  }

  /**
   * @param venueData A job object with values to POST for the venue
   * @returns a promise
   */
  createVenue(venueData) {
    const query = this.http.post<any>(this.url + 'Venue', venueData).pipe(
      tap((res) => {
        console.log('createVenue() successfull', res);
      })
    );
    return query;
  }

  /**
   * Creates an amenity.  If venueId is specified, then the amenity is also associated to the venue.
   * let amenityDocument = {
   *		"venueId": venueId,
   *		"description": [{
   *			"langId": lang,
   *   		"name": name
   *		}]
   *	};
   * @param amenityDocument data object
   * @returns a promise
   */
  createAmenity(amenityDocument: any) {
    const query = this.http
      .post<any>(this.url + 'Amenity', amenityDocument)
      .pipe(
        tap((res) => {
          console.log('createAmenity() successfull', res);
        })
      );
    return query;
  }

  /**
   * Creates a tag. If venueId is specified, then the amenity is also associated to the venue.
   * let tagDocument = {
   *  "venueId": venueId,
   *  "Searchable":true,
   *	"Viewable":true,
   *	"Name": "Tennis",
   *	"Color": "#8D33FF"
   * }
   * @param tagDocument data object
   * @returns a promise
   */
  createTag(tagDocument: any) {
    const query = this.http.post<any>(this.url + 'Tag', tagDocument).pipe(
      tap((res) => {
        console.log('createTag() successfull', res);
      })
    );
    return query;
  }

  /**
   * Deletes an amentity by unique id
   * @param id
   * @returns a promise
   */
  deleteAmenityInVenue(id) {
    const query = this.http.delete<any>(this.url + 'Amenity/' + id).pipe(
      tap((res) => {
        console.log('deleteAmenityInVenue() successfull', res);
      })
    );
    return query;
  }

  /**
   * Associates tags to a venue
   * @param venueId the unique id of the venue
   * @param tagsToSave array of tag IDs to associate
   * @returns a promise
   */
  associateTagsToVenue(venueId: string, tagsToSave) {
    const params = { tagId: tagsToSave };
    if (tagsToSave != null && tagsToSave.length > 0) {
      const query = this.http
        .put<any>(this.url + 'Venue/' + venueId + '/Tag', null, {
          params: params,
        })
        .pipe(
          tap((res) => {
            console.log('associateTagsToVenue() successfull', res);
          })
        );
      return query;
    }
  }

  /**
   * Removes the association between a set of tags and a venue
   * @param venueId the unique id of the venue
   * @param tagsToSave array of tag IDs to associate
   * @returns a promise
   */
  dissassociateTagsToVenue(venueId: string, tagsToSave) {
    const params = { tagId: tagsToSave };
    if (tagsToSave != null && tagsToSave.length > 0) {
      const query = this.http
        .delete<any>(this.url + 'Venue/' + venueId + '/Tag', { params: params })
        .pipe(
          tap((res) => {
            console.log('dissassociateTagsToVenue() successfull', res);
          })
        );
      return query;
    }
  }

  /**
   * Removes an association between a venue and a category
   * @param venueId the unique id of the venue
   * @param categoryId the unique id of the category
   * @returns a promise
   */
  removeVenueFromCategory(venueId: string, categoryId: string) {
    const query = this.http.delete<any>(this.url + 'Category/' + categoryId + '/VenueAssignment/' + venueId).pipe(
      tap((res) => {
        console.log('removeVenueFromCategory() successfull', res);
      })
    );
    return query;
  }

  /**
   * Assigns a venue to a category
   * @param venueId The unique GUID/id of the venue
   * @param categoryId The unique GUID/id of the category
   * @param sequence The sequence of the venue in the category
   * @param removeFromParentCategoryId The unique GUID/id of an existing parent category to remove the relationship from. i.e. a MOVE function
   * @param removeFromAllParents if true, the venue will be removed from all parents
   * @returns a promise
   */
  associateVenueToCategory(venueId: string,
    categoryId: string,
    sequence: number = 0,
    removeFromParentCategoryId: string = null,
    removeFromAllParents: boolean = null) {

    let postBody = {
      venueId: venueId,
      sequence: sequence,
      removeFromParentCategoryId: removeFromParentCategoryId,
      removeFromAllParents: removeFromAllParents
    };
    const query = this.http.post<any>(this.url + 'Category/' + categoryId + '/VenueAssignment', postBody).pipe(
      tap((res) => {
        console.log('associateVenueToCategory() successfull', res);
      })
    );
    return query;
  }

  public getIcons(): Observable<any> {
    return this.http.get<any>(environment.webAssetsUrl + 'images/icons.json');
  }
}
