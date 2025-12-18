import { Component, inject, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Player, BackendService } from '../../services/backend-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-config-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './player-config-dialog.html',
  styleUrl: './player-config-dialog.scss',
})
export class PlayerConfigDialog implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<PlayerConfigDialog>);
  private fb = inject(FormBuilder);
  private backendService = inject(BackendService);
  data = inject(MAT_DIALOG_DATA);
  player: Player | null = this.data?.player || null;
  records: {time: string, type: string, amount: number}[] = this.data?.records || [];
  
  displayedColumns: string[] = ['time', 'type', 'amount'];
  private cardReadingSubscription?: Subscription;

  configSaved = output<{
    playerId: number | null;
    group: string;  
    name: string;
    cardNumber: number | null;
    findSequence: number[];
  }>();

  configForm: FormGroup;

  constructor() {
    this.configForm = this.fb.group({
      group: [this.player?.group || '', [Validators.required]],
      name: [this.player?.name || '', [Validators.required]],
      cardNumber: [this.player?.cardNumber || null],
      findSequence: [
        this.player?.findSequence.join(',') || '',
        [Validators.required, this.validateFindSequence]
      ],
    });
    if (this.data?.records) {
      this.records = this.data?.records.map((r: any) => ({
        ...r,
        time: (() => {
          const date = new Date(r.time);
          const formatted = date.toLocaleString('zh-CN', {
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }).replace(/\//g, '-');
          const ms = date.getMilliseconds().toString().padStart(3, '0');
          return `${formatted}.${ms}`;
        })()
      })) || [];
    }
  }

  private validateFindSequence(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    }
    
    const value = control.value.trim();
    if (!value) {
      return { required: true };
    }

    // Split by comma and check each part
    const parts = value.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    
    if (parts.length === 0) {
      return { required: true };
    }

    // Check if all parts are valid numbers
    for (const part of parts) {
      const num = Number(part);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        return { invalidFormat: true };
      }
    }

    return null;
  }

  ngOnInit(): void {
    // Automatically start reading cards when dialog opens
    this.startReadingCard();
  }

  ngOnDestroy(): void {
    this.stopReadingCard();
  }

  onCancel(): void {
    this.stopReadingCard();
    this.dialogRef.close();
  }

  private startReadingCard(): void {
    this.cardReadingSubscription = this.backendService.readCardsUsingLauncher().subscribe({
      next: (cardNumber) => {
        this.configForm.patchValue({ cardNumber });
        this.stopReadingCard();
      },
      error: (error) => {
        console.error('[PlayerConfigDialog] Error reading card:', error);
        this.stopReadingCard();
      }
    });
  }

  private stopReadingCard(): void {
    if (this.cardReadingSubscription) {
      this.cardReadingSubscription.unsubscribe();
      this.cardReadingSubscription = undefined;
    }
  }

  onSave(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      const findSequenceArray = formValue.findSequence
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
        .map((s: string) => Number(s));
      
      const configData = {
        playerId: this.player?.id || null,
        group: formValue.group.trim(),
        name: formValue.name.trim(),
        cardNumber: formValue.cardNumber ? Number(formValue.cardNumber) : null,
        findSequence: findSequenceArray,
      };
      
      this.configSaved.emit(configData);
      this.dialogRef.close(configData);
    }
  }
}
