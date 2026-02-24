// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiObject } from '../models/object.model';

@Injectable({ providedIn: 'root' })
export class Api {
  constructor(private http: HttpClient) {}

  /** 👇 REPLACE with your actual collection name */
  private readonly collectionName = 'my-demo-collection';

  /** 👇 Keep /api so the proxy can attach x-api-key */
  private readonly baseUrl = `/api/collections/${this.collectionName}/objects`;

  getAll(): Observable<ApiObject[]> {
    return this.http.get<ApiObject[]>(this.baseUrl);
  }

  getbyId(id: number | string): Observable<ApiObject> {
    const safeId = encodeURIComponent(String(id));
    return this.http.get<ApiObject>(`${this.baseUrl}/${safeId}`);
  }

  create(payload: { name: string; data?: Record<string, any> }):
    Observable<ApiObject & { createdAt?: string }> {
    return this.http.post<ApiObject & { createdAt?: string }>(this.baseUrl, payload);
  }

  update(id: number | string, payload: { name: string; data?: Record<string, any> }):
    Observable<ApiObject & { updatedAt?: string }> {
    const safeId = encodeURIComponent(String(id));
    return this.http.put<ApiObject & { updatedAt?: string }>(`${this.baseUrl}/${safeId}`, payload);
  }

  listByIds(ids: string[]): Observable<ApiObject[]> {
    const params = ids.map(id => `id=${encodeURIComponent(id)}`).join('&');
    return this.http.get<ApiObject[]>(`${this.baseUrl}?${params}`);
  }

  
delete(id: number | string): Observable<{ message: string }> {
    const safeId = encodeURIComponent(String(id));
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${safeId}`);
  }

}
