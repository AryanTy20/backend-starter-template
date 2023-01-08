import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeormModule } from './typeorm/type.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TypeormModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class RootModule {}
