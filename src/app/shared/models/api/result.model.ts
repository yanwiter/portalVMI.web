export interface Result<T> {
  isSuccess: boolean;
  error?: ErrorDetails;
  data?: T;
  items?: T;
  pagination?: PaginationDetails;
}

export interface ErrorDetails {
  statusCode: number;
  message: string;
}

export interface PaginationDetails {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}
