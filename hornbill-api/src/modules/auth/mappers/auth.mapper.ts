import { User } from '../entities/user.entity';
import { SignupResponseDto } from '../dto/signup-response.dto';

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
}
