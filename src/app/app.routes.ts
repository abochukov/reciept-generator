import { Routes } from '@angular/router';
import { WordReceiptGeneratorComponent } from './features/word-receipt-generator/word-receipt-generator';
import { DebtSummaryReportComponent } from './features/debt-summary-report/debt-summary-report';

export const routes: Routes = [
  { path: '', redirectTo: 'word-receipts', pathMatch: 'full' },
  { path: 'word-receipts', component: WordReceiptGeneratorComponent },
  { path: 'debt-report', component: DebtSummaryReportComponent },
  { path: '**', redirectTo: '' }
];
