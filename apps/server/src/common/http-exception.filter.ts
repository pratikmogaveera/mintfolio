import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponseMessage {
  message: string | string[];
  error: string;
  statusCode: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof HttpException) {
      const responseMessage = exception.getResponse();
      const status = exception.getStatus();

      const message =
        typeof responseMessage === 'string' ? responseMessage : (responseMessage as ErrorResponseMessage).message;

      response.status(status).json({
        statusCode: status,
        success: false,
        message: message,
      });
    } else {
      console.error('Unhandled exception:', exception);
      response.status(500).json({
        statusCode: 500,
        success: false,
        message: 'Something went wrong.',
      });
    }
  }
}
