export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}
