import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Invalid token format');
    }

    // For development, we'll accept any token and set a demo user
    // In production, this should verify the JWT token
    if (process.env.NODE_ENV === 'development') {
      request.user = {
        id: 'demo-user-id',
        email: 'demo@wisdomos.com',
        role: 'user'
      };
      return true;
    }

    // In production, verify the JWT token here
    try {
      // TODO: Implement proper JWT verification
      // const payload = jwt.verify(token, process.env.JWT_SECRET);
      // request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}