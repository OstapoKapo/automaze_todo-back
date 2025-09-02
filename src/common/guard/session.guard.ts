import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { RedisService } from "src/redis/redis.service";
import { Request } from "express";


interface AuthenticatedReq extends Request {
    userID: number;
}

@Injectable()
export class SessionGuard implements CanActivate{
    constructor(private readonly redisService: RedisService) {}
    
    async canActivate(context: ExecutionContext): Promise<boolean>{
       const req: Request = context.switchToHttp().getRequest();
       const sessionId = req.cookies.sessionId;
       console.log(req.cookies.sessionId)
       if(!sessionId) throw new UnauthorizedException('Session ID is missing');


       const sessionKey = `session:${sessionId}`;
       const session = await this.redisService.get<{ userID: number; userRole: string; ip:string; userAgent: string }>(sessionKey);
       if(!session) throw new UnauthorizedException('Session not found');

       await this.redisService.expire(sessionKey, 3600);
       (req as AuthenticatedReq).userID = session.userID;
       return true
    }

}