import { IsNotEmpty } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ArticulosComprasDto {

  @IsNotEmpty()
  @ApiProperty({ description: 'Clave del producto', type: String })
  CveProd: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Lote', type: Number })
  lote: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Generado', type: String })
  Generado: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Porcentaje de descuento', type: Number })
  porcentaje: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Lista de precio que se utilizo', type: Number })
  LisPre: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Precio unitario', type: Number })
  PreUni: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Importe total', type: Number })
  importeTotal: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Descripción del producto', type: String })
  DesProd: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Cantidad del producto', type: Number })
  Cant: number;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Fecha de inventariado del producto en existe',
    type: String,
    format: 'date-time'
  })
  fecInv: Date;

  @IsNotEmpty()
  @ApiProperty({ description: 'Unidad del producto', type: String })
  CveUni: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Familia del producto', type: Number })
  CveFam: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'CveMar', type: Number })
  CveMar: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Observacion del producto', type: String })
  ObservaProd: string; 

  @IsNotEmpty()
  @ApiProperty({ description: 'Observacion del producto', type: String })
  CveProdFac: string
}

export class CreateCompraDto {

  //   @ApiProperty({ description: 'UsuarioId' })
  // UsuarioId: number;


  @IsNotEmpty()
  @ApiProperty({ description: 'CVEBOD' })
  CVEBOD: number; 

  @IsNotEmpty()
  @ApiProperty({ description: 'CveMov' })
  CveMov: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'SerMov' })
  SerMov: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'OrdCom' })
  OrdCom: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'NumDoc' })
  NumDoc: number;

  // @ApiProperty({ description: 'CveProvCli' })
  // CveProvCli: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'DiasCred' })
  DiasCred: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpMov' })
  ImpMov: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpDes' })
  ImpDes: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'PorcDesc' })
  PorcDesc: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpFle' })
  ImpFle: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpSub' })
  ImpSub: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpIva' })
  ImpIva: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'PorcIva' })
  PorcIva: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpTot' })
  ImpTot: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Login' })
  Login: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'CveVen' })
  CveVen: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Observ' })
  Observ: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpLet' })
  ImpLet: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Facturada' })
  Facturada: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Cancelada' })
  Cancelada: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Devuelto' })
  Devuelto: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Afectado' })
  Afectado: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'NumDias' })
  NumDias: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'RepEntregada' })
  RepEntregada: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Garantia' })
  Garantia: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'UsuarioAlta' })
  UsuarioAlta: string; 

  // @ApiProperty({ description: 'Tipo' })
  // TIPO: number; 

  @IsNotEmpty()
  @ApiProperty({ description: 'CVEPROVCLI' })
  CVEPROVCLI: number

  @IsNotEmpty()
  @ApiProperty({ type: [ArticulosComprasDto], description: 'Lista de artículos' })
  Articulos: ArticulosComprasDto[]; 
}; 