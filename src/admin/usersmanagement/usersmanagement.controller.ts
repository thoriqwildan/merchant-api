import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersmanagementService } from './usersmanagement.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPermissionGuard } from 'src/common/guards/jwt.guard';
import { CreateUserDto } from './dto/create.dto';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateDto } from './dto/update.dto';

@Controller('admin/users')
@ApiBearerAuth()
@ApiTags('Admin')
@UseGuards(JwtPermissionGuard)
export class UsersmanagementController {
  constructor(
    private readonly usersmanagementService: UsersmanagementService,
  ) {}

  @Post()
  @Permissions('all_permissions', 'create_users')
  async createUser(@Body() createDto: CreateUserDto) {
    return this.usersmanagementService.createUser(createDto);
  }

  @Get()
  @Permissions('all_permissions', 'read_users')
  async getAllUser(@Query() paginationDto: PaginationDto) {
    return this.usersmanagementService.getAllUsers(paginationDto);
  }

  @Get(':id')
  @Permissions('all_permissions', 'read_users')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersmanagementService.getUser(id);
  }

  @Patch(':id')
  @Permissions('all_permissions', 'update_users')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDto,
  ) {
    return this.usersmanagementService.updateUser(id, updateDto);
  }

  @Delete(':id')
  @Permissions('all_permissions', 'delete_users')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersmanagementService.deleteUser(id);
  }
}
