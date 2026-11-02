import { Routes } from '@angular/router';
import { WordReceiptGeneratorComponent } from './features/word-receipt-generator/word-receipt-generator';
import { DebtSummaryReportComponent } from './features/debt-summary-report/debt-summary-report';
import { AngularLabComponent } from './features/angular-lab/angular-lab';
import { CounterLab } from './features/counter-lab/counter-lab';
import { ReceiptConfirmationMail } from './features/receipt-confirmation-mail/receipt-confirmation-mail';

export const routes: Routes = [
  { path: '', redirectTo: 'word-receipts', pathMatch: 'full' },
  { path: 'word-receipts', component: WordReceiptGeneratorComponent },
  { path: 'debt-report', component: DebtSummaryReportComponent },
  { path: 'angular-lab', component: AngularLabComponent },
  { path: 'counter-lab', component: CounterLab },
  { path: 'confirmation-mail', component: ReceiptConfirmationMail },
  { path: '**', redirectTo: '' }
];
