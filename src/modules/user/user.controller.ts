import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post,
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
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Returns array of users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Returns user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 409, description: 'Email or personal number already exists' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @Get(':id/companies')
  @ApiOperation({ summary: 'Get companies for user' })
  @ApiResponse({ status: 200, description: 'Returns user companies' })
  findCompanies(@Param('id') id: string) {
    return this.userService.findCompanies(id);
  }

  @Post(':id/companies')
  @ApiOperation({ summary: 'Create company and assign to user' })
  @ApiResponse({ status: 201, description: 'Company created' })
  createCompany(@Param('id') id: string, @Body() dto: CreateCompanyDto) {
    return this.userService.createCompany(id, dto);
  }

  @Delete(':id/companies/:companyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiResponse({ status: 204, description: 'Removed' })
  removeCompany(@Param('id') id: string, @Param('companyId') companyId: string) {
    return this.userService.removeCompany(id, companyId);
  }
}
