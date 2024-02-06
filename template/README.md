# How to use the template

## Clone repository

## Install

Install nodejs dependencies
```
npm install
```

Install app dependencies
```
cd app
npm install
```

## Deploy to Firebase

### Create a Firebase Project

Go to [Firebase](https://console.firebase.google.com/)

### Login

Logout of an account (Optional)
```
npm run firebase logout
```

```
npm run firebase login
```

### Initialize
```
npm run firebase init
```

### Preview
```
npm run firebase:preview
```

### Deploy
```
npm run firebase:deploy
```

## Setup Authentication

### Install AngularFire
```
ng add @angular/fire
```

### Setup FirebaseUI
[Easily add sign-in to your Web app with FirebaseUI](https://firebase.google.com/docs/auth/web/firebaseui)

### Setup Firebase Web App Config
Copy the web app config to src/environments/environments.ts
```js
export const environment = {
    production: true,
    firebase: {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: ""
    }
};
```

### Additional Settings
* [Email enumeration protection](https://github.com/firebase/firebaseui-web/issues/1040#issuecomment-1914190991)

## Run

Development mode
```
npm run watch
```

Demo mode
```
npm run serve
```