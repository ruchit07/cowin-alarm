import { Injectable } from '@angular/core';
import { HttpClientService } from './http-client.service';

const BASE_URI: string = "https://cdn-api.co-vin.in/api/v2";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private _httpClient: HttpClientService) {
  }

  getSessionByPin(data: any) {
    return this._httpClient.get(`${BASE_URI}/appointment/sessions/public/findByPin?${data}`);
  }
}