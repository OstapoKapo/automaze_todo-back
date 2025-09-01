import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { LoggerService } from 'src/logger/logger.service';
import { AuthService } from './auth.service';
import { Request } from 'express';
import {Response} from 'express'
import { LoginUserDto } from 'src/common/dto/login-user.dto';
import { BannedAccGuard } from 'src/common/guard/bannedAcc.guard';
import { UserService } from 'src/user/user.service';
import { userId } from './userId.decorator';
import { SessionGuard } from 'src/common/guard/session.guard';


@Controller('auth')
export class AuthController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly authService: AuthService,
    private readonly userService: UserService
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
      await this.authService.handleRegister(dto, {ip, ua});  
      this.loggerService.log(`User created successfully with email: ${dto.email}, IP: ${ip}, User-Agent: ${ua}`);   
      return {message: 'User created successfully'}  
    }

    @UseGuards(BannedAccGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() dto: LoginUserDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ){
        const ip = req.ip ?? 'unknown';
        const ua = req.headers['user-agent'] ?? 'unknown';
        await this.authService.handleLogin(dto, {ip, ua, res});
        return {message: 'User logged in successfully'};
    }

    @UseGuards(SessionGuard)
    @Get('me')
    @HttpCode(HttpStatus.OK)
    async me(
        @userId() userID: number
    ){
        const user = await this.userService.findUserById(userID);
        if(!user) throw new NotFoundException('User not found');
        return { user };
    }
}
