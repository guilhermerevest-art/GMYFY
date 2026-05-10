import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

enum TipoReacao { CORAGEM = 'CORAGEM', FOGO = 'FOGO', TROFEU = 'TROFEU' }

export class CreatePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  conteudo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imagemUrl?: string;
}

export class CreateReacaoDto {
  @ApiPropertyOptional({ enum: TipoReacao })
  @IsEnum(TipoReacao)
  tipo!: TipoReacao;
}
