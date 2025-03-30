import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  @ApiProperty({ example: 'test@example.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: '12345678' })
  password: string;
}
