import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinaliseReturnComponent } from './finalise-return.component';

describe('FinaliseReturnComponent', () => {
  let component: FinaliseReturnComponent;
  let fixture: ComponentFixture<FinaliseReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinaliseReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinaliseReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
