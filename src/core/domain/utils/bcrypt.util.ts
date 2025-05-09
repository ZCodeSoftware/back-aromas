import * as bcrypt from 'bcrypt';
import { UserModel } from '../../../auth/domain/models/user.model';


export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, user: UserModel): Promise<boolean> => {
  return await bcrypt.compare(password, user.toJSON().password);
}
