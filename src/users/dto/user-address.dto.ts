import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export enum AddressLabel {
  home = 'home',
  office = 'office',
  other = 'other',
}

export class UserAddressDto {
  @IsOptional()
  @ApiProperty({ enum: AddressLabel, example: AddressLabel.home })
  label?: string;

  @ApiProperty({ example: '1234567890', type: String })
  phone_number: string;

  @ApiProperty({ example: 'Jalan AM. Sangaji 47', type: String })
  address: string;

  @ApiProperty({ example: 'Kota Yogyakarta', type: String })
  city: string;

  @ApiProperty({ example: 'Daerah Istimewa Yogyakarta', type: String })
  province: string;

  @ApiProperty({ example: '55183', type: String })
  postal_code: string;

  @ApiProperty({ example: 'Indonesia', type: String })
  country: string;

  @ApiProperty({ example: false, type: Boolean })
  is_default: boolean;
}
