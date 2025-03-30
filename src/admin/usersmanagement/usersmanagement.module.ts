import { Module } from '@nestjs/common';
import { UsersmanagementService } from './usersmanagement.service';
import { UsersmanagementController } from './usersmanagement.controller';
import { UserRepositories } from './repositories/user.repository';

@Module({
  controllers: [UsersmanagementController],
  providers: [UsersmanagementService, UserRepositories],
})
export class UsersmanagementModule {}
