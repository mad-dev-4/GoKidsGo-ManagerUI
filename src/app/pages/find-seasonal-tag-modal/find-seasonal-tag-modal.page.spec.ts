import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FindSeasonalTagModalPage } from './find-seasonal-tag-modal.page';

describe('FindSeasonalTagModalPage', () => {
  let component: FindSeasonalTagModalPage;
  let fixture: ComponentFixture<FindSeasonalTagModalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FindSeasonalTagModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FindSeasonalTagModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
