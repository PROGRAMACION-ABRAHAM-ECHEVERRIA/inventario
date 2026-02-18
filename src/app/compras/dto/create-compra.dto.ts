import { IsNotEmpty } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArticulosComprasDto {

  @ApiProperty({ description: 'Clave del producto', type: String })
  CveProd: string;

  @ApiProperty({ description: 'Lote', type: Number })
  lote: number;

  @ApiProperty({ description: 'Generado', type: String })
  Generado: string;

  @ApiProperty({ description: 'Porcentaje de descuento', type: Number })
  porcentaje: number;

  @ApiProperty({ description: 'Lista de precio que se utilizo', type: Number })
  LisPre: number;

  @ApiProperty({ description: 'Precio unitario', type: Number })
  PreUni: number;

  @ApiProperty({ description: 'Importe total', type: Number })
  importeTotal: number;

  @ApiProperty({ description: 'Descripción del producto', type: String })
  DesProd: string;

  @ApiProperty({ description: 'Cantidad del producto', type: Number })
  Cant: number;

  @ApiProperty({
    description: 'Fecha de inventariado del producto en existe',
    type: String,
    format: 'date-time'
  })
  fecInv: Date;

  @ApiProperty({ description: 'Unidad del producto', type: String })
  CveUni: string;

  @ApiProperty({ description: 'Familia del producto', type: Number })
  CveFam: number;

  @ApiProperty({ description: 'CveMar', type: Number })
  CveMar: number;

  @ApiProperty({ description: 'Observacion del producto', type: String })
  ObservaProd: string; 

@ApiProperty({ description: 'Observacion del producto', type: String })
  CveProdFac: string
}

export class CreateCompraDto {

  //   @ApiProperty({ description: 'UsuarioId' })
  // UsuarioId: number;


  @ApiProperty({ description: 'CVEBOD' })
  CVEBOD: number; 

  @ApiProperty({ description: 'CveMov' })
  CveMov: number;

  @ApiProperty({ description: 'SerMov' })
  SerMov: string;

  @ApiProperty({ description: 'OrdCom' })
  OrdCom: number;

  @ApiProperty({ description: 'NumDoc' })
  NumDoc: number;

  // @ApiProperty({ description: 'CveProvCli' })
  // CveProvCli: number;

  @ApiProperty({ description: 'DiasCred' })
  DiasCred: number;

  @ApiProperty({ description: 'ImpMov' })
  ImpMov: number;

  @ApiProperty({ description: 'ImpDes' })
  ImpDes: number;

  @ApiProperty({ description: 'PorcDesc' })
  PorcDesc: number;

  @ApiProperty({ description: 'ImpFle' })
  ImpFle: number;

  @ApiProperty({ description: 'ImpSub' })
  ImpSub: number;

  @ApiProperty({ description: 'ImpIva' })
  ImpIva: number;

  @ApiProperty({ description: 'PorcIva' })
  PorcIva: number;

  @ApiProperty({ description: 'ImpTot' })
  ImpTot: number;

  @ApiProperty({ description: 'Login' })
  Login: number;

  @ApiProperty({ description: 'CveVen' })
  CveVen: number;

  @ApiProperty({ description: 'Observ' })
  Observ: string;

  @ApiProperty({ description: 'ImpLet' })
  ImpLet: string;

  @ApiProperty({ description: 'Facturada' })
  Facturada: number;

  @ApiProperty({ description: 'Cancelada' })
  Cancelada: number;

  @ApiProperty({ description: 'Devuelto' })
  Devuelto: number;

  @ApiProperty({ description: 'Afectado' })
  Afectado: number;

  @ApiProperty({ description: 'NumDias' })
  NumDias: number;

  @ApiProperty({ description: 'RepEntregada' })
  RepEntregada: number;

  @ApiProperty({ description: 'Garantia' })
  Garantia: string;

  @ApiProperty({ description: 'UsuarioAlta' })
  UsuarioAlta: string; 

  // @ApiProperty({ description: 'Tipo' })
  // TIPO: number; 

  @ApiProperty({ description: 'CVEPROVCLI' })
  CVEPROVCLI: number

  @ApiProperty({ type: [ArticulosComprasDto], description: 'Lista de artículos' })
  Articulos: ArticulosComprasDto[]; 
}; 