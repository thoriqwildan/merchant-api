import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({ example: 'John Doe', type: String })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'test@example.com', type: String })
  email: string;

  @ApiProperty({ example: '12345678', type: String })
  password: string;

  @ApiProperty({ example: 'user', type: String })
  role: string;
}
