import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelarApartadoDto {
  
  @ApiProperty({ description: 'Clave de bodega de la sucursal Origen' })
  @IsNumber()
  cvebodOrigen: number;


  @ApiProperty({ description: 'Serie de la sucursal Destino' })
  @IsString()
  serMovOrigen: string;

  @ApiProperty({ description: 'Clave de bodega de la sucursal Destino' })
  @IsNumber()
  cvebodDes: number;


  @ApiProperty({ description: 'Serie de la sucursal Destino' })
  @IsString()
  serMovDes: string;

  @ApiProperty({ description: 'clave de movimiento' })
  @IsNumber()
  cveMov: number;

  @ApiProperty({ description: 'folio de movimiento' })
  @IsNumber()
  folMov: number;

  @ApiProperty({ description: 'Clave del cliente' })
  @IsNumber()
  CVECLI: number;

  @IsString()
  observa: string;

  @IsOptional()
  @ApiProperty({ description: 'LLave de acceso' })
  @IsString()
  refLlave?: string;

}