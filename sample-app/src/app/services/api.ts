import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiObject } from '../models/object.model';

@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient){}

  private baseUrl='https://api.restful-api.dev/objects';

  getAll(): Observable<ApiObject[]>{
    return this.http.get<ApiObject[]>(this.baseUrl);
  }
  
getbyId(id: number | string): Observable<ApiObject> {
  const safeId = encodeURIComponent(String(id));
  return this.http.get<ApiObject>(`${this.baseUrl}/${safeId}`);
}}
