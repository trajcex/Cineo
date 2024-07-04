import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/env';
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
}
