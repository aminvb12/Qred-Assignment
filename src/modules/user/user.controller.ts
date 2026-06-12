import { ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateCompanyDto } from '../company/dto/create-company.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get(':id/companies')
  findCompanies(@Param('id') id: string) {
    return this.userService.findCompanies(id);
  }

  @Post(':id/companies')
  createCompany(@Param('id') id: string, @Body() dto: CreateCompanyDto) {
    return this.userService.createCompany(id, dto);
  }

  @Delete(':id/companies/:companyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCompany(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.userService.removeCompany(id, companyId);
  }
}
