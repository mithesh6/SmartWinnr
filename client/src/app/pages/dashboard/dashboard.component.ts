import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../services/analytics.service';
import Chart from 'chart.js/auto';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-header">
      <h2>Dashboard Overview</h2>
      <div class="filters">
        <select class="filter-select">
          <option>Last 10 Days</option>
          <option>Last Month</option>
          <option>Year to Date</option>
        </select>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="glass metric-card">
        <div class="metric-title">Active Users</div>
        <div class="metric-value">{{ latestMetrics.activeUsers || 0 }}</div>
        <div class="metric-trend positive">↑ 12% vs last week</div>
      </div>
      <div class="glass metric-card">
        <div class="metric-title">New Signups</div>
        <div class="metric-value">{{ latestMetrics.newSignups || 0 }}</div>
        <div class="metric-trend positive">↑ 5% vs last week</div>
      </div>
      <div class="glass metric-card">
        <div class="metric-title">Sales</div>
        <div class="metric-value">\${{ latestMetrics.sales || 0 }}</div>
        <div class="metric-trend negative">↓ 2% vs last week</div>
      </div>
    </div>

    <div class="charts-area">
      <div class="glass chart-container">
        <h3>User Growth</h3>
        <canvas #lineChart></canvas>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .filter-select {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background: var(--bg-color);
      color: var(--text-color);
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .metric-card {
      padding: 1.5rem;
    }
    .metric-title {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .metric-trend {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    
    .charts-area {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .chart-container {
      padding: 1.5rem;
      height: 400px;
    }
    .chart-container h3 {
      margin-bottom: 1rem;
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('lineChart') lineChartRef!: ElementRef;
  
  latestMetrics: any = {};
  historicalData: any[] = [];
  chart: any;
  private socket!: Socket;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.analyticsService.getMetrics().subscribe(data => {
      this.latestMetrics = data.latest;
      this.historicalData = data.historical;
      if (this.chart) {
        this.updateChart();
      }
    });

    try {
      this.socket = io(environment.socketUrl);
      this.socket.on('analyticsUpdate', (data: any) => {
        console.log('Real-time update:', data);
        this.latestMetrics = data.latest;
        this.historicalData = data.historical;
        this.updateChart();
      });
    } catch(err) {
      console.log('socket err', err);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => this.initChart(), 500);
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }

  initChart() {
    if(!this.lineChartRef) return;
    const ctx = this.lineChartRef.nativeElement.getContext('2d');
    const labels = this.historicalData.map(d => new Date(d.date).toLocaleDateString());
    const data = this.historicalData.map(d => d.activeUsers);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Active Users',
          data: data,
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateChart() {
    if (this.chart) {
      this.chart.data.labels = this.historicalData.map(d => new Date(d.date).toLocaleDateString());
      this.chart.data.datasets[0].data = this.historicalData.map(d => d.activeUsers);
      this.chart.update();
    } else {
      this.initChart();
    }
  }
}
