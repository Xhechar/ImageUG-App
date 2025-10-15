import { TestBed } from '@angular/core/testing';

import { Imageurl } from './imageurl';

describe('Imageurl', () => {
  let service: Imageurl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Imageurl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
