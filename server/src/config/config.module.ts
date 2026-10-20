import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.config.js';
import { EnvService } from './env.service.js';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local', '.env.prod'],
            validate: validateEnv,
        }),
    ],
    exports: [NestConfigModule, EnvService],
    providers: [EnvService],
})
export class AppConfigModule { }
