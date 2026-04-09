
export interface ServiceResult<T> {
  success: boolean;
  title: string;
  successMessage?: string;
  errorMessage?: string;
  data?: T;
  dataList?: T[];
  token?: string;
  role?: string;
}

export class ServiceResponse {
  static Success<T>(
    SuccessMessage: string,
    Data?: T,
    DataList?: T[]
  ): ServiceResult<T> {
    return {
      success: true,
      title: 'SUCCESS',
      successMessage: SuccessMessage,
      data: Data,
      dataList: DataList,
    };
  }

  static Failure<T>(Title: string, ErrorMessage?: string): ServiceResult<T> {
    return {
      success: false,
      title: Title,
      errorMessage: ErrorMessage,
    };
  }

  static Auth<T>(
    Token: string,
    SuccessMessage?: string,
    Role?: string
  ): ServiceResult<T> {
    return {
      success: true,
      title: 'AUTH_SUCCESS',
      successMessage: SuccessMessage,
      token: Token,
      role: Role,
    };
  }
}
