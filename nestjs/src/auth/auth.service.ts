import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Refresh, User } from 'src/typeorm/entities';
import { Repository } from 'typeorm';
import { loginType, tokenType, registerType, bothTokenType } from './types';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Refresh)
    private readonly refreshTokenRepo: Repository<Refresh>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async login(data: loginType) {
    try {
      const { email, password } = data;
      const user = await this.userRepo.findOneBy({ email });
      if (!user)
        throw new HttpException('wrong credentials', HttpStatus.BAD_REQUEST);
      const pwMatch = await argon.verify(user.hash, password);
      if (!pwMatch)
        throw new HttpException('wrong credentials', HttpStatus.BAD_REQUEST);
      return (await this.genToken(user.id, 'both')) as bothTokenType;
    } catch (err) {
      throw err;
    }
  }
  async register(data: registerType) {
    try {
      const { email, password, repeat_password } = data;
      if (password !== repeat_password)
        throw new HttpException('password not matched', HttpStatus.BAD_REQUEST);
      const hash = await argon.hash(password);
      const user = this.userRepo.create({ email, hash });
      await this.userRepo.save(user);
      return (await this.genToken(user.id, 'both')) as bothTokenType;
    } catch (err) {
      throw err;
    }
  }

  async logout(userid: number) {
    try {
      await this.refreshTokenRepo.update(
        { user: { id: userid } },
        { hash: null },
      );
    } catch (err) {
      throw err;
    }
  }

  async refresh(userId: number, token: string) {
    try {
      const dbToken = await this.refreshTokenRepo.findOneBy({
        user: { id: userId },
      });
      const isValidToken = await argon.verify(dbToken.hash, token);
      if (!isValidToken) throw new UnauthorizedException();
      return (await this.genToken(userId, 'access')) as string;
    } catch (err) {
      throw err;
    }
  }

  private async genToken(userId: number, type: tokenType) {
    const accessToken = this.jwtService.sign(
      { userId },
      {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_SIGN'),
      },
    );

    if (type === 'access') {
      return accessToken;
    } else {
      const refreshToken = this.jwtService.sign(
        { userId },
        {
          expiresIn: '7d',
          secret: this.configService.get<string>('JWT_REFRESH'),
        },
      );
      const tokenExist = await this.refreshTokenRepo.findOneBy({
        user: { id: userId },
      });
      const hash = await argon.hash(refreshToken);
      if (!tokenExist) {
        const refresh = this.refreshTokenRepo.create({
          hash,
          user: { id: userId },
        });
        await this.refreshTokenRepo.save(refresh);
        return { accessToken, refreshToken };
      } else {
        await this.refreshTokenRepo.update({ user: { id: userId } }, { hash });
        return { accessToken, refreshToken };
      }
    }
  }

  private async genAccessToken(userId: number) {
    return this.jwtService.sign(
      { userId },
      {
        expiresIn: '15m',
        secret: this.configService.get<string>('JWT_SIGN'),
      },
    );
  }

  private async genRefreshToken(userId: number) {
    const token = this.jwtService.sign(
      { userId },
      {
        expiresIn: '7d',
        secret: this.configService.get<string>('JWT_REFRESH'),
      },
    );
    const tokenExist = await this.refreshTokenRepo.findOneBy({
      user: { id: userId },
    });
    const hash = await argon.hash(token);
    if (!tokenExist) {
      const refresh = this.refreshTokenRepo.create({
        hash,
        user: { id: userId },
      });
      await this.refreshTokenRepo.save(refresh);
      return token;
    } else {
      await this.refreshTokenRepo.update({ user: { id: userId } }, { hash });
      return token;
    }
  }
}
