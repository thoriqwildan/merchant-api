import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { RolesModule } from './roles/roles.module';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [RolesModule],
})
export class AdminModule {}
