import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import { environment } from 'src/env/env';
import { Movie } from '../model/movieInfo';
@Injectable({
  providedIn: 'root',
})
export class LambdaService {
  constructor(private http: HttpClient) {}

  url: string =
    'https://' + environment.apiID + '.execute-api.eu-central-1.amazonaws.com';

  public postVideo(body: any): Observable<string> {
    // @ts-ignore
    return this.http.post(this.url + '/upload', body, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      responseType: 'text', // Postavite responseType na 'text' ovde
      observe: 'response' // Opciono, ako želite pristup celom HttpResponse-u
    }).pipe(
      map((response: HttpResponse<string>) => {
        return response.body;
      })
    );
  }
  getMovie(id: string, fileName: string, resolution: string): Observable<Movie> {
    const url = this.url + `/getMovie`;
    let params = new HttpParams()
      .set('file', fileName || '')
      .set('id',  id || '')
      .set('resolution', resolution || '')
      return this.http.get<Movie>(url, { params });
  }

  getMovieUrl(id: string, fileName: string, resolution: string): Observable<Movie> {
    const url = this.url + `/getMovieUrl`;
    let params = new HttpParams()
      .set('file', fileName || '')
      .set('id',  id || '')
      .set('resolution', resolution || '')
      return this.http.get<Movie>(url, { params });
  }

  downloadMovie(id: string, fileName: string, resolution: string): Observable<Movie> {
    const url = this.url + `/download`;
    let params = new HttpParams()
      .set('file', fileName || '')
      .set('id',  id || '')
      .set('resolution', resolution || '')
      return this.http.get<Movie>(url, { params });
  }
  deleteMovie(id: string, fileName: string): Observable<string> {
    const url = this.url + `/delete`;
    let params = new HttpParams()
      .set('file', fileName || '')
      .set('id',  id || '')
      return this.http.delete<string>(url, { params });
  }


}
