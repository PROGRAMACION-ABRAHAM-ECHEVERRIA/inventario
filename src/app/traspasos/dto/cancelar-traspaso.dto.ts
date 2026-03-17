import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber, IsString } from "class-validator";

export class CancelarTraspaso extends PartialType(OmitType(TraspasoDto, ['movimiento', 'articulo', 'usuarioAlta'])){
    
        @IsNumber()
        @ApiProperty({ description: 'Clave de movimiento' })
        Folmov: number;

          @IsString()
          @ApiProperty({ description: 'Usuario Alta' })
          usuarioBaja: string;

        
}