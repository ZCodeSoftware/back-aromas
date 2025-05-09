import { ILogIn } from '../types/auth.type';
import { IAuthResponse } from '../types/response-auth.type';

export interface IAuthService {
  logIn(body: ILogIn): Promise<IAuthResponse>;
}
