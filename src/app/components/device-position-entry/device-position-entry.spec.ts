import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePositionEntry } from './device-position-entry';

describe('DevicePositionEntry', () => {
  let component: DevicePositionEntry;
  let fixture: ComponentFixture<DevicePositionEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevicePositionEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevicePositionEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
