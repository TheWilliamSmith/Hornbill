import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
    required: false,
    minLength: 3,
    maxLength: 30,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string' })
  @Length(3, 30, { message: 'Username must be between 3 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @Transform(({ value }) => value?.trim())
  username?: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: false,
    minLength: 1,
    maxLength: 50,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 50, { message: 'First name must be between 1 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: false,
    minLength: 1,
    maxLength: 50,
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 50, { message: 'Last name must be between 1 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;
}
