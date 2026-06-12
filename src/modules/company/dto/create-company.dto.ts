import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme AB' })
  @IsString()
  name: string;

  @ApiProperty({ example: '5591234567' })
  @IsString()
  org_number: string;

  @ApiPropertyOptional({ example: 'https://acme.se/logo.png' })
  @IsOptional()
  @IsString()
  logo?: string;
}
