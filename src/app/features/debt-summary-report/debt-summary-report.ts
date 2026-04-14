import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  ApartmentPaymentRecord,
  ExcelReaderService
} from '../../services/excel-reader.service';

interface ApartmentDebtSummary {
  apartment: string;
  months: number;
  totalAmount: number;
}

(pdfMake as any).vfs = pdfFonts as any;

@Component({
  selector: 'app-debt-summary-report',
  imports: [CommonModule],
  templateUrl: './debt-summary-report.html',
  styleUrl: './debt-summary-report.scss'
})
export class DebtSummaryReportComponent {
  rows: ApartmentDebtSummary[] = [];
  selectedFileName = '';

  constructor(private excelReaderService: ExcelReaderService) {}

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const records = await this.excelReaderService.readApartmentPayments(file);
    this.rows = this.aggregateByApartment(records);
    this.selectedFileName = file.name;
  }

  generatePdf() {
    if (this.rows.length === 0) {
      alert('Моля, качете Excel файл!');
      return;
    }

    const pageHeight = 842;
    const topBottomMargins = 60;
    const titleBlockHeight = 26;
    const availableTableHeight = pageHeight - topBottomMargins - titleBlockHeight;
    const totalRows = this.rows.length + 1;
    const dynamicRowHeight = Math.max(18, Math.floor(availableTableHeight / totalRows));

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [30, 30, 30, 30],
      content: [
        {
          text: 'Справка за задължения по апартаменти',
          style: 'title',
          margin: [0, 0, 0, 12]
        },
        {
          table: {
            headerRows: 1,
            widths: [70, 55, 95, 80, 95, '*'],
            heights: 15,
            body: [
              ['Апартамент', 'Етаж', 'Месеци', 'Дата', 'Сума', 'Начин'],
              ...this.rows.map((row) => [
                row.apartment,
                '',
                this.formatMonths(row.months),
                '',
                this.formatAmount(row.totalAmount),
                ''
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? '#115e59' : null),
            paddingTop: () => 6,
            paddingBottom: () => 6
          }
        }
      ],
      styles: {
        title: {
          fontSize: 14,
          bold: true
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11
      }
    };

    pdfMake.createPdf(docDefinition).download('spravka-zadaljenia.pdf');
  }

  private aggregateByApartment(records: ApartmentPaymentRecord[]): ApartmentDebtSummary[] {
    const map = new Map<string, ApartmentDebtSummary>();

    for (const record of records) {
      const existing = map.get(record.apartment);

      if (!existing) {
        map.set(record.apartment, {
          apartment: record.apartment,
          months: 1,
          totalAmount: record.amount
        });
        continue;
      }

      existing.months += 1;
      existing.totalAmount += record.amount;
    }

    return [...map.values()].sort((a, b) => this.compareApartment(a.apartment, b.apartment));
  }

  private compareApartment(a: string, b: string): number {
    const aNum = Number(a.replace(/[^\d]/g, ''));
    const bNum = Number(b.replace(/[^\d]/g, ''));

    if (Number.isNaN(aNum) || Number.isNaN(bNum)) {
      return a.localeCompare(b, 'bg');
    }

    return aNum - bNum;
  }

  private formatMonths(months: number): string {
    return `${months} ${months === 1 ? 'месец' : 'месеца'}`;
  }

  private formatAmount(amount: number): string {
    return `${amount.toFixed(2).replace('.', ',')} евро`;
  }
}
