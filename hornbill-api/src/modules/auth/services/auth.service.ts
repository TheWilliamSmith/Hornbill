import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from '../dto/signup.dto';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcryptjs';
import { AuthMapper } from '../mappers/auth.mapper';
import { SignupResponseDto } from '../dto/signup-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';
import {
  REFRESH_TOKEN_DAYS,
  ACCESS_TOKEN_MINUTES,
  REFRESH_TOKEN_SALT_ROUNDS,
  PASSWORD_SALT_ROUNDS,
} from '@common/constants/auth.constants';
import { UserRepository } from '@modules/users/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {}

  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const isUsernameTaken = await this.authRepository.findUserByUsername(dto.username);

    if (isUsernameTaken) throw new ConflictException('Username already exists');

    const isEmailTaken = await this.authRepository.findUserByEmail(dto.email);

    if (isEmailTaken) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    const newUser = await this.authRepository.create({
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
    });

    return AuthMapper.toSignUpResponse(newUser);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<LoginResponseDto> {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: `${ACCESS_TOKEN_MINUTES}m`,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${REFRESH_TOKEN_DAYS}d`,
      },
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.authRepository.createSession({
      userId: user.id,
      refreshToken: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return AuthMapper.toLoginResponse(accessToken, refreshToken, user);
  }

  async refreshTokens(
    dto: RefreshTokenDto,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RefreshTokenResponseDto> {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const sessions = await this.authRepository.findSessionsByUserId(payload.sub);

    let matchedSessionId: string | null = null;

    for (const session of sessions) {
      if (session.expiresAt < new Date()) continue;
      const isMatch = await bcrypt.compare(dto.refreshToken, session.refreshToken);
      if (isMatch) {
        matchedSessionId = session.id;
        break;
      }
    }

    if (!matchedSessionId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.authRepository.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    await this.authRepository.deleteSessionById(matchedSessionId);

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: `${ACCESS_TOKEN_MINUTES}m`,
      },
    );

    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: `${REFRESH_TOKEN_DAYS}d`,
      },
    );

    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

    await this.authRepository.createSession({
      userId: user.id,
      refreshToken: hashedRefreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    const response = new RefreshTokenResponseDto();
    response.accessToken = accessToken;
    response.refreshToken = newRefreshToken;
    return response;
  }
}
