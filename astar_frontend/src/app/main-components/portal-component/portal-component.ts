import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

// Interfaces for type safety
interface Assessment {
  id: number;
  title: string;
  subject: string;
  duration: string; // e.g., '90 mins'
  status: 'New' | 'In Progress' | 'Completed';
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface UpcomingSession {
  subject: string;
  tutor: string;
  date: string;
  time: string;
}

@Component({
  selector: 'app-portal',
  standalone: true, // Remove if using NgModules
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './portal-component.html',
  styleUrls: ['./portal-component.scss']
})
export class PortalComponent {

  // Dashboard Data
  userName = 'Alex';
  stats = {
    testsCompleted: 12,
    avgScore: 88,
    studyHours: 45
  };

  upcomingSessions: UpcomingSession[] = [
    { subject: 'Advanced Calculus', tutor: 'Dr. Smith', date: 'Feb 15', time: '10:00 AM' },
    { subject: 'Physics Lab Prep', tutor: 'Ms. Johnson', date: 'Feb 17', time: '2:00 PM' },
  ];

  displayedColumns: string[] = ['subject', 'tutor', 'date', 'time', 'action'];

  // Assessment Data
  assessments: Assessment[] = [
    { id: 1, title: 'SAT Math Practice 1', subject: 'Math', duration: '60 mins', status: 'New', difficulty: 'Medium' },
    { id: 2, title: 'Physics Mechanics', subject: 'Science', duration: '45 mins', status: 'In Progress', difficulty: 'Hard' },
    { id: 3, title: 'English Literature', subject: 'English', duration: '90 mins', status: 'Completed', difficulty: 'Easy' },
    { id: 4, title: 'Chemistry Basics', subject: 'Science', duration: '30 mins', status: 'New', difficulty: 'Medium' }
  ];

  constructor() {}

  startAssessment(test: Assessment) {
    console.log(`Starting assessment: ${test.title}`);
    // Navigate to actual test runner component here
  }

  joinSession(session: UpcomingSession) {
    console.log(`Joining session for ${session.subject}`);
  }
}
