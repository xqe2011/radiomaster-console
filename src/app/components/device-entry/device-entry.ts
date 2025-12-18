import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-device-entry',
  imports: [
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './device-entry.html',
  styleUrl: './device-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeviceEntry {
  foxNumber = input.required<string>();
  frequency = input.required<string>();
  volumeColor = input<string>('green');
  signalColor = input<string>('green');
  satelliteColor = input<string>('green');
  cellTowerColor = input<string>('green');
  batteryColor = input<string>('orange');
  isBeeping = input<boolean>(false);

  configRequested = output<void>();
  beepToggled = output<void>();

  openConfig() {
    this.configRequested.emit();
  }

  toggleBeep() {
    this.beepToggled.emit();
  }
}
