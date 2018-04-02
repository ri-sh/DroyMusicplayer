import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyTrackerComponent } from './survey-tracker.component';

describe('SurveyTrackerComponent', () => {
  let component: SurveyTrackerComponent;
  let fixture: ComponentFixture<SurveyTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
