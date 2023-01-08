import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';
import { JwtAccessGuard, JwtRefreshGuard } from './guards';

declare global {
  namespace Express {
    interface User {
      userId: number;
    }
  }
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.login(body);
    res.cookie('rttoken', refreshToken, {
      maxAge: 604800000,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });
    return { accessToken };
  }

  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.register(body);
    res.cookie('rttoken', refreshToken, {
      maxAge: 604800000,
      secure: true,
      httpOnly: true,
      sameSite: 'none',
    });
    return { accessToken };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const { userId } = req.user;
    const token = req.cookies['rttoken'];
    const accessToken = await this.authService.refresh(userId, token);
    return { accessToken };
  }

  @UseGuards(JwtAccessGuard)
  @Get('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('rttoken');
    return this.authService.logout(req.user.userId);
  }
}
