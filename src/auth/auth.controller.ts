import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Get('status')
    async getStatus() {
        return { status: 'ok' };
    }
}
