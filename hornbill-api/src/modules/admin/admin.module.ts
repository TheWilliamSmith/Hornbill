import { Module } from '@nestjs/common';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminUsersRepository } from './repositories/admin-users.repository';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUsersRepository],
})
export class AdminModule {}
