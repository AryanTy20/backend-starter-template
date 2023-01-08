import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Refresh, User } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        database: config.get<string>('DATABASE'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('PASSWORD'),
        port: config.get<number>('DB_PORT'),
        synchronize: config.get<boolean>('SYNCHRONUS'),
        logging: config.get<boolean>('LOGGING'),
        entities: [User, Refresh],
      }),
    }),
  ],
})
export class TypeormModule {}
