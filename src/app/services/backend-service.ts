import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ProtocolFoxDeviceTelemetry, ProtocolFoxNfcStatus, ProtocolFoxRfDuration } from '../types/protocol';
import { Observable } from 'rxjs';
import ReconnectingEventSource from 'reconnecting-eventsource';

export interface Player {
  id: number;
  group: string;
  name: string;
  cardNumber: number | null;
  findSequence: number[];
  foundSequence: number[];
  startTime: Date | null;
  endTime: Date | null;
  penaltyTime: number;
  status: "未出发" | "准备出发" | "出发" | "完成比赛" | "罚下";
};

export interface PlayerWithRecords extends Player {
  records: {time: string, type: string, amount: number}[];
};

export interface Device {
  shortSN: string;
  lastTelemetry: ProtocolFoxDeviceTelemetry;
  connectedType: "lora" | "wifi";
  baseStationSN?: number[];
}

export interface Log {
  id: number;
  level: string;
  message: string;
  label: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  private http = inject(HttpClient);

  getPlayers() {
    return this.http.get<{ success: boolean, players: Player[] }>('http://localhost:3000/api/players');
  }

  getPlayersWithRecords(playerId: number) {
    return this.http.get<{ success: boolean, player: PlayerWithRecords }>(`http://localhost:3000/api/players/${playerId}`);
  }

  playerPenalty(playerId: number, time: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/penalty`, { time });
  }

  getDevices() {
    return this.http.get<{ success: boolean, devices: Device[] }>('http://localhost:3000/api/devices');
  }

  updateDevice(shortSN: string, foxNumber: number, beep: boolean, nfc: ProtocolFoxNfcStatus, rfEnable: boolean, rfFreq: number, rfDuration: ProtocolFoxRfDuration) {
    return this.http.put<{ success: boolean }>(`http://localhost:3000/api/devices/${shortSN}`, { foxNumber, beep, nfc, rfEnable, rfFreq, rfDuration });
  }

  getLogs(limit: number = 100) {
    return this.http.get<{ success: boolean, logs: Log[] }>(`http://localhost:3000/api/logs?limit=${limit}`);
  }

  playerPrepareToGo(playerId: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/prepare_to_go`, {});
  }

  playerGo(playerId: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/go`, {});
  }

  playerFinish(playerId: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/finish`, {});
  }

  playerOut(playerId: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/out`, {});
  }

  playerReset(playerId: number) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}/reset`, {});
  }
  
  playersResetForPrepare() {
    return this.http.delete<{ success: boolean }>(`http://localhost:3000/api/players/prepare`, {});
  }

  playersPrepare() {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/prepare`, {});
  }

  playersGoAfterPrepare() {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/go_after_prepare`, {});
  }

  playersOutForRunning() {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/out_for_running`, {});
  }

  playersOutForNotPrepare() {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players/out_for_not_prepare`, {});
  }

  playersClear() {
    return this.http.delete<{ success: boolean }>(`http://localhost:3000/api/players`);
  }

  gameReset() {
    return this.http.delete<{ success: boolean }>(`http://localhost:3000/api/game`);
  }

  addPlayer(group: string, name: string, cardNumber: number | null, findSequence: number[]) {
    return this.http.post<{ success: boolean }>(`http://localhost:3000/api/players`, { group, name, cardNumber, findSequence });
  }

  deletePlayer(playerId: number) {
    return this.http.delete<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}`);
  }

  setPlayer(playerId: number, group: string, name: string, cardNumber: number | null, findSequence: number[]) {
    return this.http.put<{ success: boolean }>(`http://localhost:3000/api/players/${playerId}`, { group, name, cardNumber, findSequence });
  }

  readCardsUsingLauncher(): Observable<number> {
    return new Observable<number>(observer => {
      const eventSource = new ReconnectingEventSource(`http://localhost:3000/api/cards/read`, {max_retry_time: 1});
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if ('cardNumber' in data) {
          observer.next(data.cardNumber);
        }
      };
      eventSource.onerror = (event) => {
        observer.error(event);
      };
      return () => {
        eventSource.close();
      };
    });
  }

}
