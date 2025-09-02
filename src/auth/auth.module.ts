import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoggerService } from 'src/logger/logger.service';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { SecurityLogService } from 'src/security-log/security-log.service';
import { RecaptchaService } from 'src/recaptcha/recaptcha.service';
import { RedisService } from 'src/redis/redis.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, LoggerService, UserService, RedisService, RecaptchaService, SecurityLogService ],
  imports: [UserModule, PrismaModule]
})
export class AuthModule {}
