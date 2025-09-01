import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SecurityLogService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    async createLog(userID: number, eventType: string, ip: string, ua: string, description: string){
        await this.prisma.securityLog.create({
            data: {
                personID: userID,
                eventType,
                ipAddress: ip,
                userAgent: ua,
                description,
                isResolved: false,
            }
        });
    } 
}
