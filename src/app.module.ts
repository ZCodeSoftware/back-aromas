import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AddressModule } from './address/address.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApiKeyGuard } from './auth/infrastructure/nest/guards/api-key.guard';
import { CartModule } from './cart/cart.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { CoreModule } from './core/core.module';
import { BaseErrorFilter } from './core/infrastructure/nest/filters/base-error.filter';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { ReviewModule } from './review/review.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CoreModule,
    UserModule,
    AuthModule,
    CatalogsModule,
    ProductModule,
    AddressModule,
    CartModule,
    OrderModule,
    ReviewModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [AppService,
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: BaseErrorFilter,
    },
  ],
})
export class AppModule { }
