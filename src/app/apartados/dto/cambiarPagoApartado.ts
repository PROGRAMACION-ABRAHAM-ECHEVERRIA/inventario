import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CambiotipoPagoApartadoDto{
    @ApiProperty({ description: 'Folio del movimiento' })
      @IsNumber()
      folMov: number;

    @ApiProperty({ description: 'Serie del movimiento ' })
    @IsString()
    serMov: string;

        @ApiProperty({ description: 'Folio del pago' })
      @IsNumber()
      folpag: number;

        @ApiProperty({ description: 'Tipo de pago' })
  @IsNumber()
  cveTipPag: number;

      @ApiProperty({ description: 'Numero de Pago' })
      @IsNumber()
      numPago: number;

  
    @ApiPropertyOptional({ description: 'Llave de autorización para la cancelación' })
    @IsOptional()
    @IsString()
    refLlave?: string;
  

    



}