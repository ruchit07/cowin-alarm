import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpClientService {

    constructor(
        private http: HttpClient
    ) { }

    /**
     * Make http GET request without authentication token
     * @param url
     */
    get(url: string) {
        return this.http.get<any>(url);
    }
}
