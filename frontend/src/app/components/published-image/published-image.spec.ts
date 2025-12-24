import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublishedImage } from './published-image';

describe('PublishedImage', () => {
  let component: PublishedImage;
  let fixture: ComponentFixture<PublishedImage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishedImage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublishedImage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
