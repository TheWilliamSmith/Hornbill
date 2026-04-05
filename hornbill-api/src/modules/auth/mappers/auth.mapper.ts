import { User } from '../entities/user.entity';
import { SignupResponseDto } from '../dto/signup-response.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { UserInfoDto } from 'src/common/dto/user-info.dto';

export class AuthMapper {
  static toSignUpResponse(user: User): SignupResponseDto {
    const dto = new SignupResponseDto();
    dto.id = user.id;
    dto.username = user.username;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.createdAt = user.createdAt;
    return dto;
  }

  static toLoginResponse(accessToken: string, refreshToken: string, user: User): LoginResponseDto {
    const userInfo = new UserInfoDto();
    userInfo.id = user.id;
    userInfo.username = user.username;
    userInfo.firstName = user.firstName;
    userInfo.lastName = user.lastName;
    userInfo.email = user.email;
    userInfo.role = user.role;

    const dto = new LoginResponseDto();
    dto.accessToken = accessToken;
    dto.refreshToken = refreshToken;
    dto.user = userInfo;
    return dto;
  }
}
