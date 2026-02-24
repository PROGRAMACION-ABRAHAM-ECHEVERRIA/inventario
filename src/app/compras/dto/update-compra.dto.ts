import { PartialType } from '@nestjs/mapped-types';
import { CreateCompraDto } from './create-compra.dto';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEncabezadoFactura {  

    @IsNotEmpty()
    @ApiProperty({ description: 'NumDoc' })
    NumDoc: string; 

    @IsNotEmpty()
    @ApiProperty({
        description: 'Fecha de alta de la factura en movtos',
        type: String,
        format: 'date-time'
    })
    fechaAlta: Date;  

    @IsNotEmpty()
    @ApiProperty({ description: 'CVEPROVCLI' })
    CVEPROVCLI: number; 

    @IsNotEmpty()
    @ApiProperty({ description: 'Observ' })
    Observ: string; 

    @IsNotEmpty()
    @ApiProperty({ description: 'NumDoc' })
    UsuarioMod: string; 

}
