import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  exports: [UserService],
  providers: [UserService, PrismaService],
  imports: [PrismaModule]
})
export class UserModule {}
