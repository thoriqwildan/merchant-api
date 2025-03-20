import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleRepositories } from './repositories/roles.repository';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepositories],
})
export class RolesModule {}
