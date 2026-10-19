import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './env.config';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local', '.env.prod'],
            validate: validateEnv,
        }),
    ],
    exports: [NestConfigModule],
})
export class AppConfigModule { }