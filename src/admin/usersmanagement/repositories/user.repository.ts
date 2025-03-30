import { Injectable } from '@nestjs/common';
import { PaginationResponseDto } from 'src/common/dto/pagination-response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserRepositories {
  constructor(private prismaService: PrismaService) {}

  async findManyWithPagination(
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<any[]>> {
    const { page, limit } = paginationDto;
    const skip = (page! - 1) * limit!;

    const [data, total] = await Promise.all([
      this.prismaService.users.findMany({
        skip,
        take: Number(limit),
        orderBy: { id: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
          updated_at: true,
          status: true,
          role: {
            select: { id: true, name: true },
          },
        },
      }),
      this.prismaService.users.count(),
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
