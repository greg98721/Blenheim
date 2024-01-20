import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseReturnComponent } from './choose-return.component';

describe('ChooseReturnComponent', () => {
  let component: ChooseReturnComponent;
  let fixture: ComponentFixture<ChooseReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseReturnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChooseReturnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
