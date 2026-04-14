import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ApartmentPaymentRecord {
  apartment: string;
  amount: number;
  rawApartment: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelReaderService {
  async readApartmentPayments(file: File): Promise<ApartmentPaymentRecord[]> {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
      header: 1,
      defval: ''
    });

    const headerRow1 = rows[0] ?? [];
    const headerRow2 = rows[1] ?? [];
    const records: ApartmentPaymentRecord[] = [];
    const apartmentColumns = this.findApartmentColumns(headerRow1, headerRow2);
    const apartmentColumn = apartmentColumns[0] ?? 0;

    for (const row of rows) {
      const apartmentCell = row[apartmentColumn];

      if (!this.looksLikeApartment(apartmentCell)) {
        continue;
      }

      const rawApartment = this.normalizeApartment(String(apartmentCell));
      const amounts = this.extractAmountsFromRow(row, apartmentColumn, apartmentColumns, headerRow1, headerRow2);

      for (const amount of amounts) {
        records.push({
          apartment: rawApartment,
          amount,
          rawApartment
        });
      }
    }

    return records;
  }

  private findApartmentColumns(headerRow1: (string | number)[], headerRow2: (string | number)[]): number[] {
    const maxLen = Math.max(headerRow1.length, headerRow2.length);
    const indexes: number[] = [];

    for (let i = 0; i < maxLen; i += 1) {
      const h1 = String(headerRow1[i] ?? '').toLowerCase();
      const h2 = String(headerRow2[i] ?? '').toLowerCase();

      if (h1.includes('ап.') || h2 === '№' || h2 === 'no' || h2 === 'n') {
        indexes.push(i);
      }
    }

    return indexes.length ? indexes : [0];
  }

  private looksLikeApartment(value: string | number | undefined): boolean {
    if (value === undefined || value === '') {
      return false;
    }

    const text = String(value).trim();
    if (!text) {
      return false;
    }

    return /\d/.test(text);
  }

  private extractAmountsFromRow(
    row: (string | number)[],
    apartmentColumn: number,
    apartmentColumns: number[],
    headerRow1: (string | number)[],
    headerRow2: (string | number)[]
  ): number[] {
    const amounts: number[] = [];

    for (let i = 0; i < row.length; i += 1) {
      if (i === apartmentColumn || apartmentColumns.includes(i)) {
        continue;
      }

      if (this.isLikelyTotalColumn(i, headerRow1, headerRow2)) {
        continue;
      }

      const amount = this.toNumber(row[i]);
      if (!Number.isNaN(amount) && amount > 0) {
        amounts.push(amount);
      }
    }

    // Fallback for simple 2-column files: apartment in A, amount in B.
    if (amounts.length === 0 && row.length > apartmentColumn + 1) {
      const fallback = this.toNumber(row[apartmentColumn + 1]);
      if (!Number.isNaN(fallback) && fallback > 0) {
        amounts.push(fallback);
      }
    }

    return amounts;
  }

  private isLikelyTotalColumn(
    columnIndex: number,
    headerRow1: (string | number)[],
    headerRow2: (string | number)[]
  ): boolean {
    const h1 = String(headerRow1[columnIndex] ?? '').toLowerCase();
    const h2 = String(headerRow2[columnIndex] ?? '').toLowerCase();

    if (h1.includes('за плащане')) {
      return true;
    }

    return /\d+\s*[–-]\s*\d+/.test(h2);
  }

  private normalizeApartment(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private toNumber(value: string | number | undefined): number {
    if (value === undefined || value === '') {
      return Number.NaN;
    }

    if (typeof value === 'number') {
      return value;
    }

    const normalized = value
      .replace(/\s/g, '')
      .replace(',', '.')
      .replace(/[^\d.-]/g, '');

    if (!normalized || normalized === '.' || normalized === '-' || normalized === '-.') {
      return Number.NaN;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
}
