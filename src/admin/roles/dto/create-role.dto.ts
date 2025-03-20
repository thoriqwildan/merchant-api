/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Role name' })
  name: string;

  @ApiProperty({ example: ['is_authenticated', 'create_role', 'update_role'] })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  permissions: string[];
}
