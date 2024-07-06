import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    return this.http.post<string>(this.url + '/upload', body);
  }
  getMovie(id: string, fileName: string, resolution: string): Observable<Movie> {
    const url = this.url + `/getMovie`;
    let params = new HttpParams()
      .set('file', fileName || '')
      .set('id',  id || '')
      .set('resolution', resolution || '')
      return this.http.get<Movie>(url, { params });
  }


}
