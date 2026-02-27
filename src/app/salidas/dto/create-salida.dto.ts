import { IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class cveProd {
    @ApiProperty({ description: 'cveprod' })
    cveProd: string;

    @ApiProperty({ description: 'Cantidad del producto' })
    cant: number;
    
    @ApiProperty({ description: 'Total por productos' })
    impSub: number;

    @ApiProperty({ description: 'Precio del producto' })
    precioUnidad: number;
}

export class SalidaDTO {
    @IsNotEmpty()
    @ApiProperty({ description: 'CVEBOD' })
    cvebod: number;

    @IsNotEmpty()
	@ApiProperty({ description: 'CveMov' })
    cvemov: number;

    @IsNotEmpty()
    @ApiProperty({ description: 'usuarioAlta' })
	usuarioAlta: string;

    @IsOptional()
    @ApiProperty({ description: 'sermov' })
	sermov: string;
	
    @IsNotEmpty()
    @ApiProperty({ description: 'Fecha salida', example: "2012-12-20 18:07:36.877" })
    fechaSalida: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Observaciones' })
    observ: string;

    @IsNotEmpty()
	@ApiProperty({ description: 'ImpTot' })
    imptot: number;

    @IsNotEmpty()
    @ApiProperty({ description: 'usuarioId' })
    usuarioId: number;

    @IsNotEmpty()
    @ApiProperty({ type: [cveProd], description: 'Lista de cveprod' })
    cveProductos: cveProd[];
}
