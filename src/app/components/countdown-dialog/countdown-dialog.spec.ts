import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownDialog } from './countdown-dialog';

describe('CountdownDialog', () => {
  let component: CountdownDialog;
  let fixture: ComponentFixture<CountdownDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountdownDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
