export default class BaseResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;

  constructor(success: boolean, message: string, data?: T, statusCode?: number) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }

  static success<T>(data: T, message: string = "Success"): BaseResponse<T> {
    return new BaseResponse<T>(true, message, data, 200);
  }

  static error<T>(message: string, data?: T): BaseResponse<T> {
    return new BaseResponse<T>(false, message, data , 500);
  }
  static notFound<T>(message: string, data?: T): BaseResponse<T> {
    return new BaseResponse<T>(false, message, data, 404);
  }
}
