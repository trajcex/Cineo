import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import {MaterialModule} from "../infrastructure/material/material.module";
import {RouterLink} from "@angular/router";



@NgModule({
    declarations: [
        NavBarComponent
    ],
    exports: [
        NavBarComponent
    ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterLink
  ]
})
export class LayoutModule { }
