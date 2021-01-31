import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ResponseTimeSeriesChartModule } from '../../components/response-time-series-chart/response-time-series-chart.module';
import { AdminStatsPageComponent } from './admin-stats-page.component';

describe('AdminStatsPageComponent', () => {
  let component: AdminStatsPageComponent;
  let fixture: ComponentFixture<AdminStatsPageComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminStatsPageComponent],
      imports: [
        CommonModule,
        HttpClientTestingModule,
        RouterTestingModule,
        ResponseTimeSeriesChartModule,
      ],
    })
    .compileComponents();
  }));
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminStatsPageComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminStatsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
