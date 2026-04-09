import { GetUserResponse } from '../dto/get-user-response.dto';
import { User } from '../entities/user.entity';

export class UserMapper {
  static toGetUserInfoDto(user: User): GetUserResponse {
    const dto = new GetUserResponse();
    dto.id = user.id;
    dto.username = user.username;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.email = user.email;
    dto.role = user.role;
    dto.isVerified = user.isVerified;
    dto.lastLogin = user.lastLogin;
    dto.createdAt = user.createdAt;
    return dto;
  }
}
