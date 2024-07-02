import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogInComponent } from './log-in/log-in.component';

@NgModule({
  declarations: [LogInComponent],
  imports: [CommonModule],
  exports: [LogInComponent],
})
export class AuthModule {}
