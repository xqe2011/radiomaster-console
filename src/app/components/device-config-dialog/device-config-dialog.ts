import { Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProtocolFoxDeviceTelemetry, ProtocolFoxNfcStatus, ProtocolFoxRfDuration, ProtocolFoxConnectedType } from '../../types/protocol';

@Component({
  selector: 'app-device-config-dialog',
  imports: [
    MatDialogModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],  
  templateUrl: './device-config-dialog.html',
  styleUrl: './device-config-dialog.scss',
})
export class DeviceConfigDialog {
  private dialogRef = inject(MatDialogRef<DeviceConfigDialog>);
  private fb = inject(FormBuilder);
  telemetry: ProtocolFoxDeviceTelemetry = inject(MAT_DIALOG_DATA).lastTelemetry;

  configSaved = output<{
    foxNumber: number;
    beep: boolean;
    nfc: ProtocolFoxNfcStatus;
    rfEnable: boolean;
    rfFreq: number;
    rfDuration: ProtocolFoxRfDuration;
  }>();

  configForm: FormGroup;

  constructor() {
    this.configForm = this.fb.group({
      foxNumber: [this.telemetry.foxNumber, [Validators.required, Validators.min(1)]],
      beep: [this.telemetry.beep],
      nfc: [this.telemetry.nfc],
      rfEnable: [this.telemetry.rfEnable],
      rfFreq: [this.telemetry.rfFreq, [Validators.required, Validators.min(0)]],
      rfDuration: [this.telemetry.rfDuration],
    });

    // 监听电台编号变化，当大于10时强制锁定短波开关为关闭
    this.configForm.get('foxNumber')?.valueChanges.subscribe((foxNumber: number) => {
      if (foxNumber > 10) {
        this.configForm.get('rfEnable')?.setValue(false, { emitEvent: false });
        this.configForm.get('rfEnable')?.disable();
      } else {
        this.configForm.get('rfEnable')?.enable();
      }
    });

    // 初始化时检查一次
    const initialFoxNumber = this.configForm.get('foxNumber')?.value;
    if (initialFoxNumber > 10) {
      this.configForm.get('rfEnable')?.setValue(false, { emitEvent: false });
      this.configForm.get('rfEnable')?.disable();
    }
  }

  get connectedTypeText(): string {
    switch (this.telemetry.connectedType) {
      case ProtocolFoxConnectedType.LORA:
        return 'LoRa';
      case ProtocolFoxConnectedType.WIFI:
        return 'WiFi';
      case ProtocolFoxConnectedType.BLE:
        return 'BLE';
      case ProtocolFoxConnectedType.TYPEC:
        return 'Type-C';
      default:
        return '未知';
    }
  }

  get gpsLockedText(): string {
    return this.telemetry.gpsLocked > 0 ? '是' : '否';
  }

  get voltageText(): string {
    return `${this.telemetry.voltage.toFixed(1)}V`;
  }

  get nfcOptions() {
    return [
      { value: ProtocolFoxNfcStatus.DISABLED, label: '禁用' },
      { value: ProtocolFoxNfcStatus.READ_WRITE, label: '写入刷卡时间' },
      { value: ProtocolFoxNfcStatus.READ_ONLY, label: '只读' },
      { value: ProtocolFoxNfcStatus.CLEAR, label: '清除卡内数据' },
    ];
  }

  get rfDurationOptions() {
    return [
      { value: ProtocolFoxRfDuration.CONTINUOUS, label: '持续发码' },
      { value: ProtocolFoxRfDuration.T_15S, label: '15秒' },
      { value: ProtocolFoxRfDuration.T_30S, label: '30秒' },
      { value: ProtocolFoxRfDuration.T_60S, label: '60秒' },
    ];
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      this.configSaved.emit({
        foxNumber: formValue.foxNumber,
        beep: formValue.beep,
        nfc: formValue.nfc,
        rfEnable: formValue.rfEnable,
        rfFreq: formValue.rfFreq,
        rfDuration: formValue.rfDuration,
      });
      this.dialogRef.close(formValue);
    }
  }
}
