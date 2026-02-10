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
        const { cvebod, cveProductos, cvemov, usuarioAlta, usuarioId, fechaSalida, observ, imptot, sermov } = salidasDto;

        console.log(sermov, cvebod, cvemov);

        const query = `
            exec SP_GV_CrearFolMov
                @cvebod = @0,
                @cvemov = @1,
                @sermov = @2;
        `;

        const resFolMov = await this.dataSource.query(query, [cvebod, cvemov, sermov ?? '']);

        console.log(resFolMov);

        if (resFolMov[0].error || !resFolMov[0].FolMov) {
            // si falla uno, lanzamos excepción y detenemos el bucle
            throw this.ApiJson.customeHttpExeption(resFolMov[0].mensaje, resFolMov[0].estatus);
        }

        try {
            // recorrer cada producto
            for (const prod of cveProductos) {
                const { cant, cveProd, impSub, precioUnidad} = prod;

                const query = `
                exec SP_GV_Salidas
                    @cvebod = @0,
                    @cveprod = @1,
                    @cvemov = @2,
                    @folmov = @3,
                    @sermov = @4,
                    @usuario = @5,
                    @fechasalida = @6,
                    @observ = @7,
                    @imptot = @8,
                    @usuarioid = @9,
                    @cantidad = @10,
                    @preuni = @11,
                    @impsub = @12;
                `;

                const res = await this.dataSource.query(query, [
                    cvebod, 
                    cveProd, 
                    cvemov, 
                    resFolMov[0].FolMov, 
                    sermov ?? '', 
                    usuarioAlta, 
                    fechaSalida, 
                    observ, 
                    imptot, 
                    usuarioId, 
                    cant,
                    precioUnidad,
                    impSub]
                );

                console.log(res);

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
