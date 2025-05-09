export interface ITokenService {
  generateToken(userEmail: string): Promise<string>;
  recoveryToken(userEmail: string): Promise<string>;
}
