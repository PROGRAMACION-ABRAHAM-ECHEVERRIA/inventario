import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber } from "class-validator";

export class RechazarTraspaso extends PartialType(OmitType(TraspasoDto, ['movimiento', 'articulo'])){
    
        @IsNumber()
        @ApiProperty({ description: 'Folio movimiento' })
        Folmov: number;

     

}