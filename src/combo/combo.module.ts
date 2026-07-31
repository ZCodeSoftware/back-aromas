import { Module } from '@nestjs/common/decorators/modules';
import { MongooseModule } from '@nestjs/mongoose';
import { comboRepository, comboService, productRepository } from './infrastructure/nest/constants/custom-provider';
import { comboSchema, productSchema } from './infrastructure/nest/constants/custom-schema';
import { ComboController } from './infrastructure/nest/controllers/combo.controller';

@Module({
  imports: [MongooseModule.forFeature([comboSchema, productSchema])],
  controllers: [ComboController],
  providers: [comboService, comboRepository, productRepository],
  exports: []
})
export class ComboModule { }
