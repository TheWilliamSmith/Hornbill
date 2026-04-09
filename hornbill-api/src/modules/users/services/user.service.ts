import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { GetUserResponse } from '../dto/get-user-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string): Promise<GetUserResponse> {
    const user = await this.userRepository.getUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toGetUserInfoDto(user);
  }

  async updateMe(id: string, dto: UpdateUserDto): Promise<GetUserResponse> {
    if (dto.username) {
      const existing = await this.userRepository.findByUsername(dto.username);
      if (existing && existing.id !== id) {
        throw new ConflictException('Username already taken');
      }
    }

    const updated = await this.userRepository.updateUser(id, {
      username: dto.username,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    return UserMapper.toGetUserInfoDto(updated);
  }
}
