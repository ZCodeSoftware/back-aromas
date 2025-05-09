import SymbolsUser from "../../../../user/symbols-user";
import { ApiKeyService } from "../../../application/services/api-key.service";
import { AuthService } from "../../../application/services/auth.service";
import { TokenService } from "../../../application/services/token.service";
import { UserService } from "../../../application/services/user.service";
import SymbolsAuth from "../../../symbols-auth";
import { UserRepository } from "../../mongo/repositories/user.repository";


export const authService = {
    provide: SymbolsAuth.IAuthService,
    useClass: AuthService,
};

export const tokenService = {
    provide: SymbolsAuth.ITokenService,
    useClass: TokenService,
};

export const userService = {
    provide: SymbolsUser.IUserService,
    useClass: UserService,
};

export const userRepository = {
    provide: SymbolsUser.IUserRepository,
    useClass: UserRepository,
};

export const apiKeyService = {
    provide: SymbolsAuth.IApiKeyService,
    useClass: ApiKeyService,
};
