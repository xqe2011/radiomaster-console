import { Component, computed, inject, OnInit, signal, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MapComponent, MarkerComponent } from '@maplibre/ngx-maplibre-gl';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DeviceConfigDialog } from '../../components/device-config-dialog/device-config-dialog';
import { DeviceEntry } from '../../components/device-entry/device-entry';
import { PlayerEntry } from '../../components/player-entry/player-entry';
import { DevicePositionEntry } from '../../components/device-position-entry/device-position-entry';
import { BackendService, Device, Player, Log } from '../../services/backend-service';
import { interval, Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import { ToolService } from '../../services/tool-service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  imports: [
    CommonModule,
    MatGridListModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatTableModule,
    MapComponent,
    MarkerComponent,
    MatDialogModule,
    DeviceEntry,
    PlayerEntry,
    DevicePositionEntry
  ]
})

export class DashboardPage implements OnInit, OnDestroy {
  private dialog = inject(MatDialog);
  private backendService = inject(BackendService);
  private toolService = inject(ToolService);
  private intervalSubscription?: Subscription;
  private previousLogId = 0;

  @ViewChild('logContainer', { static: false }) logContainer?: ElementRef<HTMLDivElement>;

  devices = signal<Device[]>([], { equal: isEqual });
  players = signal<Player[]>([], { equal: isEqual });
  runningPlayers = computed(() => this.players().filter(player => player.status !== '完成比赛' && player.status !== '罚下'));
  devicesWithLocation = computed(() => this.devices().filter(device => device.lastTelemetry?.lon !== -1 && device.lastTelemetry?.lat !== -1));
  logs = signal<Log[]>([]);
  
  mapCenter = signal<[number, number]>([-74.5, 40]);
  mapZoom = signal<number>(1);
  private hasZoomedToFirstDevice = false;

  ngOnInit() {
    this.loadDevices();
    this.loadPlayers();
    this.loadLogs();
    
    // Poll for new logs every 1 seconds
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.loadDevices();
      this.loadPlayers();
      this.loadLogs();
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  getElapsedTime(player: Player): string {
    return this.toolService.getElapsedTime(player);
  }

  loadDevices() {
    this.backendService.getDevices().subscribe({
      next: (response) => {
        if (response.success) {
          this.devices.set(response.devices);
          
          // Zoom to first device if not already done
          if (!this.hasZoomedToFirstDevice) {
            const devicesWithLocation = response.devices.filter(
              device => device.lastTelemetry?.lon !== -1 && device.lastTelemetry?.lat !== -1
            );
            if (devicesWithLocation.length > 0) {
              const firstDevice = devicesWithLocation[0];
              const lon = firstDevice.lastTelemetry?.lon ?? 0;
              const lat = firstDevice.lastTelemetry?.lat ?? 0;
              this.mapCenter.set([lon, lat]);
              this.mapZoom.set(13);
              this.hasZoomedToFirstDevice = true;
            }
          }
        }
      },
      error: (error) => console.error('[DashboardPage] Error loading devices:', error)
    });
  }

  loadPlayers() {
    this.backendService.getPlayers().subscribe({
      next: (response) => {
        if (response.success) {
          this.players.set(response.players);
        }
      },
      error: (error) => console.error('[DashboardPage] Error loading players:', error)
    });
  }

  onConfigRequested(device: Device) {
    this.dialog.open(DeviceConfigDialog, {
      data: { lastTelemetry: device.lastTelemetry }
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.backendService.updateDevice( device.shortSN, result.foxNumber, result.beep, result.nfc, result.rfEnable, result.rfFreq, result.rfDuration).subscribe({
          next: (response) => {
            if (response.success) {
              console.log('[DashboardPage] Device updated successfully');
              this.loadDevices();
            }
          },
          error: (error) => console.error('[DashboardPage] Error updating device:', error)
        });
      }
    });
  }

  onBeepToggled(device: Device) {
    const foxNumber = device.lastTelemetry?.foxNumber ?? 0;
    const currentBeep = device.lastTelemetry?.beep ?? false;
    const nfc = device.lastTelemetry?.nfc ?? 0;
    const rfEnable = device.lastTelemetry?.rfEnable ?? false;
    const rfFreq = device.lastTelemetry?.rfFreq ?? 0;
    const rfDuration = device.lastTelemetry?.rfDuration ?? 0;

    this.backendService.updateDevice(device.shortSN, foxNumber, !currentBeep, nfc, rfEnable, rfFreq, rfDuration).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('[DashboardPage] Device updated successfully');
        }
      },
      error: (error) => console.error('[DashboardPage] Error updating device:', error)
    });
  }

  onPenaltyRequested(player: Player, penaltyTime: number) {
    this.backendService.playerPenalty(player.id, penaltyTime).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('[DashboardPage] Player penalized successfully');
          this.loadPlayers();
        }
      },
      error: (error) => console.error('[DashboardPage] Error penalizing player:', error)
    });
  }

  onOutRequested(player: Player) {
    this.backendService.playerOut(player.id).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('[DashboardPage] Player out successfully');
          this.loadPlayers();
        }
      },
      error: (error) => console.error('[DashboardPage] Error setting player out:', error)
    });
  }

  loadLogs() {
    this.backendService.getLogs(100).subscribe({
      next: (response) => {
        if (response.success) {
          const displayLogs: Log[] = response.logs.map((log) => ({
            id: log.id,
            level: log.level,
            timestamp: new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            label: log.label,
            message: log.message
          })).reverse();

          // Check if new logs were added
          const currentLogId = displayLogs[0].id;
          const hasNewLogs = currentLogId !== this.previousLogId;
          this.previousLogId = currentLogId;

          this.logs.set(displayLogs);

          // Auto-scroll to bottom if new logs were added
          if (hasNewLogs) {
            setTimeout(() => this.scrollToBottom(), 0);
          }
        }
      },
      error: (error) => console.error('[DashboardPage] Error loading logs:', error)
    });
  }

  scrollToBottom() {
    if (this.logContainer?.nativeElement) {
      const element = this.logContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
