import { ApiProperty } from '@nestjs/swagger';

export class SignupResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'clp1234567890abcdef',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Username chosen by the user',
    example: 'john_doe',
    type: String,
  })
  username: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
  })
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  createdAt: Date;
}
