import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { WeightModule } from '@modules/weight/weight.module';
import { UserModule } from '@modules/users/user.module';
import { CryptoModule } from '@modules/crypto/crypto.module';
import { NotificationModule } from '@modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    PrismaModule,
    WeightModule,
    UserModule,
    CryptoModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
