export class ResponseError extends Error {
  protected response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}
