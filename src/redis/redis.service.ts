import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisTTL } from 'config/redis.config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private client: Redis;

    onModuleInit() {
    if (process.env.UPSTASH_REDIS_TCP_URL) {
      this.client = new Redis(process.env.UPSTASH_REDIS_TCP_URL); // rediss:// URL
    } else {
      this.client = new Redis({
        host: 'localhost',
        port: 6379,
        password: 'admin',
      });
    }
  }


    multi() {
        return this.client.multi();
    }

    async set(key:string, value: unknown, ttlSeconds?: number){
        const val = JSON.stringify(value);
        if(ttlSeconds){
            await this.client.set(key, val, 'EX', ttlSeconds);
        }else{
            await this.client.set(key, val);
        }

    }

    async incr(key: string): Promise<number> {
        return await this.client.incr(key);
    }

    async expire(key: string, ttlSeconds: number): Promise<void>{
        await this.client.expire(key, ttlSeconds);
    }

    async get<T>(key: string): Promise<T | null>{
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }

    async del(key: string){
        await this.client.del(key);
    }

    async setLoginAttempts(email: string, value: number){
        await this.set(`loginAttempts:${email}`, value, RedisTTL.LOGIN_ATTEMPTS);
    }

    async setBannedUser(email: string){
        await this.set(`bannedUser:${email}`, true, RedisTTL.BANNED_USER);
    }

    async setSession(sessionId: string, value: { userID: number; ip: string | undefined ; userAgent: string, csrfToken: string }) {
        await this.set(`session:${sessionId}`, value, RedisTTL.SESSION);
    }
}
