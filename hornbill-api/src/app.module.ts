import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@modules/auth/auth.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { WeightModule } from '@modules/weight/weight.module';
import { UserModule } from '@modules/users/user.module';
import { CryptoModule } from '@modules/crypto/crypto.module';
import { NotificationModule } from '@modules/notification/notification.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { HabitsModule } from '@modules/habits/habits.module';
import { AdminModule } from '@modules/admin/admin.module';
import { PlantsModule } from '@modules/plants/plants.module';
import { MangaModule } from '@modules/manga/manga.module';

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
    TasksModule,
    HabitsModule,
    AdminModule,
    PlantsModule,
    MangaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
