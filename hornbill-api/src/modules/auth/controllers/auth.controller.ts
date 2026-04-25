import { Controller, Body, Post, HttpCode, HttpStatus, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignupResponseDto } from '../dto/signup-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';
import { AuthSwaggerDecorators } from './auth.swagger';

@Controller('auth')
@AuthSwaggerDecorators.Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @AuthSwaggerDecorators.Signup()
  async signup(@Body() dto: SignupDto): Promise<SignupResponseDto> {
    return await this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @AuthSwaggerDecorators.Login()
  async login(@Body() dto: LoginDto, @Req() req: Request): Promise<LoginResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    return await this.authService.login(dto, userAgent, ipAddress);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AuthSwaggerDecorators.Refresh()
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshTokenResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;
    return await this.authService.refreshTokens(dto, userAgent, ipAddress);
  }
}
