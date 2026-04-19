import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { WeightModule } from '@modules/weight/weight.module';
import { UserModule } from '@modules/users/user.module';
import { CryptoModule } from '@modules/crypto/crypto.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    WeightModule,
    UserModule,
    CryptoModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
