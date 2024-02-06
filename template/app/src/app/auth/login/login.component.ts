import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {

  constructor(private auth: AuthService, private elementRef: ElementRef<any>) { }

  ngAfterViewInit(): void {
    this.auth.renderAuthUI(this.elementRef.nativeElement);
  }
}
