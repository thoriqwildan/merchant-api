import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { RoleRepositories } from './repositories/roles.repository';
import { UpdateRoleDto } from './dto/update-roles.dto';

@Injectable()
export class RolesService {
  constructor(
    private prismaService: PrismaService,
    private roleRepository: RoleRepositories,
  ) {}

  async createRole(createRoleDto: CreateRoleDto) {
    const checkRole = await this.prismaService.roles.findUnique({
      where: { name: createRoleDto.name },
    });
    if (checkRole) {
      throw new BadRequestException('Role already exists');
    }

    const existingPermissions = await this.prismaService.permissions.findMany({
      where: { name: { in: createRoleDto.permissions } },
      select: { id: true },
    });

    if (existingPermissions.length !== createRoleDto.permissions.length) {
      throw new BadRequestException('Permissions not found');
    }

    const validPermissions = existingPermissions.map((p) => ({
      permission: { connect: { id: p.id } },
    }));

    const data = await this.prismaService.roles.create({
      data: {
        name: createRoleDto.name,
        permissions: { create: validPermissions },
      },
      include: { permissions: { include: { permission: true } } },
    });

    return data;
  }

  async getRole(id: number) {
    const data = await this.prismaService.roles.findUnique({
      where: { id: id },
      include: {
        permissions: {
          select: {
            permission: { select: { name: true, description: true } },
          },
        },
      },
    });
    if (!data) {
      throw new BadRequestException('Role not found');
    }
    return data;
  }

  async getAllRoles(paginationDto: PaginationDto) {
    return this.roleRepository.findManyWithPagination(paginationDto);
  }

  async updateRole(id: number, updateDto: UpdateRoleDto) {
    const checkRole = await this.prismaService.roles.findUnique({
      where: { id },
    });
    if (!checkRole) {
      throw new BadRequestException('Role not found');
    }

    let validPermissions: { permission: { connect: { id: number } } }[] = [];
    if (updateDto.permissions) {
      const existingPermissions = await this.prismaService.permissions.findMany(
        {
          where: { name: { in: updateDto.permissions } },
          select: { id: true },
        },
      );
      if (existingPermissions.length !== updateDto.permissions.length) {
        throw new BadRequestException('Permissions not found');
      }

      validPermissions = existingPermissions.map((p) => ({
        permission: { connect: { id: p.id } },
      }));
    }

    const data = await this.prismaService.roles.update({
      where: { id },
      data: {
        ...(updateDto.name && { name: updateDto.name }),
        ...(updateDto.permissions && {
          permissions: {
            deleteMany: {},
            create: validPermissions,
          },
        }),
      },
    });

    return data;
  }

  async deleteRole(id: number) {
    const data = await this.prismaService.roles.findFirst({
      where: { id },
    });
    if (!data) {
      throw new BadRequestException('Role not found');
    }
    await this.prismaService.roles.delete({
      where: { id },
    });

    return true;
  }
}
