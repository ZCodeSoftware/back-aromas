import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseErrorException } from '../../../domain/exceptions/base.error.exception';

@Catch(BaseErrorException)
export class BaseErrorFilter implements ExceptionFilter<BaseErrorException> {
    private readonly logger = new Logger(BaseErrorFilter.name);

    catch(exception: BaseErrorException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const statusCode =
            typeof exception.statusCode === 'number' && exception.statusCode >= 400
                ? exception.statusCode
                : HttpStatus.INTERNAL_SERVER_ERROR;

        if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(`${request.method} ${request.url} - ${exception.message}`, exception.stack);
        }

        response.status(statusCode).json({
            statusCode,
            message: exception.message,
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
}
