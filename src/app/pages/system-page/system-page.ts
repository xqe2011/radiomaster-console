import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-system-page',
  imports: [],
  templateUrl: './system-page.html',
  styleUrl: './system-page.scss',
})
export class SystemPage implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  private chartInstance: echarts.ECharts | null = null;

  ngOnInit() {
    this.initChart();
  }

  ngOnDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  private initChart() {
    const chartDom = this.chartContainer.nativeElement;
    this.chartInstance = echarts.init(chartDom);

    const nodes = [
      { id: '1', name: '电台 01', value: 10 },
      { id: '2', name: '电台 02', value: 20 },
      { id: '3', name: '电台 03', value: 30 },
      { id: '4', name: '电台 04', value: 40 },
      { id: '5', name: '电台 05', value: 50 },
      { id: '6', name: '电台 06', value: 60 },
      { id: '7', name: '电台 07', value: 70 },
      { id: '8', name: '电台 08', value: 80 },
      { id: '9', name: '电台 09', value: 90 },
      { id: '10', name: '电台 10', value: 100 },
      { id: '11', name: '电台 11', value: 110 },
      { id: '12', name: '电台 12', value: 120 },
      { id: 'referee', name: '裁判系统', value: 200, symbolSize: 50 },
    ];

    const links = [
      // 电台11 connected to 电台01-05
      { source: '11', target: '1' },
      { source: '11', target: '2' },
      { source: '11', target: '3' },
      { source: '11', target: '4' },
      { source: '11', target: '5' },
      // 电台12 connected to 电台06-10 and 电台02
      { source: '12', target: '6' },
      { source: '12', target: '7' },
      { source: '12', target: '8' },
      { source: '12', target: '9' },
      { source: '12', target: '10' },
      { source: '12', target: '2' },
      // 裁判系统 connected to 电台11 and 电台12 with blue line
      { source: 'referee', target: '11', lineStyle: { color: '#013220', width: 3 } },
      { source: 'referee', target: '12', lineStyle: { color: '#013220', width: 3 } },
    ];

    const option: echarts.EChartsOption = {
      tooltip: {},
      series: [
        {
          type: 'graph',
          layout: 'force',
          data: nodes,
          links: links,
          roam: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}',
          },
          labelLayout: {
            hideOverlap: true,
          },
          lineStyle: {
            color: 'source',
            curveness: 0,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 10,
            },
          },
          force: {
            repulsion: 1000,
            gravity: 0.1,
            edgeLength: 200,
            layoutAnimation: false,
            initLayout: 'circular',
          },
          symbolSize: (value: number) => {
            return value === 200 ? 50 : 20;
          },
        },
      ],
    };

    this.chartInstance.setOption(option);

    // Handle window resize
    window.addEventListener('resize', () => {
      this.chartInstance?.resize();
    });
  }
}
