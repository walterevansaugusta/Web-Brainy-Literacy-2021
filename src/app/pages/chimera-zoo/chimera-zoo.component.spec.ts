import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChimeraZooComponent } from './chimera-zoo.component';

describe('ChimeraZooComponent', () => {
  let component: ChimeraZooComponent;
  let fixture: ComponentFixture<ChimeraZooComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChimeraZooComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChimeraZooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
