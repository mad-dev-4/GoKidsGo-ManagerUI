import { Component, Input, OnInit } from '@angular/core';
import { Logger } from '../../../providers/logger';
import { Rating } from '../../../providers/rating';
import { PageHelper } from '../../../providers/page-helper';

// core version + navigation, pagination modules:
import SwiperCore, { SwiperOptions, Navigation, Pagination } from 'swiper';

/**
 * This component is used to show a preview of how a venue presents itself with a set of imaegs, 
 * the venue name and description.  Can show venue or location image sets.  
 * 
 * Example:
 * <venue-card-comp [venue]="venue"></venue-card-comp> 
 */
@Component({
  selector: 'venue-card-comp',
  templateUrl: './venue-card.component.html',
  styleUrls: ['./venue-card.component.scss'],
})
export class VenueCardComponent implements OnInit {
  private _className = 'VenueCardComponent';

  hartColor = null;

  // Venue data object
  @Input() set venue(value:any) {
    this._venue = value;
    if (this._venue.id != null) {
      this._getVenueRatings();
    }
  }
  
  _venue: any = {
    identifier: "",
    locationId: "",
    description: [{
      title: "",
      name: "",
      description: ""
    }]
  };

  rating: any = {
    id:"",
    averageRating:0,
    numberOfRatings:0,
    thumbsUp:0,
    thumbsDown:0
  }

  // swiper configuration
  config: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 0,
    navigation: true,
    pagination: { clickable: true },
    scrollbar: { draggable: true },
  };

  constructor(
    public ratingProvider: Rating,
    public pageHelper: PageHelper,
    public logger: Logger
  ) {
    // install Swiper modules
    SwiperCore.use([Navigation, Pagination]);
  }

  ngOnInit() { }

  onSwiper(swiper) {
    console.log(swiper);
  }

  onSlideChange() {
    this.logger.entry(this._className, 'onSlideChange');
  }

 /**
 * This method is called on every page view
 **/
  ngAfterViewInit() {
    this.logger.entry(this._className, 'ngAfterViewInit');
    
  }

  /**
   * Loads ratings for a venue
   */
   async _getVenueRatings() {
    this.logger.entry(this._className, '_getVenueRatings');
    this.ratingProvider.getVenueAndUserRatingsCombined(this._venue.id).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        if (resp != null) {
          this.rating = resp.item1;
          this.hartColor = (resp.item2 != null && resp.item2.heart) ? "danger" : "dark";
        }
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {
          this._getVenueRatings();
        });
      }
    );
  }

  /**
   *  Action button from the UI to like the venue
   */
  async clickThumbsup() {
    this.clickThumbs('Like');
  }

  /**
   * Action button from the UI to dislike the venue
   */
  async clickThumbsdown() {
    this.clickThumbs('Dislike');
  }

  private async clickThumbs(action) {
    this.logger.entry(this._className, 'clickThumbsdown');
    await this.pageHelper.showSaver();
    this.ratingProvider.setVenueApproval(this._venue.id, action).subscribe(
      (resp) => {
        if (resp != null) {
          this.rating = resp;
        }
        this.pageHelper.hideLoader();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {});
      }
    );
  }

  /**
   * Button on the UI to love or not, a venue
   */
  async loveVenue() {
    this.logger.entry(this._className, 'loveVenue');
    await this.pageHelper.showSaver();
    var love = false;
    if (this.hartColor == "dark") {
      love = true;
    }
    this.ratingProvider.setVenueFavorite(this._venue.id, love).subscribe(
      (resp) => {
        this.hartColor = love ? "danger" : "dark";
        this.pageHelper.hideLoader();
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => {});
      }
    );
  }
}
