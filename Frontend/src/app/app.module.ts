import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './infrastructure/auth/auth.module';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import { environment } from 'src/env/env';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Interceptor } from './infrastructure/auth/interceptor';
import {Subscriber} from "rxjs";
import {SubscriptionsModule} from "./subscriptions/subscriptions.module";
import {MovieModule} from "./movie/movie.module";
import {MoviesPageModule} from "./movies-page/movies-page.module";
import {NotificationsModule} from "./notifications/notifications.module";
import {LayoutModule} from "./layout/layout.module";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MaterialModule} from "./infrastructure/material/material.module";

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
    MovieModule,
    MoviesPageModule,
    LayoutModule,
    NotificationsModule,
    SubscriptionsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: Interceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
