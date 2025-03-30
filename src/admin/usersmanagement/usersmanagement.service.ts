import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create.dto';
import * as bcrypt from 'bcryptjs';
import { Users } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UserRepositories } from './repositories/user.repository';
import { UpdateDto } from './dto/update.dto';
import * as fs from 'fs';

@Injectable()
export class UsersmanagementService {
  constructor(
    private prismaService: PrismaService,
    private userRepository: UserRepositories,
  ) {}

  async createUser(createDto: CreateUserDto) {
    const checkEmail = await this.prismaService.users.count({
      where: { email: createDto.email },
    });
    if (checkEmail > 0) {
      throw new BadRequestException('Email already use');
    }

    const checkRole = await this.prismaService.roles.findUnique({
      where: { name: createDto.role },
    });
    if (!checkRole) {
      throw new BadRequestException('Role not found');
    }

    createDto.password = await bcrypt.hash(createDto.password, 10);

    const data = await this.prismaService.users.create({
      data: {
        name: createDto.name,
        email: createDto.email,
        password: createDto.password,
        role: { connect: { name: createDto.role } },
      },
      include: { role: true },
    });

    await this.prismaService.profiles.create({
      data: { user: { connect: { email: data.email } } },
    });

    await this.prismaService.wallets.create({
      data: { user: { connect: { email: data.email } } },
    });

    return this.userResponse(data, data.role.name);
  }

  async getAllUsers(paginationDto: PaginationDto) {
    return this.userRepository.findManyWithPagination(paginationDto);
  }

  async getUser(id: number) {
    const data = await this.prismaService.users.findFirst({
      where: { id: id },
      include: { role: true },
    });
    if (!data) {
      throw new BadRequestException('User not found');
    }
    return this.userResponse(data, data.role.name);
  }

  async updateUser(id: number, updateDto: UpdateDto) {
    const checkUser = await this.prismaService.users.findFirst({
      where: { id },
    });
    if (!checkUser) {
      throw new BadRequestException('User not found');
    }

    const checkRole = await this.prismaService.roles.findUnique({
      where: { name: updateDto.role },
    });
    if (!checkRole) {
      throw new BadRequestException('Role not found');
    }

    const data = await this.prismaService.users.update({
      where: { id: id },
      data: {
        name: updateDto.name,
        status: updateDto.status,
        role: {
          connect: { name: updateDto.role },
        },
      },
      include: { role: true },
    });

    return this.userResponse(data, data.role.name);
  }

  async deleteUser(id: number) {
    const checkUser = await this.prismaService.users.findFirst({
      where: { id },
      include: { profile: true },
    });
    if (!checkUser) {
      throw new BadRequestException('User not found');
    }

    fs.unlinkSync(`uploads/profiles/${checkUser.profile?.profile_picture}`);

    await this.prismaService.users.delete({
      where: { id },
    });

    await this.prismaService.profiles.delete({
      where: { user_id: checkUser.id },
    });

    return { message: 'User deleted' };
  }

  //   Tools
  userResponse(data: Users, role: string) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: role,
    };
  }
}
