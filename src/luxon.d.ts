declare module 'luxon' {
  interface DateTime {
    setZone(zone: string): DateTime;
    toISO(): string | null;
    toMillis(): number;
    diff(other: DateTime, unit: string | string[], options?: any): { seconds: number; [key: string]: any };
    toFormat(format: string): string;
  }

  interface DateTimeConstructor {
    now(): DateTime;
    fromISO(iso: string, options?: any): DateTime;
    fromFormat(text: string, format: string, options?: any): DateTime;
    fromSQL(sql: string, options?: any): DateTime;
    fromMillis(millis: number, options?: any): DateTime;
  }

  export const DateTime: DateTimeConstructor;
}
