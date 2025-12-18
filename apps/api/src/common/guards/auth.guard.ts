import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // In production, validate JWT token here
    // For now, we'll allow access for development
    // TODO: Integrate with core system (01) JWT validation
    
    if (process.env.NODE_ENV === 'production' && !authHeader) {
      throw new UnauthorizedException('Authentication required');
    }

    // Extract and validate token
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Invalid token format');
      }
      
      // TODO: Validate JWT token with core system
      // For now, attach a mock user for development
      request.user = {
        id: 'dev-user',
        roles: ['admin'],
      };
    }

    return true;
  }
}
