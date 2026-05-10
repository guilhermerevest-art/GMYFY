import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoUsuario } from '../../shared/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  nome!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  senha!: string;

  @ApiPropertyOptional({ enum: TipoUsuario })
  @IsOptional()
  @IsEnum(TipoUsuario)
  tipo?: TipoUsuario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  academiaId?: string;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  senha!: string;
}
