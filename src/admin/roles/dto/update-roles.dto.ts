/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Role name' })
  name?: string;

  @ApiPropertyOptional({
    example: ['is_authenticated', 'create_role', 'update_role'],
  })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  permissions?: string[];
}
