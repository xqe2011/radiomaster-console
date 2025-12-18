import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerEntry } from './player-entry';

describe('PlayerEntry', () => {
  let component: PlayerEntry;
  let fixture: ComponentFixture<PlayerEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerEntry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
