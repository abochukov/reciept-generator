import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExcelReaderService } from '../../services/excel-reader.service';

@Component({
  selector: 'app-word-receipt-generator',
  imports: [CommonModule],
  templateUrl: './word-receipt-generator.html',
  styleUrl: './word-receipt-generator.scss'
})
export class WordReceiptGeneratorComponent {
  apartmentsData: { apartment: string; amount: string }[] = [];
  selectedFileName = '';

  constructor(private excelReaderService: ExcelReaderService) {}

  async onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const records = await this.excelReaderService.readApartmentPayments(file);
    this.apartmentsData = records.map((record) => ({
      apartment: record.rawApartment,
      amount: record.amount.toFixed(2)
    }));
    this.selectedFileName = file.name;
  }

  generateWordFile() {
    if (this.apartmentsData.length === 0) {
      alert('Моля, качете Excel файл!');
      return;
    }

    const today = new Date();
    const dateStr = `${today.getDate() < 10 ? '0' : ''}${today.getDate()}.${today.getMonth() + 1 < 10 ? '0' : ''}${today.getMonth() + 1}.${today.getFullYear()}`;

    let htmlContent = '<html><head><meta charset="utf-8"><style>body { font-family: Arial, sans-serif; }</style></head><body>';

    this.apartmentsData.forEach((item) => {
      const amount = item.amount.replace('.', ',');
      const apartmentStr = item.apartment.toString();
      const isRenter = apartmentStr.includes('Н') || apartmentStr.includes('н');
      const title = isRenter ? 'РАЗПИСКА за наемателите' : 'РАЗПИСКА за собствениците';
      const apartmentNumber = apartmentStr.replace(/[^\d]/g, '');

      htmlContent += `
        <div style="margin-bottom: 40px; page-break-after: always;">
          <p style="text-align: center; font-size: 16pt;"><strong>${title} на ап.${apartmentNumber}</strong></p>
          <p style="font-size: 14pt;">Частта от общите разходи на вх.Д, бл.628, Люлин, полагаща се на ап.${apartmentNumber} за времето от 01.02.2026 до 01.03.2026 (1м) на обща стойност ${amount} евро е платена.</p>
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14pt;">
            <tr>
              <td align="left">София, ${dateStr}</td>
              <td align="right">Kасиер: .....................(Ат. Бочуков)</td>
            </tr>
          </table>
        </div>
      `;
    });

    htmlContent += '</body></html>';

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'razpiski.doc';
    link.click();
  }
}
