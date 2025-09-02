import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Response } from 'express';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { LoginUserDto } from 'src/common/dto/login-user.dto';
import { LoggerService } from 'src/logger/logger.service';
import { RecaptchaService } from 'src/recaptcha/recaptcha.service';
import { RedisService } from 'src/redis/redis.service';
import { SecurityLogService } from 'src/security-log/security-log.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly redisService: RedisService,
        private readonly loggerService: LoggerService,
        private readonly recaptchaService: RecaptchaService,
        private readonly securityLogService: SecurityLogService
    ){}
    async handleRegister(dto: CreateUserDto, {ip, ua}: {ip: string, ua: string}){
        try{
            const user = await this.userService.getUserByEmail(dto.email);
            if(user) throw new ConflictException(`User with email ${dto.email} already exists`);
            await this.userService.createUser(dto, {ip, ua});
        }catch(error){
            if(error instanceof ConflictException) throw error;
            if(error instanceof PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException(`${error.meta?.target} already exists`);
            throw new InternalServerErrorException('An error occurred while verifying');
        }
    }

    async handleLogin(dto: LoginUserDto, {ip, ua, res}: {ip: string, ua: string, res: Response}){  
        try{
            const sessionId = randomUUID();
            const userAttempts = await this.redisService.get(`loginAttempts:${dto.email}`);

            await this.validateUserAttempts(userAttempts, dto.email, dto.recaptchaToken);

            const user = await this.validateUser(dto, ip, ua);
        
            await this.createSession(user.id, sessionId, ip, ua, res);
            await this.redisService.del(`loginAttempts:${dto.email}`);

            this.loggerService.log(`User logged in successfully with email: ${dto.email}`);

            return {isVerified: true};
        }catch(error){
            if(error instanceof UnauthorizedException || error instanceof ForbiddenException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('An error occurred while logging in');
        }
    }

    private async createSession(userID: number, sessionId: string, ip: string | undefined, userAgent: string, res: Response) {
        try{
            
            await this.redisService.setSession(sessionId, {
                userID: userID,
                ip: ip,
                userAgent: userAgent,
            });

            res.cookie('sessionId', sessionId, {
                httpOnly: true, // boolean
                secure: true,     // boolean
                sameSite: 'none',
                maxAge: 3600 * 1000, 
            });

            this.loggerService.log(`Session created successfully for user with id: ${userID}`);
        }catch(error) {
            throw new InternalServerErrorException('An error occurred while creating session');
        }
    }


    private async validateUser(dto: LoginUserDto, ip: string, ua: string){
        try{
            const user = await this.userService.getUserByEmail(dto.email);
            if(!user){
                this.loggerService.error(`User with email ${dto.email} not found`);
                throw new UnauthorizedException(`Some of the fields are incorrect`);
            };

            const isPasswordValid = await bcrypt.compare(dto.password + process.env.USER_PEPER, user.password);
            if(!isPasswordValid){
                await this.incrementLoginAttempts(dto.email);
                this.loggerService.error(`Invalid password for user with email: ${dto.email}`);
                throw new UnauthorizedException(`Some of the fields are incorrect`);
            };

            this.loggerService.log(`User has been logged in successfully with email: ${dto.email}`);

            await this.validateUserIPAndUA(user.ip, user.ua, user.id, ip, ua);

            return user;
        }catch(error) {
            this.loggerService.error(`Error logging in user with email: ${dto.email}`, error);
            if(error instanceof UnauthorizedException || error instanceof ForbiddenException) {
                throw error; 
            };
            throw new InternalServerErrorException('An error occurred while logging in');
        };
    };

    private async validateUserIPAndUA(userIP: string, userUA: string, userID: number, currentIP: string, currentUA: string) {
        try{
            if(this.normalizeIp(userIP) !== this.normalizeIp(currentIP) ){
                await this.securityLogService.createLog(userID, 'ip_mismatch', currentIP, currentUA, 'IP does not match expected');
            }
            if(userUA !== currentUA){
                await this.securityLogService.createLog(userID, 'userAgent_mismatch', currentIP, currentUA, 'User Agent does not match expected');
            }
        }catch(error){
            throw new InternalServerErrorException('An error occurred while validating user IP and User Agent');
        }
    }

     private normalizeIp(ip: string | undefined): string{
        if(!ip) return '';
        if(ip.includes('::ffff:')) ip = ip.split('::ffff:')[1];
        const parts = ip.split('.');
        return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : ip;
    }

    private async incrementLoginAttempts(email: string){
        try{
            await this.redisService.multi()
                .incr(`loginAttempts:${email}`)
                .expire(`loginAttempts:${email}`, 900) 
                .exec();
            this.loggerService.error(`Invalid password for user with email: ${email}`);
        }catch(error){
            throw new InternalServerErrorException('An error occurred while incrementing login attempts');
        }
    }

    private async validateUserAttempts(userAttempts: unknown, email: string, recaptchaToken: string | null) {
        try{
            const maxCancelledAttempts = 5;
            const maxCaptchaAttempts = 3;
            
            if(userAttempts && +userAttempts >= maxCaptchaAttempts && +userAttempts < maxCancelledAttempts) {
                if(!recaptchaToken){
                    throw new UnauthorizedException('Recaptcha token is required');
                }

                const isValid = await this.recaptchaService.verifyToken(recaptchaToken);
                if(!isValid) {
                    this.loggerService.error(`Invalid recaptcha token for email: ${email}`);
                    throw new UnauthorizedException('Invalid recaptcha token');
                }
            }

            this.checkUserAttempts(userAttempts, maxCancelledAttempts, email);
        }catch(error){
            if(error instanceof UnauthorizedException || error instanceof ForbiddenException) {
                throw error; 
            }
            throw new InternalServerErrorException('An error occurred while validating user attempts');
        }    
    }

    private async checkUserAttempts(userAttempts: unknown, maxAttempts: number, email: string) {
        if(userAttempts){
            if(+userAttempts >= maxAttempts){
                await this.redisService.del(`loginAttempts:${email}`);
                await this.redisService.setBannedUser(email);
                this.loggerService.error(`Too many login attempts for email: ${email}`);
                return;
            }
        }else{
            await this.redisService.setLoginAttempts(email, 0);
        }
    }
}
