import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@src/generated/prisma/enums';

export class UserInfoDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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
    format: 'email',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user',
    example: 'USER',
    enum: ['USER', 'ADMIN'],
    type: String,
  })
  role: UserRole;
}
