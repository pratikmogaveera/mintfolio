import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface Response<T> {
  success: boolean;
  data: T | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data: T) => ({ success: true, data: data ?? null })));
  }
}
