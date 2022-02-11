import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-image-management',
  templateUrl: './image-management.page.html',
  styleUrls: ['./image-management.page.scss'],
})
export class ImageManagementPage implements OnInit {
  private _className = 'ImageManagementPage';

  @ViewChild('editingImg') editingImg: ElementRef<HTMLImageElement>;
  @ViewChild('draggableArea') draggableArea: ElementRef;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement>;
  mouseXPosition;
  mouseYPosition;
  dragging = false;
  ctx: CanvasRenderingContext2D;

  clippingEnabled = false;

  // Current signed in users email address
  usersEmail: string;

  isVenue = false;
  isLocation = false;
  venueId: string = null;
  locationId: string = null;
  location: any = {};
  venue: any = {};
  images = [];

  // Information about the selected image in the editor
  selectedImageObject: any = null;
  selectedImage: any = null;
  selectedImageDimensions: any = {
    width: '',
    height: '',
    naturalWidth: '',
    naturalHeight: '',
    ratio: 1
  };

  isImageDataReadyToSave = false;
  isImageReadyToSave = false;

  // text
  alertUnsavedHeader: string = 'Unsaved changes';
  alertUnsavedMsg: string = 'Unsaved changes';

  constructor(
    public venueProvider: Venue,
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

    this.translateService.get('IMG_ALERT_UNSAVED_HEADER').subscribe((value) => {
      this.alertUnsavedHeader = value;
    });
    this.translateService.get('IMG_ALERT_UNSAVED').subscribe((value) => {
      this.alertUnsavedMsg = value;
    });
  } // end constructor

  ngOnInit() {
    this.logger.entry(this._className, 'ngOnInit');
    this.route.queryParams.subscribe((params) => {
      this.venueId = params['venueId'];
      this.locationId = params['locationId'];

      if (this.venueId != null) {
        this.isVenue = true;
        this.logger.trace(this._className, 'ngOnInit', 'venueId: ' + this.venueId);
      } else if (this.locationId != null) {
        this.isLocation = true;
        this.logger.trace(this._className, 'ngOnInit', 'locationId: ' + this.locationId);
      }
    });

  }

  /**
   * This method is called on every page view
   **/
  ionViewWillEnter() {
    this.logger.entry(this._className, 'ionViewWillEnter');

    // this line is the magic that allows images to be loaded cross-orgin (with CORS set of course)
    this.editingImg.nativeElement.crossOrigin = "Anonymous";

    this._getImages();
  }

  /**
   * This method loads images
   **/
  async _getImages() {
    this.logger.entry(this._className, '_getImages');
    await this.pageHelper.showLoader();

    this.venueProvider.getImages(this.venueId, this.locationId, 'en').subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.images = resp;

        // select first image
        if (this.images.length > 0) {
          this.selectImageForEditing(this.images[0]);
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getImages();
        });
      }
    );
  } // end get location

  async saveLocationDetails() {
    this.logger.entry(this._className, 'saveLocationDetails');
    await this.pageHelper.showSaver();

    if (this.isImageReadyToSave) {
      // save the image and the data
      // convert canvas to an image blob and bind this class to the callaback
      var image = this.canvas.nativeElement.toBlob(this._upload.bind(this), "image/png");
    } else {
      this.venueProvider.saveImageAltText(this.selectedImage.id, this.selectedImage.altText, null, this.selectedImage.sequence).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isImageDataReadyToSave = false;
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => { });
        }
      );
    }
  }

  private async _upload(b) {
    var formData: any = new FormData();
    formData.append('files', b);

    this.venueProvider.uploadUpdateImageForLocation(
      this.selectedImage.id,
      this.selectedImage.altText,
      this.selectedImage.usage,
      this.selectedImage.sequence,
      formData).subscribe(
        (resp) => {
          this.pageHelper.hideLoader();
          this.isImageDataReadyToSave = false;
          this.isImageReadyToSave = false;
          this._getImages();
        },
        (err) => {
          this.pageHelper.processRequestError(err).subscribe((resp) => { });
        }
      );
  }

  /**
 * @param imageId removes a image from a location
 */
  private removeImageFromLocation(imageId) {
    for (var i = 0; i < this.images.length; i++) {
      if (this.images[i].id === imageId) {
        this.images.splice(i, 1);
      }
    }
  }

  /**
   * Removes an image from the venue
   * @param imageId unique id of an image
   */
  async deleteImage(imageId) {
    this.logger.entry(this._className, 'deleteImage');
    await this.pageHelper.showSaver();

    this.venueProvider.deleteImage(imageId).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.removeImageFromLocation(imageId);
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

  /**
   * Selects an image for editing.  the image will be placed in the editing area
   * @param imageId 
   */
  async editImage(imageId) {
    if (this.isImageDataReadyToSave || this.isImageReadyToSave) {
      this.pageHelper.showAlertOptionDialog(this.alertUnsavedHeader, this.alertUnsavedMsg).then(x => {
        if (x == 'ok') {
          this._editImage(imageId);
        }
      });
    } else {
      this._editImage(imageId);
    }
  }

  private async _editImage(imageId) {
    for (var i = 0; i < this.images.length; i++) {
      if (this.images[i].id == imageId) {
        this.selectImageForEditing(this.images[i]);
        break;
      }
    }
  }

  /**
   * Reset all resizing/clippings for the selected image
   */
  async resetImage() {
    // cause a reload of the image
    this.imageLoaded(this.selectedImageObject);
    this.isImageDataReadyToSave = false;
    this.isImageReadyToSave = false;
  }

  /**
   * Sets isImageDataReadyToSave=true if any data is changed on the form.  The SAVE button is activated. 
   * @param isSequenceChange set true if the sequence value changed
   */
  async imageDataChanged(isSequenceChange = false) {
    this.logger.entry(this._className, 'imageDataChanged');

    if (isSequenceChange) {
      this.images.sort(function cmpt(a: any, b: any) {
        if (a.sequence < b.sequence) {
          return 0;
        } else if (a.sequence > b.sequence) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    this.isImageDataReadyToSave = true;
  }

  /**
   * Sets isImageReadyToSave=true and isImageDataReadyToSave=true. Call if the image is changed on the form.   
   */
  async imageChanged() {
    this.logger.entry(this._className, 'imageChanged');
    this.isImageReadyToSave = true;
    this.imageDataChanged();
  }

  /**
   * Called when picking a image to be edited
   * @param theImage the specific image object to move to the main cropping/sizing area
   */
  selectImageForEditing(theImage) {
    theImage.crossOrigin = "Anonymous";
    this.selectedImage = theImage;
    this.isImageReadyToSave = false;
    this.isImageDataReadyToSave = false;
  }

  mouseDownOnDraggableArea(event) {
    this.logger.entry(this._className, 'mouseDownOnDraggableArea');
    event.preventDefault();
    this.dragging = true;
    this.mouseXPosition = event.clientX;
    this.mouseYPosition = event.clientY;
  }

  closeDragElement(event) {
    this.logger.entry(this._className, 'closeDragElement');
    this.dragging = false;
  }

  elementDrag(e) {
    if (this.dragging) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new DIV position
      var pos1 = this.mouseXPosition - e.clientX;
      var pos2 = this.mouseYPosition - e.clientY;
      this.mouseXPosition = e.clientX;
      this.mouseYPosition = e.clientY;
      if (this.draggableArea) {
        // set the DIV's new position
        this.draggableArea.nativeElement.style.top = (this.draggableArea.nativeElement.offsetTop - pos2) + "px";
        this.draggableArea.nativeElement.style.left = (this.draggableArea.nativeElement.offsetLeft - pos1) + "px";
      }
    }
  }


  /**
   * When an image is loaded in the DOM, the dimensions are set in the editor
   * @param theImageEvent 
   */
  imageLoaded(theImageEvent) {
    this.logger.entry(this._className, 'imageLoaded');
    var obj = theImageEvent.target ? theImageEvent.target : theImageEvent;
    this.selectedImageDimensions.width = obj.naturalWidth;
    this.selectedImageDimensions.naturalWidth = obj.naturalWidth;
    this.selectedImageDimensions.height = obj.naturalHeight;
    this.selectedImageDimensions.naturalHeight = obj.naturalHeight;
    this.selectedImageDimensions.ratio = (this.selectedImageDimensions.width / this.selectedImageDimensions.height);
    this.selectedImageObject = obj;

    // create the canvas
    this.canvas.nativeElement.width = obj.naturalWidth;
    this.canvas.nativeElement.height = obj.naturalHeight;
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.drawImage(this.editingImg.nativeElement, 0, 0);
  }

  /**
   * Called on change of an image size
   * @param widthOrHeight 0 for width. 1 for height
   */
  imageSizeChanged(widthOrHeight: number) {
    if (widthOrHeight == 0) {
      this.selectedImageDimensions.height = Math.floor(this.selectedImageDimensions.width / this.selectedImageDimensions.ratio);
    } else if (widthOrHeight == 1) {
      this.selectedImageDimensions.width = Math.floor(this.selectedImageDimensions.height * this.selectedImageDimensions.ratio);
    }
    this.scaleCanvasInPlace(this.canvas.nativeElement, this.selectedImageDimensions.width, this.selectedImageDimensions.height);
    this.imageChanged();
  }

  /**
   * Shows the clipping box
   */
  enableClipping() {
    this.clippingEnabled = true;
  }

  /**
   * Hides the clipping box and does nothing else
   */
  cancelClipping() {
    this.clippingEnabled = false;
  }

  /**
   * Crops the drawing area
   */
  cropClipping() {
    this.logger.entry(this._className, 'disableClipping');

    // Create clipping path
    var x = this.draggableArea.nativeElement.offsetLeft - 18;
    var y = this.draggableArea.nativeElement.offsetTop - 2;
    var w = this.draggableArea.nativeElement.offsetWidth;
    var h = this.draggableArea.nativeElement.offsetHeight;

    /*
    // this can be used to test the clipping size by drawing a rectangle
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.ctx.beginPath();
    let region = new Path2D();
    region.rect(x, y, w, h);
    this.ctx.fillStyle = 'blue';
    this.ctx.fillRect(x, y, w,h);
    */

    // adjust for the parent windows scroll
    x = x + this.draggableArea.nativeElement.parentElement.scrollLeft;
    y = y + this.draggableArea.nativeElement.parentElement.scrollTop;
    this.cropCanvasInPlace(this.canvas.nativeElement, x, y, w, h);

    this.selectedImageDimensions.height = this.canvas.nativeElement.height;
    this.selectedImageDimensions.width = this.canvas.nativeElement.width;
    this.imageChanged();

    this.logger.trace(this._className, 'clipped', x + ',' + y + ',' + w + ',' + h);
    this.clippingEnabled = false;
  }

  /**
   * Crops the main drawing canvas by the rectangular area specified in the parameters
   * @param canvasToCrop the canvas element
   * @param x x-corner of the rectangle
   * @param y y-corner of the rectangle
   * @param w width of the rectangle
   * @param h height of the rectangle
   */
  cropCanvasInPlace(canvasToCrop: any,
    x: number, y: number, w: number, h: number) {
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext("2d").drawImage(canvasToCrop, x, y, w, h, 0, 0, w, h);

    var ctx = canvasToCrop.getContext('2d');
    // clear the old canvas
    ctx.clearRect(0, 0, canvasToCrop.width, canvasToCrop.height);
    canvasToCrop.width = w;
    canvasToCrop.height = h;
    // redraw the displayed canvas
    ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, w, h);
  }

  /**
   * Call to scale the main drawing canvas to a specific width and height.
   * @param canvasToScale the canvas element
   * @param w New width of the rectangular area
   * @param h New height of the rectangular area
   */
  scaleCanvasInPlace(canvasToScale: any,
    w: number, h: number) {
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCanvas.getContext("2d").drawImage(canvasToScale, 0, 0, canvasToScale.width, canvasToScale.height, 0, 0, w, h);

    var ctx = canvasToScale.getContext('2d');
    // clear the old canvas
    ctx.clearRect(0, 0, canvasToScale.width, canvasToScale.height);
    canvasToScale.width = w;
    canvasToScale.height = h;
    // redraw the displayed canvas
    ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, w, h);
  }



}