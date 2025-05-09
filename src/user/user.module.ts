import { Module } from '@nestjs/common/decorators/modules';
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

@Module({
  imports: [MongooseModule.forFeature([userSchema, catRoleSchema])],
  controllers: [
    UserController,
  ],
  providers: [userService, userRepository, catRoleRepository],
  exports: []
})
export class UserModule { }
