import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber, IsString } from "class-validator";

export class RechazarTraspaso extends PartialType(OmitType(TraspasoDto, ['movimiento', 'articulo' ,'usuarioAlta'])){
    
        @IsNumber()
        @ApiProperty({ description: 'Folio movimiento' })
        Folmov: number;
    @IsString()
    @ApiProperty({ description: 'Usuario Alta' })
    usuarioBaja: string;
     

}