import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs'


@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService
    ){}
    async getUserByEmail(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
        });
    }

    async createUser(dto: CreateUserDto, {ip, ua}: {ip: string, ua: string}){
        const password = await bcrypt.hash(dto.password + process.env.USER_PEPER, 10);
        return this.prisma.users.create({
            data:{
                email: dto.email,
                fullName: dto.fullName,
                password,
                ip,
                ua
            }
        })
    }
}

