import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ApartadoDto {

  @ApiProperty({ description: 'Clave de bodega de la sucursal Origen' })
  @IsNumber()
  cvebodOrigen: number;


  @ApiProperty({ description: 'Serie de la sucursal' })
  @IsString()
  serMov: string;


  @ApiProperty({ description: 'Clave del cliente' })
  @IsNumber()
  cveProvCli: number;
  @ApiProperty({ description: 'Observa' })
  @IsString()
  observ: string;

  
/*   @ApiProperty({ description: 'Login del usuario' })
  @IsString()
  login: string;
 */



/*   @ApiProperty({ description: 'UsuarioAlta' })
  @IsString()
  UsuarioAlta: string;
 */
  @ApiProperty({ type: () => ArticuloApartadoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticuloApartadoDto)
  articulo: ArticuloApartadoDto[];

  /* ===== MOVIMIENTO ===== */
  @ApiProperty({ type: () => MovimientoApartadoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovimientoApartadoDto)
  movimiento: MovimientoApartadoDto[];

  /* ===== PAGOS ===== */
  @ApiProperty({ type: () => PagoApartadoInicialDto , isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagoApartadoInicialDto )
  pagos: PagoApartadoInicialDto [];

  /* ===== DETALLE PAGOS ===== */
  @ApiProperty({ type: () => DetallePagoApartadoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetallePagoApartadoDto)
  detallePagos: DetallePagoApartadoDto[];

}

export class MovimientoApartadoDto {


  @ApiProperty({ description: 'Clave Vendedor' })
  @IsNumber()
  cveVen: number;

    @ApiProperty({ description: 'Importe Total' })
  @IsNumber()
  impTot: number;

  @ApiProperty({ description: 'Importe de Letra' })
  @IsString()
  impLet: string;

}



export class ArticuloApartadoDto {

  @ApiProperty({ description: 'Clave del producto' })
  @IsString()
  cveProd: string;
  @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  desProd: string;
  @ApiProperty({ description: 'Lista de precios' })
  @IsNumber()
  lisPre: number;

/*   @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  preUni: number; */

  @ApiProperty({ description: 'Cantidad' })
  @IsNumber()
  cant: number;


}

export class PagoApartadoInicialDto {

 

  @ApiProperty({ description: 'Número total de pagos programados' })
  @IsNumber()
  numPagosTotal: number;



 // es el 10% del pago inicial
  @ApiProperty({ description: 'Importe programado por pago' })
  @IsNumber()
  impPagoProg: number;


}
export class DetallePagoApartadoDto {



  @ApiProperty({ description: 'Clave tipo de pago' })
  @IsNumber()
  cveTpPgo: number;

  
}



