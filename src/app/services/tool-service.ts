import { Injectable } from '@angular/core';
import { Player } from './backend-service';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  getElapsedTime(player: Player): string {
    if (!player.startTime) {
      return '0';
    }
    const start = new Date(player.startTime);
    const end = player.endTime ? new Date(player.endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins.toString();
  }
}
