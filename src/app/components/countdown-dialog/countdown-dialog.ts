import { Component, input, output, effect, signal, computed, ChangeDetectionStrategy, ElementRef, viewChild, afterNextRender, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface CountdownDialogData {
  inputFile?: File | string;
  inputParams?: number;
}

@Component({
  selector: 'app-countdown-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './countdown-dialog.html',
  styleUrl: './countdown-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdownDialog implements OnDestroy {
  // Support both input signals (standalone) and MAT_DIALOG_DATA (dialog mode)
  inputFileSignal = input<File | string>();
  inputParamsSignal = input<number>();
  
  private dialogData = inject<CountdownDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject<MatDialogRef<CountdownDialog>>(MatDialogRef, { optional: true });

  // Get values from either input signals or dialog data
  inputFile = computed(() => {
    if (this.dialogData?.inputFile !== undefined) {
      return this.dialogData.inputFile;
    }
    return this.inputFileSignal();
  });

  inputParams = computed(() => {
    if (this.dialogData?.inputParams !== undefined) {
      return this.dialogData.inputParams;
    }
    return this.inputParamsSignal() ?? 0;
  });

  eventOut = output<void>();

  audioRef = viewChild<ElementRef<HTMLAudioElement>>('audioElement');
  
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  isPlaying = signal<boolean>(false);
  hasTriggered = signal<boolean>(false);
  
  private objectUrl: string | null = null;

  countdownSeconds = computed(() => {
    const triggerTime = this.inputParams();
    const current = this.currentTime();
    const remaining = Math.max(0, triggerTime - current);
    return Math.ceil(remaining);
  });

  countdownProgressPercentage = computed(() => {
    const triggerTime = this.inputParams();
    const remaining = this.countdownSeconds();
    if (triggerTime <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / Math.ceil(triggerTime)) * 100));
  });

  // SVG circle attributes
  circumference = 2 * Math.PI * 50;

  dashOffset = computed(() => {
    const circumference = this.circumference;
    return circumference - (this.countdownProgressPercentage() / 100) * circumference;
  });

  constructor() {
    afterNextRender(() => {
      this.setupAudio();
      this.setupAudioListeners();
    });

    // Watch for input file changes
    effect(() => {
      const file = this.inputFile();
      if (file) {
        // Reset state when file changes
        this.currentTime.set(0);
        this.hasTriggered.set(false);
        this.updateAudioSource();
      }
    });

    // Watch for trigger time
    effect(() => {
      const current = this.currentTime();
      const triggerTime = this.inputParams();
      const triggered = this.hasTriggered();
      
      if (!triggered && current >= triggerTime && triggerTime > 0) {
        this.hasTriggered.set(true);
        this.eventOut.emit();
      }
    });
  }

  ngOnDestroy() {
    // Clean up object URL if it was created
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private setupAudio() {
    this.updateAudioSource();
  }

  private updateAudioSource() {
    const audioElement = this.audioRef()?.nativeElement;
    if (!audioElement) return;

    // Clean up previous object URL if it exists
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    const file = this.inputFile();
    const url = typeof file === 'string' ? file : (this.objectUrl = URL.createObjectURL(file));
    audioElement.src = url;
  }

  private setupAudioListeners() {
    const audioElement = this.audioRef()?.nativeElement;
    if (!audioElement) return;

    audioElement.addEventListener('loadedmetadata', () => {
      this.duration.set(audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', () => {
      this.currentTime.set(audioElement.currentTime);
    });

    audioElement.addEventListener('play', () => {
      this.isPlaying.set(true);
    });

    audioElement.addEventListener('pause', () => {
      this.isPlaying.set(false);
    });

    audioElement.addEventListener('ended', () => {
      this.isPlaying.set(false);
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    });
  }

  togglePlayOrCancel() {
    const audioElement = this.audioRef()?.nativeElement;
    if (!audioElement) return;

    if (this.isPlaying()) {
      // Cancel: pause and close
      audioElement.pause();
      if (this.dialogRef) {
        this.dialogRef.close();
      }
    } else {
      if (this.hasTriggered()) {
        if (this.dialogRef) {
          this.dialogRef.close();
        }
        return;
      }
      // Play
      audioElement.play();
    }
  }

}
