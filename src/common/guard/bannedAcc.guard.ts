import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";


@Injectable()
export class BannedAccGuard implements CanActivate{
    constructor(
        private readonly redisService: RedisService
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const dto = request.body;
        
        const bannedUser = await this.redisService.get(`bannedUser:${dto.email}`);
        if(bannedUser) throw new ForbiddenException('This account has been banned for 15 minutes');
        return true;
    }
}
