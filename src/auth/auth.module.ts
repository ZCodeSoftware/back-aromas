import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import config from "../config";
import { apiKeyService, authService, tokenService } from "./infrastructure/nest/constants/custom-provider";
import { AuthController } from "./infrastructure/nest/controllers/auth.controller";
import { HeaderApiKeyStrategy } from "./infrastructure/nest/strategies/header-apikey.strategy";
import { JwtStrategy } from "./infrastructure/nest/strategies/jwt.strategy";

@Global()
@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'api-key',
        }),
        JwtModule.register({
            global: true,
            secret: config().app.jwt.secret,
            signOptions: { expiresIn: config().app.jwt.expiresIn },
        })
    ],
    controllers: [AuthController],
    providers: [
        authService,
        tokenService,
        apiKeyService,
        ConfigService,
        HeaderApiKeyStrategy,
        JwtStrategy,
    ],
    exports: [JwtModule, authService, tokenService, apiKeyService],
})

export class AuthModule { }
