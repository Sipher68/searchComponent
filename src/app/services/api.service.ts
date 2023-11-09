import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { PlacesInterface } from '../places.interface';
import { tap } from 'rxjs/operators';
import { Places } from 'src/data';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}
  opts: Record<string, PlacesInterface[]> = {};

  getPlaces(searchValue: string): Observable<PlacesInterface[]> {
    return this.http.get<PlacesInterface[]>(
      `http://172.16.16.146:8811/api/v1/ceb/places/search/${searchValue}`
    );
  }

  getData(searchValue: string): Observable<PlacesInterface[]> {
    if (this.opts[searchValue]) {
      return of(this.opts[searchValue]);
    } else {
      return this.http
        .get<PlacesInterface[]>(
          `http://172.16.16.146:8811/api/v1/ceb/places/search/${searchValue}`
        )
        .pipe(tap((data) => (this.opts[searchValue] = data)));
    }
  }

  getMockData() {
    return of(Places);
  }
}
