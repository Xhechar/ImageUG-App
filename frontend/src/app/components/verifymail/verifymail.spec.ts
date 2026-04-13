import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Verifymail } from './verifymail';

describe('Verifymail', () => {
  let component: Verifymail;
  let fixture: ComponentFixture<Verifymail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Verifymail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Verifymail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
