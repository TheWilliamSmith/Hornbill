import { ApiProperty } from '@nestjs/swagger';

export class UserSessionResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the session',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User agent of the client',
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    required: false,
    type: String,
  })
  userAgent: string | null;

  @ApiProperty({
    description: 'IP address of the client',
    example: '192.168.1.1',
    required: false,
    type: String,
  })
  ipAddress: string | null;

  @ApiProperty({
    description: 'Date and time when the session was created',
    example: '2024-01-15T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the session expires',
    example: '2024-01-22T08:30:00.000Z',
    format: 'date-time',
    type: String,
  })
  expiresAt: Date;
}
