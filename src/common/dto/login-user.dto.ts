import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginUserDto {
    @ApiProperty({ description: 'User email', example: 'user@example.com'})
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'User password', example: 'password123'})
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'Recaptcha token', example: 'recaptcha-token'})
    recaptchaToken: string | null;
}