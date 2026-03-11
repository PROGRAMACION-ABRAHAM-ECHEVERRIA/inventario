import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber } from "class-validator";

export class CancelarTraspaso extends PartialType(OmitType(TraspasoDto, ['movimiento', 'articulo', 'CveBodDes'])){
    
        @IsNumber()
        @ApiProperty({ description: 'Clave de movimiento' })
        Folmov: number;

        
        @IsNumber()
        @ApiProperty({ description: 'id user SSO' })
        UsuarioId:number;
}