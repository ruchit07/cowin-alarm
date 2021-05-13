export class SessionInput {
  pincode: number;
  date: string;
  interval: number;
  age: number;
  vacccine: string;
  fee_type: string;

  constructor(_pincode: number, _date: string, _age: number) {
    this.pincode = _pincode;
    this.date = _date;
    this.age = _age;
  }
}

export interface ISessionResult {
  sessions: ISession[]
}

export interface ISession {
  center_id: number
  name: string
  address: string
  state_name: string
  district_name: string
  block_name: string
  pincode: number
  from: string
  to: string
  lat: number
  long: number
  fee_type: string
  session_id: string
  date: string
  available_capacity: number
  fee: string
  min_age_limit: number
  vaccine: string
  slots: string[]
  is_matched: boolean;
}
