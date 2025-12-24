import { Injectable } from '@angular/core';
import { Player } from './backend-service';

@Injectable({
  providedIn: 'root',
})
export class ToolService {
  getElapsedTime(player: Player): string {
    if (player.startTime === null) {
      return '0';
    }
    const start = new Date(player.startTime);
    const end = player.endTime ? new Date(player.endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins.toString().padStart(2, '0') + ':' + Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0');
  }
}
