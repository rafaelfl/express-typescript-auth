export interface Error {
  statusCode?: number;
  message?: string;
  errors?: Array<Error>;
}
