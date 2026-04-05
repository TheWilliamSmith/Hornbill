import { ApiProperty } from '@nestjs/swagger';
import { UserInfoDto } from 'src/common/dto/user-info.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token (expires in 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (expires in 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Authenticated user information',
    type: () => UserInfoDto,
  })
  user: UserInfoDto;
}
