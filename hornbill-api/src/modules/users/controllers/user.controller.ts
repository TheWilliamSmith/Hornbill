import { Controller, Get, Patch, Delete, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@CurrentUser('sub') userId: string) {
    return this.userService.getUserById(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateMe(userId, dto);
  }

  @Get('me/sessions')
  getSessions(@CurrentUser('sub') userId: string) {
    return this.userService.getSessions(userId);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMe(@CurrentUser('sub') userId: string, @Body() dto: DeleteAccountDto) {
    return this.userService.deleteMe(userId, dto);
  }
}
