import { ConflictException, Injectable } from '@nestjs/common';
import { SignupDto } from '../dto/signup.dto';
import { AuthRepository } from '../repositories/auth.repository';
import * as bcrypt from 'bcryptjs';
import { AuthMapper } from '../mappers/auth.mapper';
import { SignupResponseDto } from '../dto/signup-response.dto';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async signup(dto: SignupDto): Promise<SignupResponseDto> {
    const isUsernameTaken = await this.authRepository.findUserByUsername(dto.username);

    if (isUsernameTaken) throw new ConflictException('Username already exists');

    const isEmailTaken = await this.authRepository.findUserByEmail(dto.email);

    if (isEmailTaken) throw new ConflictException('Email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const newUser = await this.authRepository.create({
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: hashedPassword,
    });

    return AuthMapper.toSignUpResponse(newUser);
  }
}
