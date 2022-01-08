import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { iif, Observable,  of,  throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators/catchError';
import { finalize, mergeMap, retryWhen, tap } from 'rxjs/operators';
import { timer } from 'rxjs/internal/observable/timer';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})
export class HttpService {

    constructor(
        private http: HttpClient,
        private toastr: ToastrService,
    ) {}

    httpGet<T>(url: string, id?: string, options?: any): Observable<HttpResponse<T>> {
        const httpOptions = options == null ? this.setHttpOptions() : options;
        const apiUrl = id == null ? url : `${url}/${id}`;
        return this.http.get<T>(apiUrl, httpOptions)
        .pipe(
            mergeMap((resp: HttpResponse<any>) =>
                iif(() => resp.status === 200,
                    of(resp),
                    throwError(resp.body)
                )
            ),
            retryWhen(this.genericRetryStrategy()),
            catchError(this.handleError<any>(url))
        );
    }

    httpPost<T>(url: string, payload: any, options?: any): Observable<HttpResponse<unknown>> {
        const httpOptions = options == null ? this.setHttpOptions() : options;
        return this.http.post<T>(url, payload, httpOptions)
        .pipe(
            mergeMap((resp: HttpResponse<any>) =>
                iif(() => resp.status === 200,
                    of(resp),
                    throwError(resp.body)
                )
            ),
            retryWhen(this.genericRetryStrategy()),
            catchError(this.handleError<any>(url))
        );
    }

    httpPut(url: string, object: any, options?: any): Observable<HttpResponse<unknown>> {
        const httpOptions = options == null ? this.setHttpOptions() : options;
        return this.http.put<any>(url, object, httpOptions)
        .pipe(
            mergeMap((resp: HttpResponse<any>) =>
                iif(() => resp.status === 200,
                    of(resp),
                    throwError(resp.body)
                )
            ),
            retryWhen(this.genericRetryStrategy()),
            catchError(this.handleError<any>(url))
        );
    }

    httpDelete(url: string, id: string, options?: any) : Observable<HttpResponse<unknown>> {
        const httpOptions = options == null ? this.setHttpOptions() : options;
        const apiUrl = id == null ? url : `${url}/${id}`;
        return this.http.delete<any>(apiUrl, httpOptions)
        .pipe(
            mergeMap((resp: HttpResponse<any>) =>
                iif(() => resp.status === 200,
                    of(resp),
                    throwError(resp.body)
                )
            ),
            retryWhen(this.genericRetryStrategy()),
            catchError(this.handleError<any>(url))
        );
    }
    private genericRetryStrategy = ({
        maxRetryAttempts = 1,
        scalingDuration = 1000,
        excludedStatusCodes = [ 401 ]
      }: {
        maxRetryAttempts?: number,
        scalingDuration?: number,
        excludedStatusCodes?: number[]
      } = {}) => (attempts: Observable<any>) => {
        return attempts.pipe(
          mergeMap((error, i) => {
            const retryAttempt = i + 1;
            // if maximum number of retries have been met
            // or response is a status code we don't wish to retry, throw error
            if (
              retryAttempt > maxRetryAttempts ||
              excludedStatusCodes.find(e => e === error.status)
            ) {
                return throwError(error);
            }
            console.log(
              `${error.status} Attempt ${retryAttempt}: retrying in ${retryAttempt *
                scalingDuration}ms`
            );
            // retry after 1s, 2s, etc...
            return timer(retryAttempt * scalingDuration);
          }),
          finalize(() => console.log('end of retry!'))
        );
      };

    private setHttpOptions() {
        return {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
        observe: 'response' as 'response',
        };
    }

    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.log(`${operation} failed - ${result}`);
            console.error(error);
            
            let message = '<p>Something went error. Please contact IT.<p>';
            message += this.getErrorMessage(error);
            this.toastr.error(message);
            return throwError(error);
        };
    }

    private getErrorMessage(error): string
    {
        let message = `<b>Details</b><br> - Http status code: ${error.status}`;
        if(error.statusText && error.statusText !== 'OK'){
            message += `<br> - status text: ${error.statusText}`
        }
        if (error.message){
            message += `<br> - ${error.message}`;
        } else {
            message += `<br> - ${error.statusCode}`;
        }

        return message;

    }
    
}
