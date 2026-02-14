import { Routes } from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page';
import {LoginPageComponent} from './login-page-component/login-page-component';

export const routes: Routes = [
  {
    path: '', component: LandingPageComponent,
  },
  {
    path: 'login', component: LoginPageComponent
  }
];
