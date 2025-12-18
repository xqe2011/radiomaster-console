import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-player-entry',
  imports: [
    MatListModule,
    MatMenuModule,
    MatButtonModule
  ],
  templateUrl: './player-entry.html',
  styleUrl: './player-entry.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerEntry {
  playerNumber = input.required<string>();
  playerName = input.required<string>();
  progress = input.required<string>();
  elapsedTime = input<string>('0');

  penaltyRequested = output<{ penaltyTime: number }>();
  outRequested = output<void>();

  applyPenalty(penaltyTime: number) {
    this.penaltyRequested.emit({ penaltyTime });
  }

  applyOut() {
    this.outRequested.emit();
  }
}
