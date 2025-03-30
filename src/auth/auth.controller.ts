/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/auth-signup.dto';
import { SignInDto } from './dto/auth-signin.dto';
import { JwtPermissionGuard } from 'src/common/guards/jwt.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(JwtPermissionGuard)
  @ApiBearerAuth()
  @Get('test')
  test() {
    return 'Coba Token';
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiBearerAuth()
  @Get('refresh')
  async refresh(@Req() req: Request) {
    return this.authService.refreshToken(req.user!['sub']);
  }

  @UseGuards(JwtPermissionGuard)
  @ApiBearerAuth()
  @Permissions('all_role')
  @Delete('logout')
  async logout(@Req() req: Request) {
    return this.authService.removeRefreshToken(req.user!['sub']);
  }
}
