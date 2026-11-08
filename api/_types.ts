export interface ApiRequest {
  method?: string;
  url?: string;
  query?: any;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  setHeader(name: string, value: string): void;
  status(statusCode: number): ApiResponse;
  json(data: any): ApiResponse | void;
  end(): void;
}
