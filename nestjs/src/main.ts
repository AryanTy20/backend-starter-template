import { NestFactory } from '@nestjs/core';
import { RootModule } from './root.module';
import * as Cors from 'cors';
import * as CookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './app.exception';

const Bootstrap = async () => {
  const PORT = process.env.APP_PORT || 5000;
  const app = await NestFactory.create(RootModule);
  app.use(CookieParser());
  app.use(Cors({ origin: '*', credentials: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.listen(PORT, () => console.log(`Server running on port : ${PORT}`));
};

Bootstrap();
