import { TestBed, async, inject } from '@angular/core/testing';

import { WriterGuard } from './writer.guard';

describe('WriterGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WriterGuard]
    });
  });

  it('should ...', inject([WriterGuard], (guard: WriterGuard) => {
    expect(guard).toBeTruthy();
  }));
});
