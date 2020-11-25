import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinfoldComponent } from './pinfold.component';

describe('PinfoldComponent', () => {
  let component: PinfoldComponent;
  let fixture: ComponentFixture<PinfoldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinfoldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinfoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
