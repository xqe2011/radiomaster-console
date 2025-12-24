import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MapComponent, MarkerComponent } from '@maplibre/ngx-maplibre-gl';
import { interval, Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import { BackendService, Device } from '../../services/backend-service';
import { DevicePositionEntry } from '../../components/device-position-entry/device-position-entry';
import { ToolService } from '../../services/tool-service';

interface Rank {
  rank: number;
  group: string;
  name: string;
  totalDuration: string;
  progress: string;
}

@Component({
  selector: 'app-scoreboard-page',
  imports: [
    CommonModule,
    MatTableModule,
    MapComponent,
    MarkerComponent,
    DevicePositionEntry
  ],
  templateUrl: './scoreboard-page.html',
  styleUrl: './scoreboard-page.scss',
})
export class ScoreboardPage implements OnInit, OnDestroy {
  private backendService = inject(BackendService);
  private toolService = inject(ToolService);
  private intervalSubscription?: Subscription;

  ranks = signal<Rank[]>([], { equal: isEqual });
  devices = signal<Device[]>([], { equal: isEqual });
  devicesWithLocation = computed(() =>
    this.devices().filter(
      device => device.lastTelemetry?.lon !== -1 && device.lastTelemetry?.lat !== -1
    )
  );

  mapCenter = signal<[number, number]>([-74.5, 40]);
  mapZoom = signal<number>(1);
  private hasZoomedToFirstDevice = false;

  ngOnInit() {
    this.loadRanks();
    this.loadDevices();

    this.intervalSubscription = interval(1000).subscribe(() => {
      this.loadRanks();
      this.loadDevices();
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  loadRanks() {
    this.backendService.getPlayers().subscribe({
      next: (response) => {
        if (response.success) {
          const data = response.players.filter(player => player.status === '完成比赛' || player.status === '出发').map(player => ({
            id: player.id,
            group: player.group,
            name: player.name,
            totalDuration: (player.endTime || player.startTime) ? this.toolService.getElapsedTime(player) : '',
            progress: player.status === '完成比赛' ? '完赛' : `${player.foundSequence.length}/${player.findSequence.length}`,
          }));
          data.sort((a, b) => a.totalDuration.localeCompare(b.totalDuration));
          this.ranks.set(data.map((player, index) => ({
            rank: index + 1,
            group: player.group,
            name: player.name,
            totalDuration: player.totalDuration,
            progress: player.progress,
          })));
        }
      },
      error: (error) => console.error('[ScoreboardPage] Error loading ranks:', error)
    });
  }

  loadDevices() {
    this.backendService.getDevices().subscribe({
      next: (response) => {
        if (response.success) {
          this.devices.set(response.devices);

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
      error: (error) => console.error('[ScoreboardPage] Error loading devices:', error)
    });
  }
}
