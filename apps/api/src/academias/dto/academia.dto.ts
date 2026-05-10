import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademiaDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  corPrimaria?: string;
}

export class UpdateAcademiaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  corPrimaria?: string;
}

export class UpdateConfiguracaoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioPicoInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horarioPicoFim?: string;

  @ApiPropertyOptional()
  @IsOptional()
  minimoCheckinsSemana?: number;
}
