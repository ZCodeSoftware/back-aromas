import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  catRoleRepository,
  userRepository,
  userService,
} from './infrastructure/nest/constants/custom-provider';
import {
  catRoleSchema,
  userSchema,
} from './infrastructure/nest/constants/custom-schema';
import { UserController } from './infrastructure/nest/controllers/user.controller';

/**
 * Global so that every module (auth, address, cart, order, review) resolves
 * `SymbolsUser.IUserRepository` / `IUserService` to this single implementation
 * instead of declaring its own copy.
 */
@Global()
@Module({
  imports: [MongooseModule.forFeature([userSchema, catRoleSchema])],
  controllers: [
    UserController,
  ],
  providers: [userService, userRepository, catRoleRepository],
  exports: [userService, userRepository]
})
export class UserModule { }
