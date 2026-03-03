import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger"
import { TraspasoDto } from "./traspaso.dto"
import { IsNumber, IsString } from "class-validator";

export class AceptarTraspaso extends PartialType(OmitType(TraspasoDto, ['cant', 'usuarioAlta', 'movimiento'] as const)) {


    @IsString()
    @ApiProperty({ description: 'Clave de movimiento' })
    Folmov: string;
}