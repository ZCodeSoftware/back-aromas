import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from 'express';
import Strategy from "passport-headerapikey";
import { IApiKeyService } from "../../../domain/services/api-key.interface.service";
import SymbolsAuth from "../../../symbols-auth";

@Injectable()
export class HeaderApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
    constructor(
        @Inject(SymbolsAuth.IApiKeyService)
        private readonly apiKeyService: IApiKeyService
    ) {
        super(
            { header: 'x-api-key', prefix: '' },
            true
        );
    }

    async validate(apiKey: string, req?: Request): Promise<boolean> {
        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const isValid = this.apiKeyService.validateApiKey(apiKey);

        if (!isValid) {
            throw new UnauthorizedException('Invalid API key');
        }

        return true;
    }

    verify = (apiKey: string, verified: (err: Error | null, user?: boolean) => void, req?: Request): void => {
        if (!apiKey) {
            return verified(new UnauthorizedException('API key is missing'));
        }

        const isValid = this.apiKeyService.validateApiKey(apiKey);

        if (!isValid) {
            return verified(new UnauthorizedException('Invalid API key'));
        }

        return verified(null, true);
    };
}