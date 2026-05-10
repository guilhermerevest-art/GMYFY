import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePremioDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;

  @ApiProperty()
  @IsInt()
  pontosNecessarios!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  estoque?: number;
}

export class UpdatePremioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pontosNecessarios?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  estoque?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
