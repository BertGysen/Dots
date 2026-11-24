import { Injectable } from '@angular/core';

/** The one place that writes to the console, so a remote sink can replace it later. */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(message: string, error?: unknown): void {
    console.error(message, error);
  }
}
