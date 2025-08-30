import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { LoggerService } from './logger/logger.service';
import { LoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';

@Module({
  imports: [AuthModule, LoggerModule, PrismaModule, UserModule],
  controllers: [],
  providers: [AuthService, LoggerService, PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes('*');
  }
}
