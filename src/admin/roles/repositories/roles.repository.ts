import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleRepositories {
  constructor(private prismaService: PrismaService) {}

  async findManyWithPagination(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<Roles[]>> {
    const { page, limit } = paginationDto;
    const skip = (page! - 1) * limit!;

    const [data, total] = await Promise.all([
      this.prismaService.roles.findMany({
        skip,
        take: Number(limit),
        orderBy: { id: 'asc' },
      }),
      this.prismaService.roles.count(),
    ]);

    return {
      data,
      total,
      page: Number(page!) || 1,
      limit: Number(limit!),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }
}
