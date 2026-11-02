import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptConfirmationMail } from './receipt-confirmation-mail';

describe('ReceiptConfirmationMail', () => {
  let component: ReceiptConfirmationMail;
  let fixture: ComponentFixture<ReceiptConfirmationMail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptConfirmationMail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiptConfirmationMail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
