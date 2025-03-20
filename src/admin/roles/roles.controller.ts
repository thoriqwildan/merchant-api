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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPermissionGuard } from 'src/common/guards/jwt.guard';
import { Permissions } from 'src/common/decorators/permissions.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateRoleDto } from './dto/update-roles.dto';

@Controller('admin/roles')
@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtPermissionGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions('all_permissions', 'create_roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @Get(':id')
  @Permissions('all_permissions', 'read_roles')
  async getData(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.getRole(id);
  }

  @Get()
  @Permissions('all_permissions', 'read_roles')
  async getAllData(@Query() paginationDto: PaginationDto) {
    return await this.rolesService.getAllRoles(paginationDto);
  }

  @Patch(':id')
  @Permissions('all_permissions', 'update_roles')
  async updateData(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateRoleDto,
  ) {
    return await this.rolesService.updateRole(id, updateDto);
  }

  @Delete(':id')
  @Permissions('all_permissions', 'delete_roles')
  async deleteData(@Param('id', ParseIntPipe) id: number) {
    return await this.rolesService.deleteRole(id);
  }
}
