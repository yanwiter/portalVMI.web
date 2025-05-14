import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Result } from "../../models/api/result.model";
import { ApiRoutesV1 } from "../../models/api/routes-v1.model";
import { IApiEndpoints } from "../../models/api/routes.model";

@Injectable({
  providedIn: "root",
})
export class GenericService<T> {
  private http = inject(HttpClient);

  apiRoutes: ApiRoutesV1 = new ApiRoutesV1();

  public getAll(endpoint: keyof IApiEndpoints, specificRoute?: string[], ...args: string[]): Observable<Result<T[]>> {
    return this.http.get<Result<T[]>>(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}${this.apiRoutes.getQueryParams(args)}`);
  }

  public get(endpoint: keyof IApiEndpoints, id: number | string, specificRoute?: string[], ...args: string[]): Observable<Result<T>> {
    return this.http.get<Result<T>>(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}/${id}${this.apiRoutes.getQueryParams(args)}`);
  }

  public post(endpoint: keyof IApiEndpoints, item: T, specificRoute?: string[], ...args: string[]): Observable<Result<T>> {
    return this.http.post<Result<T>>(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}${this.apiRoutes.getQueryParams(args)}`, item);
  }

  public postWithBody(endpoint: keyof IApiEndpoints, specificRoute?: string[], body?: any, ...args: string[]): Observable<Result<T>> {
    return this.http.post<Result<T>>(
        `${this.apiRoutes.getFullUrl(endpoint, specificRoute)}${this.apiRoutes.getQueryParams(args)}`, 
        body
    );
  }

  public update(endpoint: keyof IApiEndpoints, id: number | string, item: T, specificRoute?: string[], ...args: string[]): Observable<Result<T>> {
    return this.http.put<Result<T>>(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}${this.apiRoutes.getQueryParams(args)}/${id}`, item);
  }

  public delete(endpoint: keyof IApiEndpoints, id: number | string, specificRoute?: string[], ...args: string[]): Observable<Result<T>> {
    return this.http.delete<Result<T>>(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}/${id}${this.apiRoutes.getQueryParams(args)}`);
  }

  public getfile(endpoint: keyof IApiEndpoints, id: number | string, specificRoute?: string[], ...args: string[]): Observable<Blob> {
    return this.http.get(`${this.apiRoutes.getFullUrl(endpoint, specificRoute)}/${id}${this.apiRoutes.getQueryParams(args)}`
      , { responseType: 'blob' }) as Observable<Blob>;
  }

  public postfile(
    endpoint: keyof IApiEndpoints, item: T,
    id: number | string,
    specificRoute?: string[],
    ...args: string[]): Observable<Blob> {
    return this.http.post(
      `${this.apiRoutes.getFullUrl(endpoint, specificRoute)}/${id}${this.apiRoutes.getQueryParams(args)}`,
      item,
      { responseType: 'blob' }) as Observable<Blob>;
  }
}
