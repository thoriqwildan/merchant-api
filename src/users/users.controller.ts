/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { JwtPermissionGuard } from 'src/common/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as sharp from 'sharp';
import { Request } from 'express';
import { UserAddressDto } from './dto/user-address.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtPermissionGuard)
  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update user profile',
    type: UserUpdateDto,
  })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: './uploads/profiles',
        filename(req, file, callback) {
          const date = new Date()
            .toISOString()
            .replace(/:/g, '-')
            .replace('T', '_')
            .replace('Z', '');
          const extension: string = path.extname(file.originalname);
          const filename = `${date}${extension}`;

          callback(null, filename);
        },
      }),
      fileFilter(req, file, callback) {
        const allowedTypes = /jpg|jpeg|png/;
        const extname = allowedTypes.test(
          path.extname(file.originalname).toLowerCase(),
        );
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) return callback(null, true);
        else
          return callback(
            new HttpException('Only JPG, JPEG, PNG files are allowed', 400),
            false,
          );
      },
      limits: { fileSize: 1024 * 1024 * 4 },
    }),
  )
  async updateProfile(
    @Req() req: Request,
    @UploadedFile() image: Express.Multer.File,
    @Body(new ValidationPipe({ transform: true })) updateDto: UserUpdateDto,
  ) {
    if (image) {
      const email = req.user!['email'];
      const title = email.replace('@', '-').replace(/\..*$/, '');
      const date = new Date()
        .toISOString()
        .replace(/:/g, '-')
        .replace('T', '_')
        .replace('Z', '');
      const extension: string = path.extname(image.originalname);
      const filename = `${title}-${date}${extension}`;
      const oldPath = image.path;
      const newPath = path.join(path.dirname(oldPath), filename);

      const dirPath = './uploads/profiles';
      try {
        const files = fs.readdirSync(dirPath);
        const filteredFiles = files.filter((f) => f.includes(title));
        if (filteredFiles.length > 0) {
          filteredFiles.forEach((f) => {
            const filePath = path.join(dirPath, f);
            fs.unlinkSync(filePath);
          });
        }
      } catch (err) {
        throw new BadRequestException('Failed to Delete old Image');
      }

      await sharp(oldPath)
        .resize(1000, 1000)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(newPath);

      fs.unlinkSync(oldPath);
      updateDto.file = `/profiles/${filename}`;
    }

    return await this.usersService.updateProfile(req.user!['email'], updateDto);
  }

  @Post('addresses')
  @ApiBearerAuth()
  @UseGuards(JwtPermissionGuard)
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    type: UserAddressDto,
  })
  async createAddress(
    @Req() req: Request,
    @Body(new ValidationPipe({ transform: true }))
    userAddressDto: UserAddressDto,
  ) {
    return await this.usersService.createAddress(
      req.user!['sub'],
      userAddressDto,
    );
  }

  @Get('addresses')
  @ApiBearerAuth()
  @UseGuards(JwtPermissionGuard)
  async getAllAddresses(@Req() req: Request) {
    return await this.usersService.getAllAddresses(req.user!['sub']);
  }

  @Get('addresses/:id')
  @ApiBearerAuth()
  @UseGuards(JwtPermissionGuard)
  async getAddress(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return await this.usersService.getAddress(req.user!['sub'], id);
  }
}
