import { isNumber, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, ValidateNested } from "class-validator";

export class EntradaDto {
  @IsNumber()
   @ApiProperty({ description: 'Clave de bodega' })
  cveBod: number;
  
    @IsString()
  @ApiProperty({ description: 'Clave de movimiento' })
  cveMov: string;

    @IsString()
  @ApiProperty({ description: 'Serie de movimiento' })
  serMov: string;

  @IsString()
  @ApiProperty({ description: 'Usuario Alta' })
  usuarioAlta: string;

   @IsString()
  @ApiProperty({ description: 'Login' })
  login: string;

    @IsString()
  @ApiProperty({ description: 'Clave proveedor / cliente' })
  cveProvCli: string;

/* ===== ARTICULOS ===== */
  @ApiProperty({ type: () => ArticuloDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticuloDto)
  articulo: ArticuloDto[];

  /* ===== MOVIMIENTO ===== */
  @ApiProperty({ type: () => MovimientoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MovimientoDto)
  movimiento: MovimientoDto[];

  /* ===== DETALLES ===== */
  @ApiProperty({ type: () => DetalleMovimientoDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleMovimientoDto)
  detalles: DetalleMovimientoDto[];

  /* ===== EXISTENCIAS ===== */
  @ApiProperty({ type: () => ExisteDto, isArray: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExisteDto)
  existencias: ExisteDto[];

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

     @IsOptional() 
    @ApiProperty({ description: 'ImpSub' })
  @IsNumber()
  impSub: number;

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
}


export class DetalleMovimientoDto {

  @ApiProperty({ description: 'Cantidad' })
  @IsNumber()
  cant: number;

  @IsOptional()
  @IsNumber()
  lisPre: number;

  @IsOptional()
  @IsNumber()
  porcDesc: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  preUni: number;

  @ApiProperty({ description: 'Importe subtotal' })
  @IsNumber()
  impSub: number;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  desProd: string;
}




export class ExisteDto {

  @ApiProperty({ description: 'Existencia' })
  @IsNumber()
  existe: number;

  @ApiProperty({ description: 'Fecha inventario' })
  @Type(() => Date)
  @IsDate()
  fecInv: Date;

  @ApiProperty({ description: 'Último costo' })
  @IsNumber()
  ultCos: number;

  @ApiProperty({ description: 'Costo promedio' })
  @IsNumber()
  cosPro: number;

  @ApiProperty({ description: 'Existencia física' })
  @IsNumber()
  exiFis: number;
}


export class ArticuloDto {

  @ApiProperty({ description: 'Clave del producto' })
  @IsString()
  cveProd: string;

  @ApiProperty({ description: 'Cantidad' })
  @IsNumber()
  cant: number;

  @ApiProperty({ description: 'Lista de precios' })
  @IsNumber()
  lisPre: number;

  @ApiProperty({ description: 'Precio unitario' })
  @IsNumber()
  preUni: number;

  @ApiProperty({ description: 'Porcentaje' })
  @IsNumber()
  porcentaje: number;

  @ApiProperty({ description: 'Importe total' })
  @IsNumber()
  importeTotal: number;

  @ApiProperty({ description: 'Descripción del producto' })
  @IsString()
  desProd: string;
}



