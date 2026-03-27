import { ApiHideProperty, ApiProperty, OmitType, PartialType } from "@nestjs/swagger"
import { TraspasoDto } from "./traspaso.dto"
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class AceptarTraspaso  {

  @IsNumber()
  @ApiProperty({ description: 'Folio' })
  Folmov: number;

  @IsNumber()
  @ApiProperty({ description: 'Clave de movimiento' })
  cveMov: number;

  @ApiProperty({ description: 'Clave de bodega Destino' })
  @IsNumber()
  CveBodOrig: number;

  @ApiProperty({ description: 'Serie de movimiento Destino' })
  @IsString()
  serMovOrig: string;

  @ApiProperty({ description: 'Clave de bodega Destino' })
  @IsNumber()
  CveBodDes: number;

  @ApiProperty({ description: 'Serie de movimiento Destino' })
  @IsString()
  serMovDes: string;

  @IsString()
  @ApiProperty({ description: 'UsuarioMod' })
  usuarioMod: string;

  @ApiProperty({ type: () => ProductoAceptarDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoAceptarDto)
  articulo: ProductoAceptarDto[];

  
}




export class ProductoAceptarDto {

  @ApiProperty({ description: 'Clave del producto' })
  @IsString()
  cveProd: string;
    @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  desProd: string;
  @ApiProperty({ description: 'Cantidad' })
  @IsNumber()
  cant: number; 

}