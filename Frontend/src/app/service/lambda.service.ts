import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from 'src/env/env';
@Injectable({
  providedIn: 'root',
})
export class LambdaService {
  constructor(private http: HttpClient) {}

  url: string =
    'https://' + environment.apiID + '.execute-api.eu-central-1.amazonaws.com';

  public postVideo(body: any): Observable<string> {
    // @ts-ignore
    return this.http
      .post(this.url + '/upload', body, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        responseType: 'text', // Postavite responseType na 'text' ovde
        observe: 'response', // Opciono, ako želite pristup celom HttpResponse-u
      })
      .pipe(
        map((response: HttpResponse<string>) => {
          return response.body;
        })
      );
  }

  public getPossibleSubscriptions(): Observable<any> {
    return this.http.get(this.url + '/getPossibleSubcription');
  }
}
