import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeMovieComponent } from './change-movie.component';

describe('ChangeMovieComponent', () => {
  let component: ChangeMovieComponent;
  let fixture: ComponentFixture<ChangeMovieComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChangeMovieComponent]
    });
    fixture = TestBed.createComponent(ChangeMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
