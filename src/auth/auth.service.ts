import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CreateUserDto } from 'src/common/dto/create-user.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService
    ){}
    async registerUser(dto: CreateUserDto, {ip, ua}: {ip: string, ua: string}){
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
}
