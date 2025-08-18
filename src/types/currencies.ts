export interface Currency {
  code: string;
  symbol: string;
}

export class CurrencyImplementation implements Currency {
  private constructor(
    public readonly code: string,
    public readonly symbol: string,
  ) {
    // Ensure immutability
    Object.freeze(this);
  }

  // Pre-defined currency instances
  static readonly USD = new CurrencyImplementation('USD', '$');
  static readonly AUD = new CurrencyImplementation('AUD', 'A$');
  static readonly PHP = new CurrencyImplementation('PHP', '₱');

  // Retrieval methods
  static getAllCurrencies(): readonly Currency[] {
    return [
      CurrencyImplementation.USD,
      CurrencyImplementation.AUD,
      CurrencyImplementation.PHP,
    ];
  }

  static fromCode(code: string): Currency | undefined {
    return CurrencyImplementation.getAllCurrencies().find(
      (c) => c.code === code,
    );
  }

  // Domain behavior
  format(amount: number): string {
    return `${this.symbol}${amount.toFixed(2)}`;
  }

  // Value equality
  equals(other: Currency): boolean {
    return this.code === other.code;
  }
}

// For backward compatibility
export const CURRENCIES = CurrencyImplementation.getAllCurrencies();
