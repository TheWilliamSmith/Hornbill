import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    description: 'Email address of the account',
    example: 'john.doe@example.com',
    format: 'email',
    type: String,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  @Transform(({ value }) => value.trim().toLowerCase())
  readonly email: string;

  @ApiProperty({
    description: 'Account password',
    example: 'MySecureP@ssw0rd',
    type: String,
    format: 'password',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  readonly password: string;
}
