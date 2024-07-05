import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogInComponent } from './log-in/log-in.component';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';
import {LayoutModule} from "../../layout/layout.module";
import {RouterOutlet} from "@angular/router";

@NgModule({
  declarations: [LogInComponent],
    imports: [CommonModule, AmplifyAuthenticatorModule, LayoutModule, RouterOutlet],
  exports: [LogInComponent],
})
export class AuthModule {}
