import { NgModule, inject } from '@angular/core';
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot, Routes } from '@angular/router';
import { HelloComponent } from './hello/hello.component';
import { AuthService } from './auth/auth.service';

const routes: Routes = [
  {
    path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: '', component: HelloComponent,
    canActivate: [(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => inject(AuthService).canActivate(state)]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
