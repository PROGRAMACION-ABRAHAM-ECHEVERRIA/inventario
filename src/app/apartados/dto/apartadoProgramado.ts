import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class ApartadoProgramadoDto{

/*         @ApiProperty({ description: 'Clave de bodega de la sucursal Origen' })
      @IsNumber()
      cvebod: number; */


    
    
      @ApiProperty({ description: 'serie de movimiento  ' })
      @IsString()
      serMov: string;

/*             @ApiProperty({ description: 'clave de movimiento' })
      @IsNumber()
      cveMov: number; */

          @ApiProperty({ description: 'folio de movimiento' })
      @IsNumber()
      folMov: number;

      
    @ApiProperty({ description: 'Clave del cliente' })
  @IsNumber()
  CVECLI: number;

             @ApiProperty({ description: 'Numero de Pago' })
      @IsNumber()
      numPago: number;

        @ApiProperty({ description: 'Clave tipo de pago' })
  @IsNumber()
  cveTpPgo: number;
    
             @ApiProperty({ description: 'Importe de Pago Programado' })
      @IsNumber()
      impPagoProg: number;


    @ApiProperty({ description: 'Observa' })
  @IsString()
  observ: string;

}


