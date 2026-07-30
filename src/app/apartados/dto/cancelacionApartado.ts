import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CancelarApartadoDto {
  
    @ApiProperty({ description: 'Clave de la bodega origen' })
  @IsNumber()
  cvebodOrg: number;

  @ApiProperty({ description: 'Serie del movimiento origen' })
  @IsString()
  serMovOrg: string;

  @ApiProperty({ description: 'Folio del movimiento' })
  @IsNumber()
  folMov: number;

  @ApiProperty({ description: 'Tipo de cancelación' })
  @IsNumber()
  tipCancel: number;

  @ApiProperty({ description: 'Clave del cliente' })
  @IsNumber()
  cvecli: number;
    @ApiProperty({ description: 'Clave del producto' })
  @IsString()
  cveProd: string;

  @ApiProperty({ description: 'Usuario que realiza la cancelación' })
  @IsString()
  usuarioBaja: string;

  @ApiPropertyOptional({ description: 'Llave de autorización para la cancelación' })
  @IsOptional()
  @IsString()
  refLlave?: string;


}