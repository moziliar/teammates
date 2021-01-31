import { async, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeedbackResponseStatsService } from './feedback-response-stats.service';

describe('FeedbackResponseStatsService', () => {
  let service: FeedbackResponseStatsService;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
    })
        .compileComponents();
  }));
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeedbackResponseStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
