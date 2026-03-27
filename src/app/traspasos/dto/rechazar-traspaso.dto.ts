import { ApiProperty, OmitType, PartialType } from "@nestjs/swagger";
import { TraspasoDto } from "./traspaso.dto";
import { IsNumber, IsString } from "class-validator";
import { CancelarTraspasoDTO } from "./cancelar-traspaso.dto";

export class RechazarTraspaso extends CancelarTraspasoDTO{
    


}