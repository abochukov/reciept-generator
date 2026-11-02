import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterLab } from './counter-lab';

describe('CounterLab', () => {
  let component: CounterLab;
  let fixture: ComponentFixture<CounterLab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterLab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterLab);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
