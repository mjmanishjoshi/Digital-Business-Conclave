import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isLoggedIn = false;
  private redirectUrl!: string;

  constructor(private auth: Auth, private router: Router) {
    auth.onAuthStateChanged(user => {
      this.isLoggedIn = user ? true : false;
    });
  }

  canActivate(state: RouterStateSnapshot) {
    return this.auth.authStateReady().then(() => {
      if (!this.isLoggedIn) {
        this.redirectUrl = state.url;
        this.router.navigate(['auth']);
      }
      return this.isLoggedIn;
    });
  }

  renderAuthUI(element: any) {
    const uiConfig: firebaseui.auth.Config = {
      callbacks: {
        // Called when the user has been successfully signed in.
        signInSuccessWithAuthResult: (authResult, redirectUrl) => {
          console.log(redirectUrl);
          if (authResult.user) {
            console.log(authResult.user);
          }
          if (authResult.additionalUserInfo) {
            console.log(authResult.additionalUserInfo.isNewUser);
          }
          return this.redirectOnSuccess();
        }
      },
      //signInSuccessUrl: 'http://localhost:4200/test',
      signInFlow: 'popup',
      signInOptions: [
        // Leave the lines as is for the providers you want to offer your users.
        //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        //firebase.auth.GithubAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          // Whether the display name should be displayed in Sign Up page.
          requireDisplayName: true,
          signInMethod: firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD,
          disableSignUp: {
            status: false
          }
        },
        //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
      ],
      // tosUrl and privacyPolicyUrl accept either url string or a callback
      // function.
      // Terms of service url/callback.
      tosUrl: '<your-tos-url>',
      // Privacy policy url/callback.
      privacyPolicyUrl: function () {
        window.location.assign('<your-privacy-policy-url>');
      }
    };
    // Initialize the FirebaseUI Widget using Firebase.
    const ui = new firebaseui.auth.AuthUI(this.auth);
    // The start method will wait until the DOM is loaded.
    ui.start(element, uiConfig);
  }

  logout() {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    })
  }

  private redirectOnSuccess() {
    if (this.redirectUrl)
      this.router.navigateByUrl(this.redirectUrl);
    else
      this.router.navigate(['/']);
    return false;
  }
}
