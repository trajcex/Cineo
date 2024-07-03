import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './infrastructure/auth/auth.module';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { environment } from 'src/env/env';
import { HttpClientModule } from '@angular/common/http';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.userPoolId,
      userPoolClientId: environment.userPoolClientId,
    },
  },
});

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    AmplifyAuthenticatorModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
