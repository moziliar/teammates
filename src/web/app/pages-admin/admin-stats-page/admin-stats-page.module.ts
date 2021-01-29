import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminStatsPageComponent } from "./admin-stats-page.component";
import { RouterModule, Routes } from "@angular/router";
import { ResponseTimeSeriesChartModule } from "../../components/response-time-series-chart/response-time-series-chart.module";

const routes: Routes = [
  {
    path: '',
    component: AdminStatsPageComponent,
  },
];

/**
 * Module for admin statistics page.
 */
@NgModule({
  declarations: [
    AdminStatsPageComponent,
  ],
  exports: [
    AdminStatsPageComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ResponseTimeSeriesChartModule,
  ],
})
export class AdminStatsPageModule { }
