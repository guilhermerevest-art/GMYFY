import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ValidarCheckinDto {
  @ApiProperty({ description: 'Token JWT do QR Code gerado pelo totem' })
  @IsString()
  qrToken!: string;
}
