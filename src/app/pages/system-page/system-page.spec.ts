import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemPage } from './system-page';

describe('SystemPage', () => {
  let component: SystemPage;
  let fixture: ComponentFixture<SystemPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
