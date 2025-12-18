import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackendService, Player } from '../../services/backend-service';
import { interval, Subscription } from 'rxjs';
import { isEqual } from 'lodash';
import { ToolService } from '../../services/tool-service';
import { PlayerConfigDialog } from '../../components/player-config-dialog/player-config-dialog';
import { CountdownDialog } from '../../components/countdown-dialog/countdown-dialog';

interface PlayerTableRow {
  number: string;
  playerId: number;
  group: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  duration: string;
  penaltyTime: string;
  progress: string;
}

@Component({
  selector: 'app-players-page',
  imports: [
    CommonModule,
    MatTableModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
  ],
  templateUrl: './players-page.html',
  styleUrl: './players-page.scss',
})
export class PlayersPage implements OnInit, OnDestroy {
  private backendService = inject(BackendService);
  private intervalSubscription?: Subscription;
  private toolService = inject(ToolService);
  private dialog = inject(MatDialog);

  players = signal<Player[]>([], { equal: isEqual });
  playersTableData = computed<PlayerTableRow[]>(() => {
    return this.players().map(player => ({
      number: player.id.toString().padStart(3, '0'),
      playerId: player.id,
      group: player.group,
      name: player.name,
      status: player.status,
      startTime: player.startTime ? new Date(player.startTime).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
      endTime: player.endTime ? new Date(player.endTime).toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
      duration: (player.endTime || player.startTime) ? this.toolService.getElapsedTime(player) : '',
      penaltyTime: player.penaltyTime.toString(),
      progress: `${player.foundSequence.length}/${player.findSequence.length}`
    }));
  });

  ngOnInit() {
    this.loadPlayers();
    
    // Poll for updates every second
    this.intervalSubscription = interval(1000).subscribe(() => {
      this.loadPlayers();
    });
  }

  ngOnDestroy() {
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
  }

  loadPlayers() {
    this.backendService.getPlayers().subscribe({
      next: (response) => {
        if (response.success) {
          this.players.set(response.players);
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error loading players:', error);
      }
    });
  }

  // Player individual actions
  playerPrepareToGo(playerId: number) {
    this.backendService.playerPrepareToGo(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error preparing player to go:', error);
      }
    });
  }

  playerGo(playerId: number) {
    this.backendService.playerGo(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error starting player:', error);
      }
    });
  }

  playerFinish(playerId: number) {
    this.backendService.playerFinish(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error finishing player:', error);
      }
    });
  }

  playerOut(playerId: number) {
    this.backendService.playerOut(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error outing player:', error);
      }
    });
  }

  playerReset(playerId: number) {
    this.backendService.playerReset(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error resetting player:', error);
      }
    });
  }

  // Player batch actions
  playersResetForPrepare() {
    this.backendService.playersResetForPrepare().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error resetting players for prepare:', error);
      }
    });
  }

  playersPrepare() {
    this.backendService.playersPrepare().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error preparing players:', error);
      }
    });
  }

  playersGoAfterPrepare() {
    // Open countdown dialog
    const dialogRef = this.dialog.open(CountdownDialog, {
      data: {
        inputFile: '/countdown.mp3',
        inputParams: 2.2
      },
      disableClose: false
    });

    const dialogComponent = dialogRef.componentInstance;
    
    // Subscribe to the eventOut output event
    dialogComponent.eventOut.subscribe(() => {
      // When audio reaches 3.13 seconds, trigger the backend call
      this.backendService.playersGoAfterPrepare().subscribe({
        next: (response) => {
          if (response.success) {
            this.loadPlayers();
          }
        },
        error: (error) => {
          console.error('[PlayersPage] Error starting players after prepare:', error);
        }
      });
    });

    // Auto-start playback when dialog opens
    dialogRef.afterOpened().subscribe(() => {
      setTimeout(() => {
        const audioElement = dialogComponent.audioRef()?.nativeElement;
        if (audioElement) {
          audioElement.play().catch(err => {
            console.error('[PlayersPage] Error playing audio:', err);
          });
        }
      }, 100);
    });
  }

  playersOutForRunning() {
    this.backendService.playersOutForRunning().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error outing players for running:', error);
      }
    });
  }

  playersOutForNotPrepare() {
    this.backendService.playersOutForNotPrepare().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error outing players for not prepare:', error);
      }
    });
  }

  playersClear() {
    this.backendService.playersClear().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error clearing players:', error);
      }
    });
  }

  // Game actions
  gameReset() {
    this.backendService.gameReset().subscribe({
      next: (response) => {
        if (response.success) {
          this.loadPlayers();
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error resetting game:', error);
      }
    });
  }

  // Player config
  onPlayerConfigRequested(playerId: number) {
    const player = this.players().find(p => p.id === playerId);
    if (!player) {
      return;
    }

    // Fetch player with records
    this.backendService.getPlayersWithRecords(playerId).subscribe({
      next: (response) => {
        if (response.success) {
          const dialogRef = this.dialog.open(PlayerConfigDialog, {
            data: { player: response.player, records: response.player.records }
          });

          const dialogComponent = dialogRef.componentInstance;
          
          // Subscribe to the configSaved output event
          dialogComponent.configSaved.subscribe((config) => {
            this.backendService.setPlayer( config.playerId!, config.group, config.name, config.cardNumber, config.findSequence).subscribe({
              next: (response) => {
                if (response.success) {
                  console.log('[PlayersPage] Player updated successfully');
                  this.loadPlayers();
                }
              },
              error: (error) => console.error('[PlayersPage] Error updating player:', error)
            });
          });
        }
      },
      error: (error) => {
        console.error('[PlayersPage] Error loading player records:', error);
        // Fallback: open dialog without records
        const dialogRef = this.dialog.open(PlayerConfigDialog, {
          data: { player }
        });

        const dialogComponent = dialogRef.componentInstance;
        
        dialogComponent.configSaved.subscribe((config) => {
          this.backendService.setPlayer( config.playerId!, config.group, config.name, config.cardNumber, config.findSequence).subscribe({
            next: (response) => {
              if (response.success) {
                console.log('[PlayersPage] Player updated successfully');
                this.loadPlayers();
              }
            },
            error: (error) => console.error('[PlayersPage] Error updating player:', error)
          });
        });
      }
    });
  }

  // Add new player
  onAddPlayerRequested() {
    const dialogRef = this.dialog.open(PlayerConfigDialog, {
      data: {}
    });

    const dialogComponent = dialogRef.componentInstance;
    
    // Subscribe to the configSaved output event
    dialogComponent.configSaved.subscribe((config) => {
      this.backendService.addPlayer(config.group, config.name, config.cardNumber, config.findSequence).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('[PlayersPage] Player added successfully');
            this.loadPlayers();
          }
        },
        error: (error) => console.error('[PlayersPage] Error adding player:', error)
      });
    });
  }
}
