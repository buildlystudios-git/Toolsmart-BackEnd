import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/guards/roles.guard/roles.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard/jwt-auth.guard';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './carts/carts.module';
import { OrdersModule } from './orders/orders.module';
import { CouponsModule } from './coupons/coupons.module';
import { WishlistModule } from './wishlist/wishlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRoot(process.env.MONGO_URI as string),

    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 5
      }
    ]),
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    CouponsModule,
    WishlistModule
    ],
  controllers: [AppController],
  providers: [
    AppService, 
    // Global Guards (Order matters!)
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,     // 🔐 Auth first
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,       // 🧑‍💼 Role check
    // }
  ],
})
export class AppModule {}
