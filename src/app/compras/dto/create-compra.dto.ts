import { IsNotEmpty } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ArticulosComprasDto {

  @IsNotEmpty()
  @ApiProperty({ description: 'Lote', type: Number })
  lote: number; 

  @IsNotEmpty()
  @ApiProperty({ description: 'Generado', type: String })
  Generado: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'Porcentaje de descuento', type: Number })
  PorcDesc: number;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Lista de precio que se utilizo', type: Number })
  // LisPre: number;

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
  CveProdFac: string; 

  // Si agregan los dos lispre en detmovtos el campo lispre = 0; 
  @IsOptional()
  @ApiProperty({ description: 'Lote', type: Number })
  Lispre1: number;  

  @IsOptional()
  @ApiProperty({ description: 'Lote', type: Number })
  Lispre2: number; 

}

export class CreateCompraDto {

  @IsNotEmpty()
  @ApiProperty({ description: 'CVEBOD' })
  CVEBOD: number;  



  @IsNotEmpty()
  @ApiProperty({ description: 'CveMov' })
  CveMov: number;

  @IsOptional()
  @ApiProperty({ description: 'SerMov' })
  SerMov: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'NumDoc' })
  NumDoc: string;

  // este es igual a imptot
  // @IsNotEmpty()
  // @ApiProperty({ description: 'ImpMov' })
  // ImpMov: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpDes' })
  ImpDes: number;

  // Descuento por producto
  @IsNotEmpty()
  @ApiProperty({ description: 'PorcDesc' })
  PorcDesc: number;

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

  // CveDelVendedor
  // @IsNotEmpty()
  // @ApiProperty({ description: 'CveVen' })
  // CveVen: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'Observ' })
  Observ: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'ImpLet' })
  ImpLet: string;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Facturada' })
  // Facturada: number;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Cancelada' })
  // Cancelada: number;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Devuelto' })
  // Devuelto: number;

  // @IsNotEmpty()
  // @ApiProperty({ description: 'Afectado' })
  // Afectado: number;

  @IsNotEmpty()
  @ApiProperty({ description: 'UsuarioAlta' })
  UsuarioAlta: string; 

  @IsNotEmpty()
  @ApiProperty({ description: 'CVEPROVCLI' })
  CVEPROVCLI: number

  @IsNotEmpty()
  @ApiProperty({ type: [ArticulosComprasDto], description: 'Lista de artículos' })
  Articulos: ArticulosComprasDto[]; 
}; 