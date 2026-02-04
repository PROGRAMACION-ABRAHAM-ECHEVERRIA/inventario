import { ApiProperty } from "@nestjs/swagger";

export class EntradaDto {
   @ApiProperty({ description: 'Clave de bodega' })
  cveBod: number;

  @ApiProperty({ description: 'Clave de movimiento' })
  cveMov: string;

  @ApiProperty({ description: 'Serie de movimiento' })
  serMov: string;

  @ApiProperty({ description: 'Usuario Alta' })
  usuarioAlta: string;

  @ApiProperty({ description: 'Login' })
  login: string;

  @ApiProperty({ description: 'Clave proveedor / cliente' })
  cveProvCli: string;

  @ApiProperty({ type: () => ArticuloDto, isArray: true })
  articulo: ArticuloDto[];

  @ApiProperty({ type: () => MovimientoDto, isArray: true })
  movimiento: MovimientoDto[];

    @ApiProperty({ type: () => DetalleMovimientoDto, isArray: true })
  detalles: DetalleMovimientoDto[];

  @ApiProperty({ type: () => ExisteDto, isArray: true })
  existencias: ExisteDto[];


}


export class MovimientoDto {

  ordCom: string;
  numDoc: string;

  diasCred: number;
  impMov: number;
  impDes: number;
  porcDesc: number;
  impFle: number;
  impSub: number;
  impIva: number;
  porcIva: number;

  @ApiProperty({ description: 'Importe Total' })
  impTot: number;

  cveVen: string;

  @ApiProperty({ description: 'Observaciones' })
  observ: string;

  @ApiProperty({ description: 'ImpLet' })
  impLet: string;

  facturada: boolean;
  cancelada: boolean;
  devuelto: boolean;
  afectado: boolean;
  numDias: number;
  repEntregada: boolean;
  garantia: boolean;

  usuarioId: number;
}


export class DetalleMovimientoDto {

/*   @ApiProperty({ description: 'Folio de movimiento' })
  folMov: number; */

/*   @ApiProperty({ description: 'Clave de producto' })
  cveProd: string; */

  @ApiProperty({ description: 'Cantidad' })
  cant: number;

  lisPre: number;
  porcDesc: number;

  @ApiProperty({ description: 'Precio unitario' })
  preUni: number;

  @ApiProperty({ description: 'Importe subtotal' })
  impSub: number;

  @ApiProperty({ description: 'Descripción del producto' })
  desProd: string;
}



export class ExisteDto {

/*   @ApiProperty({ description: 'Clave de producto' })
  cveProd: string; */

  @ApiProperty({ description: 'Existencia' })
  existe: number;

  @ApiProperty({ description: 'Fecha inventario' })
  fecInv: Date;

  @ApiProperty({ description: 'Último costo' })
  ultCos: number;

  @ApiProperty({ description: 'Costo promedio' })
  cosPro: number;

  @ApiProperty({ description: 'Existencia física' })
  exiFis: number;
}


export class ArticuloDto {

  @ApiProperty({ description: 'Clave del producto' })
  cveProd: string;

  @ApiProperty({ description: 'Cantidad' })
  cant: number;

  @ApiProperty({ description: 'Lista de precios' })
  lisPre: number;

  @ApiProperty({ description: 'Precio unitario' })
  preUni: number;

  @ApiProperty({ description: 'Porcentaje' })
  porcentaje: number;

  @ApiProperty({ description: 'Importe total' })
  importeTotal: number;

  @ApiProperty({ description: 'Descripción del producto' })
  desProd: string;
}



