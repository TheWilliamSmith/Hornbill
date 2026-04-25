import { UserRole } from '@src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserResponse {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
    type: String,
  })
  username: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    type: String,
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    type: String,
  })
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'ADMIN',
    type: String,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Indicates if the user is verified',
    example: true,
    type: Boolean,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Last login date of the user',
    example: '2023-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  lastLogin: Date | null;

  @ApiProperty({
    description: 'Creation date of the user',
    example: '2023-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;
}
