import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogInComponent } from './log-in/log-in.component';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import {LayoutModule} from "../../layout/layout.module";

@NgModule({
  declarations: [LogInComponent],
  imports: [CommonModule, AmplifyAuthenticatorModule, LayoutModule],
  exports: [LogInComponent],
})
export class AuthModule {}
