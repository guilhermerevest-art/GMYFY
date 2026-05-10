import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum TipoDesafio { INDIVIDUAL = 'INDIVIDUAL', GRUPO = 'GRUPO', TURMA = 'TURMA' }

export class CreateDesafioDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ enum: TipoDesafio })
  @IsOptional()
  @IsEnum(TipoDesafio)
  tipo?: TipoDesafio;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  metaCheckins?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pontosBonus?: number;

  @ApiProperty()
  @IsDateString()
  inicioEm!: string;

  @ApiProperty()
  @IsDateString()
  fimEm!: string;
}

export class UpdateDesafioDto {
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
  metaCheckins?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  pontosBonus?: number;
}
