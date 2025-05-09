import { UserModel } from '../models/user.model';

export interface IUserService {
  findById(id: string): Promise<UserModel>;
}
