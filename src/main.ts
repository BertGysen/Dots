import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LoggerService } from './app/core/logger.service';

// The injector does not exist when bootstrap fails, so the logger is created directly.
bootstrapApplication(AppComponent, appConfig).catch((error: unknown) =>
  new LoggerService().error('Bootstrap failed', error),
);
