import { Module } from '@nestjs/common';
import { SecurityLogService } from './security-log.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    providers: [SecurityLogService, PrismaService],
    exports: [SecurityLogService]
})
export class SecurityLogModule {}
