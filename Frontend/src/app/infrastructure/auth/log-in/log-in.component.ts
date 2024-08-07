import { Component } from '@angular/core';
import { AuthServiceService } from 'src/app/service/auth-service.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/env/env';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LogInComponent {
  formFields = {
    signUp: {
      email: {
        order: 1,
      },
      password: {
        order: 2,
      },
      confirm_password: {
        order: 3,
      },
      nickname: {
        order: 4,
      },
      birthdate: {
        order: 5,
      },
      given_name: {
        order: 6,
      },
      family_name: {
        order: 7,
      },
    },
  };

  constructor(private http: HttpClient, private auth: AuthServiceService) {}

  ngOnInit(): void {
    console.log(this.auth.getCurrentRole());
  }
}
