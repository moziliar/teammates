import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ResponseTimeSeriesChartComponent } from './response-time-series-chart.component';

describe('ResponseTimeSeriesChartComponent', () => {
  let component: ResponseTimeSeriesChartComponent;
  let fixture: ComponentFixture<ResponseTimeSeriesChartComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ResponseTimeSeriesChartComponent,
      ],
      imports: [
        CommonModule,
        FormsModule,
        BrowserModule,
        HttpClientModule,
      ],
    })
    .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(ResponseTimeSeriesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
