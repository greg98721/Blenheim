import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseOriginComponent } from './choose-origin.component';

describe('ChooseOriginComponent', () => {
  let component: ChooseOriginComponent;
  let fixture: ComponentFixture<ChooseOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseOriginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
