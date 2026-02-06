import { Injectable } from '@nestjs/common';

@Injectable()
export class ReportTemplateService {
  constuctor() {}

  private registerHelpers(): void {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      if (!date) return '';
      const d = new Date(date);
      if (format === 'short') {
        return d.toLocaleDateString();
      } else if (format === 'long') {
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }
      return d.toISOString();
    });

    // Number formatting helper
    Handlebars.registerHelper(
      'formatNumber',
      (num: number, decimals: number = 2) => {
        if (num === null || num === undefined) return '';
        return num.toFixed(decimals);
      },
    );

    // Currency formatting helper
    Handlebars.registerHelper(
      'formatCurrency',
      (amount: number, currency: string = 'USD') => {
        if (amount === null || amount === undefined) return '';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(amount);
      },
    );

    // Conditional equality helper
    Handlebars.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    // Conditional comparison helpers
    Handlebars.registerHelper('gt', (a: number, b: number) => {
      return a > b;
    });

    Handlebars.registerHelper('lt', (a: number, b: number) => {
      return a < b;
    });

    // Math operations
    Handlebars.registerHelper('add', (a: number, b: number) => {
      return a + b;
    });

    Handlebars.registerHelper('subtract', (a: number, b: number) => {
      return a - b;
    });

    Handlebars.registerHelper('multiply', (a: number, b: number) => {
      return a * b;
    });

    Handlebars.registerHelper('divide', (a: number, b: number) => {
      return b !== 0 ? a / b : 0;
    });

    // Array length helper
    Handlebars.registerHelper('length', (array: any[]) => {
      return array ? array.length : 0;
    });

    // JSON stringify helper
    Handlebars.registerHelper('json', (context: any) => {
      return JSON.stringify(context, null, 2);
    });

    // Uppercase/lowercase helpers
    Handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    Handlebars.registerHelper('lowercase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    // Default value helper
    Handlebars.registerHelper('default', (value: any, defaultValue: any) => {
      return value !== null && value !== undefined ? value : defaultValue;
    });
  }

  // Method to add custom helpers dynamically
  registerCustomHelper(name: string, fn: Handlebars.HelperDelegate): void {
    Handlebars.registerHelper(name, fn);
  }
}
