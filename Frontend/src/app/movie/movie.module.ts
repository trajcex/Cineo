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
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { ChangeMovieComponent } from './change-movie/change-movie.component';
import { RouterModule } from '@angular/router';
import { UpdateImageComponent } from './update-image/update-image.component';



@NgModule({
  declarations: [
    AddMovieComponent,
    ViewMovieComponent,
    VideoUploadComponent,
    ImageUploadComponent,
    ChangeMovieComponent,
    UpdateImageComponent
  ],
    imports: [
        CommonModule,
        LayoutModule,
        ReactiveFormsModule,
        MatInputModule,
        MatChipsModule,
        MatIconModule,
        NgxDropzoneModule,
        MaterialModule,
        RouterModule
    ],
    exports:[
      ViewMovieComponent,
      AddMovieComponent
    ]
})
export class MovieModule { }
