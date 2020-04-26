export class Response {
  success: boolean;

  constructor(public error: Error, public data: any) {
    this.success = !!error;
  }
}
