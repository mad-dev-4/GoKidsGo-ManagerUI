import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Logger } from '../../../providers/logger';
import { Router } from '@angular/router';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { OrderByPipe } from '../../pipes/orderby.pipe';

/**
 * This component is used to show a list of imaegs for a venue or location.  
 * The component has delete and edit buttons.  It is used on the image-management page, locaiton and venue pages.
 * 
 * Example:
 * <app-image-gallery 
 *	*ngIf="venue" 
 *	[venueId]="venueId" 
 *	[enableEditButton]="false"
 *	[images]="venue.images"
 *	[enableImageManagementButton]="true">
 * </app-image-gallery>
 */
@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.component.html',
  styleUrls: ['./image-gallery.component.scss'],
  providers: [OrderByPipe]
})
export class ImageGalleryComponent implements OnInit {
  private _className = 'ImageGalleryComponent';

  // Internal array of images to display
  _images: Array<any> = null;

  // Enable to show the edit button
  @Input() enableEditButton: boolean = false;

  // Enable to show the link to image management button
  @Input() enableImageManagementButton: boolean = false;

  // if this is a location page, specify the locationId
  @Input() locationId: string = null;

  // if this is a venue page, specify the venueId
  @Input() venueId: string = null;

  // deletes an image and on success, the button can call a button on the parent component. optional
  @Output() buttonDeleteEvent = new EventEmitter<string>();

  // name a button on the parent component to act on the click event
  @Output() buttonEditEvent = new EventEmitter<string>();

  constructor(
    public logger: Logger,
    public router: Router,
    public pageHelper: PageHelper,
    public venueProvider: Venue,
    public orderByPipe: OrderByPipe) { }

  ngOnInit() { }

  /**
   * Array of images to display
   */
  get images(): Array<any> {
    return this._images;
  }

  /**
   * Sets the images array and sorts it before displaying for the first time
   */
  @Input() set images(value: Array<any>) {
    if (value != null) {
      this._images = this.orderByPipe.transform(value, 'sequence');
    }
  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');
    this.logger.trace(this._className, 'locationId', this.locationId);
    this.logger.trace(this._className, 'venueId', this.venueId);
  }


  /**
   * Empty event that is emitted if a user clicks the EDIT button
   * @param imageId The imageId that will be passed back to a listener
   */
  editButtonClickAction(imageId) {
    this.logger.entry(
      this._className,
      'editButtonClickAction()',
      'Emitting editButtonClickAction event'
    );
    this.buttonEditEvent.emit(imageId);
  }


  /**
   * Navigates to the image management screen if this location is not *new*
   */
  imageManagementButtonClickAction() {
    this.logger.entry(this._className, 'imageManagementButtonClickAction():' + this.locationId);
    if (this.locationId) {
      this.router.navigate(
        ['/image-management'],
        { queryParams: { locationId: this.locationId } }
      );
    } else if (this.venueId) {
      this.router.navigate(
        ['/image-management'],
        { queryParams: { venueId: this.venueId } }
      );
    }
  }


  /**
   * @param imageId removes a image from the list
   */
  private removeImageFromLocation(imageId) {
    for (var i = 0; i < this.images.length; i++) {
      if (this.images[i].id === imageId) {
        this.images.splice(i, 1);
      }
    }
  }


  /**
   * Removes an image from the list and emits an event
   * @param imageId unique id of an image
   */
  async deleteButtonClickAction(imageId) {
    this.logger.entry(this._className, 'deleteImage');
    await this.pageHelper.showSaver();

    this.venueProvider.deleteImage(imageId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.removeImageFromLocation(imageId);

        if (this.buttonDeleteEvent != null) {
          this.logger.entry(
            this._className,
            'deleteButtonClickAction()',
            'Emitting deleteButtonClickAction event'
          );
          this.buttonDeleteEvent.emit(imageId);
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }


  /**
   * Handler for file upload
   * @param event
   */
  async loadImageFromDevice(event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.logger.entry(this._className, 'loadImageFromDevice:' + file);

    if (file != null) {
      await this.pageHelper.showSaver();

      var formData: any = new FormData();
      formData.append('files', file);

      if (this.locationId != null) {
        this.venueProvider
          .uploadImageForLocation(this.locationId, 'Thumbnail', formData).subscribe(
            (resp) => {
              this.pageHelper.hideLoader();
              this.logger.entry(this._className, 'loadImageFromDevice: done uploading');
              if (resp != null) {
                this.images = this.images == null ? [] : this.images;
                this.images.push(resp[0]);
              }
            },
            (err) => {
              this.pageHelper.processRequestError(err).subscribe((resp) => { });
            }
          );
      } else if (this.venueId != null) {
        this.venueProvider.uploadImageForVenue(this.venueId, "Thumbnail", formData).subscribe(
          (resp) => {
            this.pageHelper.hideLoader();
            this.logger.entry(this._className, 'loadImageFromDevice: done uploading');
            if (resp != null) {
              this.images.push(resp[0]);
            }
          },
          (err) => {
            this.pageHelper.processRequestError(err).subscribe((resp) => { });
          }
        );
      }
    } // if file !=null
  }

}
