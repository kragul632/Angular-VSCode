import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewItemComponent } from './add-new-item-component';

describe('AddNewItemComponent', () => {
  let component: AddNewItemComponent;
  let fixture: ComponentFixture<AddNewItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
