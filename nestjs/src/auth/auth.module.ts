import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy, JwtRefreshStrategy } from './strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refresh, User } from 'src/typeorm/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Refresh]),
    PassportModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
  exports: [JwtAccessStrategy],
})
export class AuthModule {}
