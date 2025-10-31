import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string; name?: string }) {
    return this.authService.register(
      registerDto.email,
      registerDto.password,
      registerDto.name
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    // Client should handle token removal
    return { message: 'Logged out successfully' };
  }

  @Get('health')
  async health() {
    return { status: 'ok', service: 'auth' };
  }
}