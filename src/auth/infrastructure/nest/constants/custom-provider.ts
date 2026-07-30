import { ApiKeyService } from "../../../application/services/api-key.service";
import { AuthService } from "../../../application/services/auth.service";
import { TokenService } from "../../../application/services/token.service";
import SymbolsAuth from "../../../symbols-auth";


export const authService = {
    provide: SymbolsAuth.IAuthService,
    useClass: AuthService,
};

export const tokenService = {
    provide: SymbolsAuth.ITokenService,
    useClass: TokenService,
};

export const apiKeyService = {
    provide: SymbolsAuth.IApiKeyService,
    useClass: ApiKeyService,
};
