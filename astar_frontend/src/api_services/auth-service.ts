import {Injectable, inject, NgZone, signal} from '@angular/core';
import {
    Auth,
    GoogleAuthProvider,
    User,
    UserCredential,
    authState,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
} from '@angular/fire/auth';
import {Router} from '@angular/router';


import {Observable, BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {
    private auth = inject(Auth);
    private router = inject(Router);
    private ngZone = inject(NgZone);

    // ADDED: localStorage keys (version them so you can rotate later)
    private readonly AUTH_CRED_KEY = 'fb_user_cred_v1';
    private readonly AUTH_TOKEN_KEY = 'fb_id_token_v1';

    token = signal<string | null>(null);
    readonly token$ = new BehaviorSubject<string | null>(null);

    constructor(){
        this.loadTokenFromLocalStorage();

        this.user$.subscribe(async(user)=>{
            if (!user){
                this.token.set(null);
                this.token$.next(null);
                localStorage.removeItem(this.AUTH_TOKEN_KEY);
                localStorage.removeItem(this.AUTH_CRED_KEY);
                return;
            }

            const idToken = await user.getIdToken();
            this.token.set(idToken);
            this.token$.next(idToken);
            localStorage.setItem(this.AUTH_TOKEN_KEY, idToken);
            const snapshot = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                providerId: user.providerData?.[0]?.providerId ?? null,
                storedAt: new Date().toISOString()
            }
            localStorage.setItem(this.AUTH_CRED_KEY, JSON.stringify(snapshot));
        })
    }

    private async storeCredentialToLocalStorage(cred: UserCredential): Promise<void> {
        const user = cred.user;
        const idToken = await user.getIdToken();

        this.token.set(idToken);
        this.token$.next(idToken);

        const snapshot = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL : user.photoURL,
            providerId: user.providerData?.[0].providerId ?? null,
            storedAt: new Date().toISOString(),
        }
        localStorage.setItem(this.AUTH_CRED_KEY, JSON.stringify(snapshot));
        localStorage.setItem(this.AUTH_TOKEN_KEY, idToken);
    }

    private loadTokenFromLocalStorage(): void {
        const token = localStorage.getItem(this.AUTH_TOKEN_KEY);
        this.token.set(token);
        this.token$.next(token);
    }

    async getBearerToken(): Promise<string|null>{
        const user = this.auth.currentUser;
        if (!user) return null;
        const freshToken = await user.getIdToken();
        this.token.set(freshToken);
        this.token$.next(freshToken);
        localStorage.setItem(this.AUTH_TOKEN_KEY, freshToken);
        return freshToken;
    }


    readonly user$: Observable<User | null> = authState(this.auth);

    async loginWithEmail(email: string, password: string) {
        const cred = await signInWithEmailAndPassword(this.auth, email, password);
        await this.storeCredentialToLocalStorage(cred);
        return cred;
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            await this.storeCredentialToLocalStorage(result);
            this.ngZone.run(async () => {
                const ok = await this.router.navigate(['portal',])
                if (ok) {
                    console.log('router.url', this.router.url);
                    console.log('location.href', window.location.href);
                }
            })
        } catch (error) {
            console.log('Error signing in:', error);
        }
    }

    logout() {
        this.token.set(null);
        this.token$.next(null);
        localStorage.removeItem(this.AUTH_TOKEN_KEY);
        localStorage.removeItem(this.AUTH_CRED_KEY);

        return signOut(this.auth);
    }
}
