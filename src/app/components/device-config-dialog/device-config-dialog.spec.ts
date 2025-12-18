import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceConfigDialog } from './device-config-dialog';

describe('DeviceConfigDialog', () => {
  let component: DeviceConfigDialog;
  let fixture: ComponentFixture<DeviceConfigDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceConfigDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceConfigDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
