import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie } from 'src/app/model/movieInfo';
import { LambdaService } from 'src/app/service/lambda.service';

@Component({
  selector: 'app-change-movie',
  templateUrl: './change-movie.component.html',
  styleUrls: ['./change-movie.component.css']
})
export class ChangeMovieComponent {
  fb = inject(FormBuilder);

  constructor(private lambdaService: LambdaService, private router: Router,private announcer: LiveAnnouncer,private route: ActivatedRoute) {}
  
  id : string = "";
  fileName: string = "";

  title = "Change data about your video";
  actors: string[] = ["asdfas","asdf"];
  genres: string[] | undefined;
  directors: string[] = [];
  preDefinedTitle: string = "";

  movieData = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    genres: []
  });
  selectedGenres: string[] = [];
  ngOnInit(): void {
      this.route.queryParams.subscribe(params => {
        this.id = params['id'];
        this.fileName = params['fileName'];
        console.log(this.id, this.fileName);
        this.actors = params['actors'];
        this.directors = params['directors'];
        
        this.movieData = this.fb.group({
          title: [params['title'], Validators.required],
          description: [params['description'], Validators.required],
          genres: [params['genres']]
        });        
        this.selectedGenres = params['genres'][0].split(',').map((genre: string) => genre.trim());
        }
      );
  }


  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA];

  formSubmitted: boolean = false;

  picture: File[] = [];

  predefinedGenres: string[] = ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];


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

  trimValues() {
    const title = this.movieData.value.title;

    const description = this.movieData.value.description;

    this.movieData.patchValue({
      title: title?.trim(),
      description: description?.trim(),
    });
  }

  onSubmit(): void {
    this.formSubmitted = true;
    this.trimValues();
    console.log(this.movieData.value.genres)
    if (this.movieData.invalid) {
      return;
    }

    // @ts-ignore
    if (this.actors.length === 0 || this.directors.length === 0 || this.movieData.value.genres.length === 0) {
      return;
    }

    const body = {
      title: this.movieData.value.title,
      description: this.movieData.value.description,
      actors: this.actors,
      directors: this.directors,
      genres: this.movieData.value.genres,
    };

    console.log('Submitting:', body);

    this.lambdaService.changeMovie(this.id, body.directors || [], body.actors || [], body.genres || [], body.title || "", body.description || "").subscribe({
      next:(message: string) => {
        
        console.log(message);
        this.router.navigate(['/view-movie'], { queryParams: {id: this.id, fileName: this.fileName} });
      }
    })
    
  }
}
