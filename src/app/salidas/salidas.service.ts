import { Injectable, UsePipes, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { resJsonClass } from 'src/utils/resJsonClass';

import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { SalidaDTO } from './dto/create-salida.dto';

@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Registrar salidas de productos')
@UseAuth()
@Injectable()
export class SalidasService {
    constructor(
        private readonly dataSource: DataSource,
    ) { }

    public ApiJson = new resJsonClass();

    async salidas(salidasDto: SalidaDTO) {
        const { cvebod, cveProductos, cvemov, usuarioAlta, usuarioId, fechaSalida, observ, imptot } = salidasDto;

        try {
            // recorrer cada producto
            for (const prod of cveProductos) {
                const {cant, cveProd} = prod;

                const query = `
                exec SP_GV_Salidas
                    @cvebod = @0,
                    @cveprod = @1,
                    @cvemov = @2,
                    @usuario = @3,
                    @fechasalida = @4,
                    @observ = @5,
                    @imptot = @6,
                    @usuarioid = @7,
                    @cantidad = @8;
                `;

                const res = await this.dataSource.query(query, [cvebod, cveProd, cvemov, usuarioAlta, fechaSalida, observ, imptot, usuarioId, cant]);

                if (res[0].error) {
                    // si falla uno, lanzamos excepción y detenemos el bucle
                    throw this.ApiJson.customeHttpExeption(res[0].mensaje, res[0].estatus);
                }
            }

            return this.ApiJson.customeResSuccess('Salidas creada exitosamente', [])
        } catch (error) {
            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            )
        }
    }
}
