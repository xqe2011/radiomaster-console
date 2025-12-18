import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreboardPage } from './scoreboard-page';

describe('ScoreboardPage', () => {
  let component: ScoreboardPage;
  let fixture: ComponentFixture<ScoreboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreboardPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
