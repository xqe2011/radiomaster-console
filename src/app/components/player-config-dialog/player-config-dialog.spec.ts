import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerConfigDialog } from './player-config-dialog';

describe('PlayerConfigDialog', () => {
  let component: PlayerConfigDialog;
  let fixture: ComponentFixture<PlayerConfigDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerConfigDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerConfigDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
