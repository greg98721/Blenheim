import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinaliseOnewayComponent } from './finalise-oneway.component';

describe('FinaliseOnewayComponent', () => {
  let component: FinaliseOnewayComponent;
  let fixture: ComponentFixture<FinaliseOnewayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinaliseOnewayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinaliseOnewayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
