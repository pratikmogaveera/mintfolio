import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger('AuthGuard');
  constructor(private jwtService: JwtService) {}

  canActivate = async (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request?.headers?.authorization;
    const token = authorization?.split(' ')?.[1];

    if (!token) {
      this.logger.warn(`Request with no token: ${request.method} ${request.url}`);
      throw new UnauthorizedException('Authentication token is required.');
    }

    try {
      const tokenPayload = await this.jwtService.verifyAsync<JwtSign>(token);
      request.user = {
        sub: tokenPayload.sub,
      };
      return true;
    } catch (err) {
      if (err instanceof JsonWebTokenError) this.logger.warn(`Error validating JWT: ${err.message}`);
      else this.logger.warn('Error validating JWT:', err);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  };
}
