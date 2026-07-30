export interface IUserRequest extends Request {
  user: { _id: string; email: string };
}
