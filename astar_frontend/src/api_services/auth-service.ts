import {Injectable, inject, NgZone} from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  User,
  authState,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from '@angular/fire/auth';
import {Router} from '@angular/router';


import {Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  readonly user$: Observable<User | null> = authState(this.auth);

  loginWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(this.auth, provider);
      console.log('User signed in:', result.user);
      //Navigate to dashboard
      this.ngZone.run(async () => {
        const ok = await this.router.navigate(['portal',])
        if (ok){
          console.log('router.url', this.router.url);
          console.log('location.href', window.location.href);
        }
      })
    }
    catch (error) {
      console.log('Error signing in:', error);
    }
  }

  logout() {
    return signOut(this.auth);
  }
}
