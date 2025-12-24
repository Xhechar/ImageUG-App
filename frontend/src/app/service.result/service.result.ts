
export interface ServiceResult<T> {
  Success: boolean;
  Title: string;
  SuccessMessage?: string;
  ErrorMessage?: string;
  Data?: T;
  DataList?: T[];
  Token?: string;
  Role?: string;
}

export class ServiceResponse {
  static Success<T>(
    SuccessMessage: string,
    Data?: T,
    DataList?: T[]
  ): ServiceResult<T> {
    return {
      Success: true,
      Title: 'SUCCESS',
      SuccessMessage,
      Data,
      DataList,
    };
  }

  static Failure<T>(Title: string, ErrorMessage?: string): ServiceResult<T> {
    return {
      Success: false,
      Title,
      ErrorMessage,
    };
  }

  static Auth<T>(
    Token: string,
    SuccessMessage?: string,
    Role?: string
  ): ServiceResult<T> {
    return {
      Success: true,
      Title: 'AUTH_SUCCESS',
      SuccessMessage,
      Token,
      Role,
    };
  }
}
