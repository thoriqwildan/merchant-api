import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { UserAddressDto } from './dto/user-address.dto';
import { AddressResponse } from './dto/address-response.dto';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async updateProfile(email: string, updateDto: UserUpdateDto) {
    const checkEmail = await this.prismaService.users.findUnique({
      where: { email: email },
    });
    if (!checkEmail) {
      throw new UnauthorizedException('Email not found');
    }

    const data = await this.prismaService.users.update({
      where: { email: email },
      data: {
        name: updateDto.name,
        profile: {
          update: {
            birth_date: updateDto.birthdate
              ? new Date(updateDto.birthdate)
              : undefined,
            gender: updateDto.gender?.toString(),
            profile_picture: updateDto.file,
          },
        },
      },
      include: {
        profile: {
          select: { birth_date: true, gender: true, profile_picture: true },
        },
        role: true,
      },
    });

    return {
      name: data.name,
      email: data.email,
      role: data.role.name,
      birthdate: data.profile?.birth_date
        ? data.profile.birth_date
            .toISOString()
            .replace(/:/g, '-')
            .replace('T', '_')
            .replace('Z', '')
        : null,
      gender: data.profile?.gender,
      profile_picture: data.profile?.profile_picture,
    };
  }

  async createAddress(
    id: number,
    userAddressDto: UserAddressDto,
  ): Promise<AddressResponse> {
    const user = await this.prismaService.users.findFirst({
      where: { id: id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const data = await this.prismaService.addresses.create({
      data: {
        user: {
          connect: { id: id },
        },
        address: userAddressDto.address,
        address_label: userAddressDto.label!,
        city: userAddressDto.city,
        country: userAddressDto.country,
        phone_number: userAddressDto.phone_number,
        postal_code: userAddressDto.postal_code,
        province: userAddressDto.province,
        is_default: userAddressDto.is_default,
      },
    });
    return data;
  }

  async getAllAddresses(id: number): Promise<AddressResponse[]> {
    const user = await this.prismaService.users.findFirst({
      where: { id: id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const data = await this.prismaService.addresses.findMany({
      where: { user_id: id },
    });
    return data.map((add) => ({
      address_label: add.address_label,
      phone_number: add.phone_number,
      address: add.address,
      city: add.city,
      province: add.province,
      postal_code: add.postal_code,
      country: add.country,
      is_default: add.is_default,
    }));
  }

  async getAddress(id: number, addressId: number): Promise<AddressResponse> {
    const user = await this.prismaService.users.findFirst({
      where: { id: id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const data = await this.prismaService.addresses.findFirst({
      where: { id: addressId },
    });

    return {
      address_label: data?.address_label,
      phone_number: data?.phone_number,
      address: data?.address,
      city: data?.city,
      province: data?.province,
      postal_code: data?.postal_code,
      country: data?.country,
      is_default: data?.is_default,
    };
  }
}
