import { Component, OnInit, OnDestroy, ElementRef, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { BackendService, Log } from '../../services/backend-service';
import * as echarts from 'echarts';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-system-page',
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    AgGridAngular,
  ],
  templateUrl: './system-page.html',
  styleUrl: './system-page.scss',
})
export class SystemPage implements OnInit, OnDestroy {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @ViewChild('agGrid') agGrid!: AgGridAngular;
  private chartInstance: echarts.ECharts | null = null;
  private backendService = inject(BackendService);
  private fb = inject(FormBuilder);

  settingsForm: FormGroup;
  saving = false;

  // ag-Grid column definitions
  columnDefs: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 100, sortable: true },
    { field: 'timestamp', headerName: '时间戳', width: 200, sortable: true, valueGetter: (t: unknown) => (
      new Date((t as any).data.timestamp).toLocaleString('zh-CN', {
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    )},
    { field: 'level', headerName: '级别', width: 120, sortable: true },
    { field: 'label', headerName: '标签', width: 150, sortable: true },
    { field: 'message', headerName: '消息', flex: 1, sortable: true },
  ];

  gridOptions: GridOptions = {
    defaultColDef: {
      resizable: true,
      filter: true,
    },
    loading: true,
    theme: 'legacy',
    animateRows: true,
    pagination: true,
    paginationPageSize: 100,
    paginationPageSizeSelector: [50, 100, 200, 500],
  };

  constructor() {
    this.settingsForm = this.fb.group({
      launcherIsEnd: [false, Validators.required],
      startAfterLauncherScan: [false, Validators.required],
      outWhenFoundIncorrectFox: [false, Validators.required],
    });
  }

  ngOnInit() {
    this.initChart();
    this.loadGameSettings();
    this.loadLogs();
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

  private loadGameSettings() {
    this.backendService.getGameSettings().subscribe({
      next: (response) => {
        if (response.success && response.settings) {
          this.settingsForm.patchValue({
            launcherIsEnd: response.settings.launcherIsEnd,
            startAfterLauncherScan: response.settings.startAfterLauncherScan,
            outWhenFoundIncorrectFox: response.settings.outWhenFoundIncorrectFox,
          });
        }
      },
      error: (error) => {
        console.error('Failed to load game settings:', error);
      },
    });
  }

  onSave() {
    if (this.settingsForm.valid && !this.saving) {
      this.saving = true;
      const formValue = this.settingsForm.value;
      this.backendService
        .setGameSettings(
          formValue.launcherIsEnd,
          formValue.startAfterLauncherScan,
          formValue.outWhenFoundIncorrectFox
        )
        .subscribe({
          next: (response) => {
            if (response.success) {
              console.log('Game settings saved successfully');
            }
            this.saving = false;
          },
          error: (error) => {
            console.error('Failed to save game settings:', error);
            this.saving = false;
          },
        });
    }
  }

  onReset() {
    this.loadGameSettings();
  }

  private loadLogs() {
    this.backendService.getLogs(160000).subscribe({
      next: (response) => {
        if (response.success && response.logs) {
          // Format timestamps for display
          this.agGrid.api.setGridOption('rowData', response.logs);
          this.agGrid.api.setGridOption('loading', false);
        }
      },
      error: (error) => {
        console.error('Failed to load logs:', error);
        this.agGrid.api.setGridOption('loading', false);
      },
    });
  }

  onGridReady(params: any) {
    console.log(params)
  }
}
