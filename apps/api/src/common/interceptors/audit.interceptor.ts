import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuditLog {
  timestamp: string;
  method: string;
  path: string;
  userId?: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  responseTime: number;
  body?: Record<string, unknown>;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    const auditData: Partial<AuditLog> = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      userId: request.user?.id,
      ip: request.ip || request.connection?.remoteAddress,
      userAgent: request.headers['user-agent'],
    };

    // Log request body for write operations (excluding sensitive data)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      const sanitizedBody = this.sanitizeBody(request.body);
      auditData.body = sanitizedBody;
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const auditLog: AuditLog = {
            ...auditData,
            statusCode: response.statusCode,
            responseTime: Date.now() - startTime,
          } as AuditLog;

          // Log as JSON for structured logging
          this.logger.log(JSON.stringify(auditLog));
        },
        error: (error) => {
          const auditLog: AuditLog = {
            ...auditData,
            statusCode: error.status || 500,
            responseTime: Date.now() - startTime,
          } as AuditLog;

          this.logger.error(JSON.stringify({
            ...auditLog,
            error: error.message,
          }));
        },
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};

    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
