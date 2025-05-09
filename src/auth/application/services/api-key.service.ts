import { Injectable } from "@nestjs/common";
import config from "../../../config";
import { IApiKeyService } from "../../domain/services/api-key.interface.service";

@Injectable()
export class ApiKeyService implements IApiKeyService {
    private readonly validApiKeys: string[] = JSON.parse(config().app.api_key || '[]');

    validateApiKey(apiKey: string): boolean {
        return this.validApiKeys.includes(apiKey);
    }
}