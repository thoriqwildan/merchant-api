/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/auth-signup.dto';
import { SignInDto } from './dto/auth-signin.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const checkEmail = await this.prismaService.users.count({
      where: { email: signUpDto.email },
    });
    if (checkEmail > 0) {
      throw new BadRequestException('Email already use');
    }

    signUpDto.password = await bcrypt.hash(signUpDto.password, 10);

    const data = await this.prismaService.users.create({
      data: {
        name: signUpDto.name,
        email: signUpDto.email,
        password: signUpDto.password,
        role: { connect: { name: 'user' } },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    await this.prismaService.profiles.create({
      data: { user: { connect: { email: data.email } } },
    });

    await this.prismaService.wallets.create({
      data: { user: { connect: { email: data.email } } },
    });

    const permissions = data.role.permissions.map((p) => p.permission.name);

    const token = await this.getTokens({
      sub: data.id,
      email: data.email,
      status: data.status,
      permissions,
    });

    return token;
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.prismaService.users.findUnique({
      where: { email: signInDto.email },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
    if (!user) {
      throw new BadRequestException('Email not found!');
    }
    if (user.status === 'banned') {
      throw new UnauthorizedException('Your account has been banned!');
    }
    const isPasswordMatch = await bcrypt.compare(
      signInDto.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new BadRequestException('Password not match!');
    }

    const permissions = user.role.permissions.map((p) => p.permission.name);

    const token = await this.getTokens({
      sub: user.id,
      email: user.email,
      status: user.status,
      permissions,
    });
    return token;
  }

  async refreshToken(id: number) {
    const user = await this.prismaService.users.findFirst({
      where: { id: id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const permissions = user.role.permissions.map((p) => p.permission.name);

    const token = await this.getTokens({
      sub: user.id,
      email: user.email,
      status: user.status,
      permissions,
    });

    return token;
  }

  async removeRefreshToken(id: number) {
    await this.prismaService.users.update({
      where: { id: id },
      data: { refresh_token: null },
    });
  }

  async getTokens(payload: {
    sub: number;
    email: string;
    status: string;
    permissions: string[];
  }): Promise<{ accessToken; refreshToken }> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prismaService.users.update({
      where: { id: payload.sub },
      data: { refresh_token: hashedRefreshToken },
    });
    return { accessToken, refreshToken };
  }
}
