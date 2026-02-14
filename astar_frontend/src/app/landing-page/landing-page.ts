
import { Component,inject } from '@angular/core';
import {CommonModule} from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list'; // Optional, or use Flexbox in SCSS
import {MatCard} from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone:true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatCard,
    MatGridListModule,
  ],
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss']
})
export class LandingPageComponent {
  private router = inject(Router);

  // Data for the 'Services' section to keep HTML clean
  services = [
    {
      title: 'Academic Tutoring',
      subtitle: 'K-12 & College Level',
      description: 'Personalized 1-on-1 sessions in Math, Science, and Languages to boost your GPA.',
      icon: 'school'
    },
    {
      title: 'Test Prep',
      subtitle: 'SAT, ACT, & GRE',
      description: 'Master the strategies you need to score in the top 1% with our proven curriculum.',
      icon: 'assignment_turned_in'
    },
    {
      title: 'Mock Exams',
      subtitle: 'Real Conditions',
      description: 'Take full-length practice exams in a proctored environment to build stamina and confidence.',
      icon: 'timer'
    }
  ];

  constructor() {}

  onLogin() {
    this.router.navigate(['login']);
  }

  onGetStarted() {
    console.log('Scroll to signup...');
  }
}
