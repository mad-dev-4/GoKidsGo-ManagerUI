import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Venue } from '../../../providers/venue';
import { PageHelper } from '../../../providers/page-helper';
import { Logger } from '../../../providers/logger';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { LTCache } from '../../../providers/lt-cache';

@Component({
  selector: 'app-new-tag-modal',
  templateUrl: './new-tag-modal.page.html',
  styleUrls: ['./new-tag-modal.page.scss'],
})
export class NewTagModalPage implements OnInit {
  private _className = 'NewTagModalPage';

  // Current signed in users email address
  usersEmail: string;

  // object being created
  tag: any = {
    name: '',
    color: '#000',
    searchable: 'true',
    viewable: 'true'
  }

  constructor(
    public venueProvider: Venue,
    public cache: LTCache,
    public modalCtrl: ModalController,
    public route: ActivatedRoute,
    public logger: Logger,
    public pageHelper: PageHelper,
    public router: Router
  ) {
    this.usersEmail = cache.getValue(cache.KEY_USER_LOGIN_EMAIL);
    this.usersEmail = this.usersEmail ? this.usersEmail.toLowerCase() : null;
  }

  ngOnInit() {
  }


  /**
   * Close and do not save
   */
  closeModal() {
    this.modalCtrl.dismiss({});
  }

  /**
   * Closes the modal and saves changes
   */
  closeAndSaveSelections() {
    this.logger.entry(this._className, 'closeAndSaveSelections,');
    this.createTag();
  }

  /**
   * Creates a tag element
   */
  async createTag() {
    this.logger.entry(this._className, 'createTag');
    await this.pageHelper.showSaver();
    await this.venueProvider.createTag(this.tag).subscribe(
      (resp) => {
        this.pageHelper.hideLoader();
        this.modalCtrl.dismiss({ createdElement: resp });
      },
      (err) => {
        this.pageHelper.processRequestError(err).subscribe((resp) => { });
      }
    );
  }

}
