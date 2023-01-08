import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const res = context.getResponse<Response>();
    let msg = 'internal server error';
    let status = 500;

    if (exception instanceof HttpException) {
      if (exception.name === 'BadRequestException') {
        const { statusCode, message } = exception.getResponse() as {
          statusCode: number;
          message: string | string[];
        };
        res.status(statusCode).json({ message });
        return;
      }
      msg = exception.message;
      status = exception.getStatus();
    }

    if (exception instanceof QueryFailedError) {
      msg = exception.message;
      status = 422;
    }
    if (exception instanceof EntityNotFoundError) {
      msg = exception.message;
      status = 404;
    }
    res.status(status).json({ message: msg });
  }
}
