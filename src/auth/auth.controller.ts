import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { LoggerService } from 'src/logger/logger.service';
import { AuthService } from './auth.service';
import { Request } from 'express';


@Controller('auth')
export class AuthController {
  constructor(
    private loggerService: LoggerService,
    private authService: AuthService
  ) {}

    @Post('register')
    @Throttle({ default: { limit: 5, ttl: 60 } }) // create custom throttler guard
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body() dto: CreateUserDto,
        @Req() req: Request
    ){
      const ip = req.ip ?? 'unknown';
      const ua = req.headers['user-agent'] ?? 'unknown';
      await this.authService.registerUser(dto, {ip, ua});  
      this.loggerService.log(`User created successfully with email: ${dto.email}, IP: ${ip}, User-Agent: ${ua}`);   
      return {message: 'User created successfully'}  
    }
}
