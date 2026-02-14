import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {provideFirebaseApp, initializeApp} from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import {environment} from '../environments/environment';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseApp( ()=>initializeApp(environment.firebase)),
    provideAuth(()=>getAuth()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes)
  ]
};
