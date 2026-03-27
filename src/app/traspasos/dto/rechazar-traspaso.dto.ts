import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber, IsString } from "class-validator";
import { CancelarTraspasoDTO } from "./cancelar-traspaso.dto";
import { IsOptional } from "@nestjs/class-validator";

export class RechazarTraspaso {
    
     @IsNumber()
  @ApiProperty({ description: 'Clave de movimiento' })
  cveMov: number;
  @IsNumber()
  @ApiProperty({ description: 'Folio' })
  Folmov: number;



  @IsNumber()
  @ApiProperty({ description: 'Clave de bodega Origen' })
  cveBodOrig: number;
  @IsString()
  @ApiProperty({ description: 'Serie de movimiento Origen' })
  serMovOrig: string;

  @IsNumber()
  @ApiProperty({ description: 'Clave de bodega Destino' })
  CveBodDes: number;
  @ApiProperty({ description: 'Serie de movimiento Destino' })
  @IsString()
  serMovDes: string;

  @IsString()
  @ApiProperty({ description: 'Usuario Alta' })
  usuarioBaja: string;

    @IsString()
    @IsOptional()
  @ApiProperty({ description: 'Observación' })
  Observa: string;


}