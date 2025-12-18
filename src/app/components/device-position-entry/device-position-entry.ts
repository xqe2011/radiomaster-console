import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-device-position-entry',
  imports: [],
  templateUrl: './device-position-entry.html',
  styleUrl: './device-position-entry.scss',
})
export class DevicePositionEntry {
  foxNumber = input.required<string>();
  clicked = output<void>();

  onClick() {
    this.clicked.emit();
  }
}
