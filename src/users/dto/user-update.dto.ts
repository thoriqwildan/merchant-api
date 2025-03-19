import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export enum Gender {
  male = 'male',
  female = 'female',
}

export class UserUpdateDto {
  @ApiProperty({ example: 'John Doe', type: String })
  name?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ example: '2021-01-01', type: String })
  birthdate?: string;

  @IsOptional()
  @ApiProperty({ example: 'male', enum: Gender })
  gender?: Gender;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  picture?: any;

  file?: string;
}
