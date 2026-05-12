import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class ApartadoDto{

            @ApiProperty({ description: 'Clave de bodega de la sucursal' })
        @IsNumber()
  cvebod: number;


        @ApiProperty({ description: 'Serie de la sucursal' })
    @IsString()
    serMov: string;


  @ApiProperty({ description: 'Clave del cliente' })
    @IsNumber()
  cveProvCli: number;
      @ApiProperty({ description: 'Observa' })
    @IsString()
    observ: string;
    
      @ApiProperty({ description: 'UsuarioId' })
        @IsNumber()
  usuarioId: number;

    


        @ApiProperty({ description: 'UsuarioAlta' })
    @IsString()
    UsuarioAlta: string;




    
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

}

export class MovimientoApartadoDto {


      @ApiProperty({ description: 'Clave Vendedor' })
  @IsNumber()
  cveVen: number;

        @ApiProperty({ description: 'Importe de Letra' })
    @IsString()
    impLet: string;
      @ApiProperty({ description: 'Importe Total' })
  @IsNumber()
  impTot: number;
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

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  preUni: number; 

  @ApiProperty({ description: 'Cantidad' })
  @IsNumber()
  cant: number; 




 



}

export class PagoApartadoDto{
      @ApiProperty({ description: 'Número de Pago' })
  @IsNumber()
  numPago: number; 

        @ApiProperty({ description: 'Número de Pagos totales' })
  @IsNumber()
  numPagosTotal: number; 
  
}