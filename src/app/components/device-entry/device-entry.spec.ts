import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceEntry } from './device-entry';

describe('DeviceEntry', () => {
  let component: DeviceEntry;
  let fixture: ComponentFixture<DeviceEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
