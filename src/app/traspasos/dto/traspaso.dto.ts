import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class TraspasoDto {
  @IsNumber()
  @ApiProperty({ description: 'Clave de bodega Origen' })
  cveBodOrig: number;
    @IsString()
  @ApiProperty({ description: 'Serie de movimiento Origen' })
  serMovOrig: string;

  @IsNumber()
  @ApiProperty({ description: 'Clave de bodega Destino' })
  CveBodDes: number;


  @IsString()
  @ApiProperty({ description: 'Clave de movimiento' })
  cveMov: string;

  @IsNumber()
  @ApiProperty({ description: 'Tipo de Movimeinto' })
  tipMov: number;



  @IsString()
  @ApiProperty({ description: 'Usuario Alta' })
  usuarioAlta: string;
    /* ===== ARTICULOS ===== */
  @ApiProperty({ type: () => ProductoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoDto)
  articulo: ProductoDto[];

  /* ===== MOVIMIENTO ===== */
  @ApiProperty({ type: () => MovimientoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovimientoDto)
  movimiento: MovimientoDto[];





}

export class MovimientoDto {

  @IsOptional()
  @IsString()
  ordCom: string;

  @IsOptional()
  @IsString()
  numDoc: string;

  @IsOptional()
  @IsNumber()
  diasCred: number;

  @IsOptional()
  @IsNumber()
  impMov: number;

  @IsOptional()
  @IsNumber()
  impDes: number;

  @IsOptional()
  @IsNumber()
  porcDesc: number;

  @IsOptional()
  @IsNumber()
  impFle: number;

  /*      @IsOptional() 
      @ApiProperty({ description: 'ImpSub' })
    @IsNumber()
    impSub: number; */

  @IsOptional()
  @IsNumber()
  impIva: number;

  @IsOptional()
  @IsNumber()
  porcIva: number;

  @ApiProperty({ description: 'Importe Total' })
  @IsNumber()
  impTot: number;

  @IsOptional()
  @IsString()
  cveVen: string;

  @ApiProperty({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observ: string;

  @ApiProperty({ description: 'ImpLet' })
  @IsOptional()
  @IsString()
  impLet: string;

  @IsOptional()
  @IsBoolean()
  facturada: boolean;

  @IsOptional()
  @IsBoolean()
  cancelada: boolean;

  @IsOptional()
  @IsBoolean()
  devuelto: boolean;

  @IsOptional()
  @IsBoolean()
  afectado: boolean;

  @IsOptional()
  @IsNumber()
  numDias: number;

  @IsOptional()
  @IsBoolean()
  repEntregada: boolean;

  @IsOptional()
  @IsBoolean()
  garantia: boolean;

  @IsOptional()
  @IsNumber()
  usuarioId: number;

  @IsOptional()
  @IsNumber()
  CveBodOrig: number;

}



export class ProductoDto {

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



  /*   
          @ApiProperty({ description: 'Cantidad' })
    @IsNumber()
    cant: number */

  /*   @ApiProperty({ description: 'Porcentaje' })
    @IsNumber()
    porcentaje: number; */

   /*   @ApiProperty({ description: 'Importe total' })
    @IsNumber()
    importeTotal: number; */
   

}