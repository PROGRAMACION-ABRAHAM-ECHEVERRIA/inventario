import { IsOptional, IsString } from 'class-validator';

export class CancelarApartadoDto {

  @IsString()
  observa: string;

  @IsOptional()
  @IsString()
  refLlave?: string;

}