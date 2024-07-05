import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddMovieComponent } from './add-movie/add-movie.component';
import { ViewMovieComponent } from './view-movie/view-movie.component';
import {LayoutModule} from "../layout/layout.module";
import {ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatChipsModule} from "@angular/material/chips";
import {MatIconModule} from "@angular/material/icon";
import { VideoUploadComponent } from './video-upload/video-upload.component';
import {NgxDropzoneModule} from "ngx-dropzone";
import {MaterialModule} from "../infrastructure/material/material.module";



@NgModule({
  declarations: [
    AddMovieComponent,
    ViewMovieComponent,
    VideoUploadComponent
  ],
    imports: [
        CommonModule,
        LayoutModule,
        ReactiveFormsModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        NgxDropzoneModule,
        MaterialModule
    ]
})
export class MovieModule { }