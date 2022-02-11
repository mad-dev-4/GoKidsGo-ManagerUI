import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Logger } from '../../../providers/logger';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private _className = 'HeaderComponent';

  // Input into the component.  Expecting the name of an ionic icon
  @Input() primaryButtonIcon: string = null;
  @Input() secondaryButtonIcon: string = null;

  // This is input to configure a primary button on the navigation.  This is a Properties file key
  @Input() primaryButtonText: string = null;
  @Input() secondaryButtonText: string = null;

  // name a button on the parent component to act on the click event
  @Output() primaryButtonEvent = new EventEmitter<string>();
  @Output() secondaryButtonEvent = new EventEmitter<string>();

  constructor(
    public logger: Logger,
    public cache: LTCache) { }

  ngOnInit() {

  }

  /**
   * This method is called on every page view
   **/
  ngAfterViewInit() {
    this.logger.entry(this._className, 'ngAfterViewInit');
  }

  primaryButtonClickAction() {
    this.logger.entry(
      this._className,
      'primaryButtonClickAction()',
      'Emitting primaryButtonEvent event'
    );
    this.primaryButtonEvent.emit('clicked');
  }

  secondaryButtonClickAction() {
    this.logger.entry(
      this._className,
      'secondaryButtonClickAction()',
      'Emitting secondaryButtonEvent event'
    );
    this.secondaryButtonEvent.emit('clicked');
  }
}
