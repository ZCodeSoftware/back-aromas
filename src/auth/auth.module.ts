import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import config from "../config";
import { apiKeyService, authService, tokenService, userRepository, userService } from "./infrastructure/nest/constants/custom-provider";
import { userSchema } from "./infrastructure/nest/constants/custom-schema";
import { AuthController } from "./infrastructure/nest/controllers/auth.controller";
import { HeaderApiKeyStrategy } from "./infrastructure/nest/strategies/header-apikey.strategy";
import { JwtStrategy } from "./infrastructure/nest/strategies/jwt.strategy";

@Global()
@Module({
    imports: [
        PassportModule.register({
            defaultStrategy: 'api-key',
        }),
        MongooseModule.forFeature([userSchema]),
        JwtModule.register({
            global: true,
            secret: config().app.jwt.secret,
            signOptions: { expiresIn: config().app.jwt.expiresIn },
        })
    ],
    controllers: [AuthController],
    providers: [
        userRepository,
        userService,
        authService,
        tokenService,
        apiKeyService,
        ConfigService,
        HeaderApiKeyStrategy,
        JwtStrategy,
    ],
    exports: [JwtModule, authService, tokenService, apiKeyService, userRepository, userService],
})

export class AuthModule { }