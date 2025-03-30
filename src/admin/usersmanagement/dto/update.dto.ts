import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional } from 'class-validator';

export enum Status {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned',
}

export class UpdateDto {
  @IsOptional()
  @ApiPropertyOptional({ example: 'John Doe', type: String })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ example: 'test@example.com', type: String })
  email?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'user', type: String })
  role?: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'active', enum: Status })
  status?: Status;
}
