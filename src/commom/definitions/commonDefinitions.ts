export interface CommonResponse {
  msg: string;
}

export interface CommonResponseWithId extends CommonResponse {
  id?: string;
}
