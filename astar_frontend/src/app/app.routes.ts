import { Routes } from '@angular/router';
import {LandingPageComponent} from './landing-page/landing-page';
import {LoginPageComponent} from './login-page-component/login-page-component';
import {PortalComponent} from './main-components/portal-component/portal-component';

export const routes: Routes = [
  {
    path: 'login', component: LoginPageComponent
  },
  {
    path: 'portal', component: PortalComponent
  },
  {
    path: '',
    component: LandingPageComponent,
    pathMatch: 'full',
  },
];
