export enum ProtocolFoxConnectedType {
  LORA = 0,
  WIFI = 1,
  BLE = 2,
  TYPEC = 3,
};

export enum ProtocolFoxNfcStatus {
  DISABLED = 0,
  READ_WRITE = 1,
  READ_ONLY = 2,
  CLEAR = 3,
};

export enum ProtocolFoxNfcResponseStatus {
  START = 0,
  TAG = 1,
  FINISHED = 1,
  OUT = 3
};

export enum ProtocolFoxRfDuration {
  CONTINUOUS = 0,
  T_15S = 1,
  T_30S = 2,
  T_60S = 3,
};

export interface ProtocolFoxDeviceTelemetry {
  type: "device_telemetry";
  shortSN: string;
  foxNumber: number;
  voltage: number;
  beep: boolean;
  nfc: ProtocolFoxNfcStatus;
  gpsLocked: number;
  gpsInUse: number;
  time: number;
  lat: number;
  lon: number;
  connectedType: ProtocolFoxConnectedType;
  connectedFox: number;
  rfEnable: boolean;
  rfFreq: number;
  rfDuration: ProtocolFoxRfDuration;
}

export interface ProtocolFoxNfcRequest {
  type: "nfc_request"
  shortSN: string;
  foxNumber: number;
  time: number;
  nfcID: number;
}

export type ProtocolFox = ProtocolFoxDeviceTelemetry | ProtocolFoxNfcRequest;

export interface ProtocolRefereeSystemDeviceConfig {
  type: "device_config";
  shortSN: string;
  foxNumber: number;
  beep: boolean;
  nfc: ProtocolFoxNfcStatus;
  rfEnable: boolean;
  rfFreq: number;
  rfDuration: ProtocolFoxRfDuration;
}

export interface ProtocolRefereeSystemNfcResponse {
  type: "nfc_response";
  shortSN: string;
  nfcID: number;
  playerID: number;
  status: ProtocolFoxNfcResponseStatus;
}

export type ProtocolRefereeSystem = ProtocolRefereeSystemDeviceConfig | ProtocolRefereeSystemNfcResponse;
