import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { LoggerService } from './logger/logger.service';
import { LoggerModule } from './logger/logger.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { RecaptchaService } from './recaptcha/recaptcha.service';
import { RecaptchaModule } from './recaptcha/recaptcha.module';
import { SecurityLogService } from './security-log/security-log.service';
import { SecurityLogModule } from './security-log/security-log.module';

@Module({
  imports: [AuthModule, LoggerModule, PrismaModule, UserModule, RedisModule, RecaptchaModule, SecurityLogModule],
  controllers: [],
  providers: [AuthService, LoggerService, PrismaService, RedisService, RecaptchaService, SecurityLogService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer){
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes('*');
  }
}
