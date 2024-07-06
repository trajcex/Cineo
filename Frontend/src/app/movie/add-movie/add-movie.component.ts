import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { MatChipInputEvent, MatChipEditedEvent } from "@angular/material/chips";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../env/env";
import { Router } from "@angular/router";
import { ImageUploadComponent } from "../image-upload/image-upload.component";

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.css']
})
export class AddMovieComponent {
  @ViewChild(ImageUploadComponent) childComponent!: ImageUploadComponent;
  fb = inject(FormBuilder);

  title = "Let's add a new movie!";
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA];
  actors: string[] = [];
  genres: string[] = [];
  directors: string[] = [];
  formSubmitted: boolean = false;
  videoBase64: string = '';
  receivedImageBase64: string = '';

  picture: File[] = [];

  predefinedGenres: string[] = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

  constructor(private announcer: LiveAnnouncer, private http: HttpClient, private router: Router) {}

  handleImageBase64(base64String: string) {
    console.log('Received Base64 image in parent component:', base64String);
    this.receivedImageBase64 = base64String;
  }
  handleVideoBase64(base64String: string) {
    console.log('Received Base64 string in parent component:', base64String);
    this.videoBase64 = base64String;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.actors.push(value);
    }
    event.chipInput!.clear();
  }

  remove(actor: string): void {
    const index = this.actors.indexOf(actor);
    if (index >= 0) {
      this.actors.splice(index, 1);
      this.announce(`Removed ${actor}`);
    }
  }

  edit(actor: string, event: MatChipEditedEvent): void {
    const value = (event.value || '').trim();
    if (!value) {
      this.remove(actor);
      return;
    }

    const index = this.actors.indexOf(actor);
    if (index >= 0) {
      this.actors[index] = value;
    }
  }

  addDirector(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.directors.push(value);
    }
    event.chipInput!.clear();
  }

  removeDirector(director: string): void {
    const index = this.directors.indexOf(director);
    if (index >= 0) {
      this.directors.splice(index, 1);
      this.announce(`Removed ${director}`);
    }
  }

  editDirector(director: string, event: MatChipEditedEvent): void {
    const value = (event.value || '').trim();
    if (!value) {
      this.removeDirector(director);
      return;
    }

    const index = this.directors.indexOf(director);
    if (index >= 0) {
      this.directors[index] = value;
    }
  }

  announce(message: string): void {
    this.announcer.announce(message);
  }

  movie = this.fb.group({
    title: ['', Validators.required],
    fileName: ['', Validators.required],
    resolution: ['', Validators.required],
    description: ['', Validators.required],
    genres: [[]] // Initialize genres as an empty array
  });

  trimValues() {
    const title = this.movie.value.title;
    const fileName = this.movie.value.fileName;
    const resolution = this.movie.value.resolution;
    const description = this.movie.value.description;

    this.movie.patchValue({
      title: title?.trim(),
      description: description?.trim(),
      fileName: fileName?.trim(),
      resolution: resolution?.trim(),
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.trimValues();

    if (this.movie.invalid || this.videoBase64 === '' || this.receivedImageBase64 === '') {
      return;
    }

    // @ts-ignore
    if (this.actors.length === 0 || this.directors.length === 0 || this.movie.value.genres.length === 0) {
      return;
    }

    const body = {
      file_name: this.movie.value.fileName,
      title: this.movie.value.title,
      description: this.movie.value.description,
      actors: this.actors,
      directors: this.directors,
      genres: this.movie.value.genres, // Use selected genres from form value
      resolution: this.movie.value.resolution,
      video_data: this.videoBase64,
      // thumbnail: this.imageBase64String // Add image data to the body
    };

    console.log('Submitting:', body);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http
      .post(
        `https://${environment.apiID}.execute-api.eu-central-1.amazonaws.com/upload`,
        body,
        { headers, responseType: 'text' }
      )
      .subscribe({
        next: (result) => {
          console.log('Upload result:', result);
          this.router.navigate(["home"]);
          this.formSubmitted = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Upload error:', error);
          this.formSubmitted = false;
        },
      });
  }
}
