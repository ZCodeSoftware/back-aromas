export interface IApiKeyService {
    validateApiKey(apiKey: string): boolean
}