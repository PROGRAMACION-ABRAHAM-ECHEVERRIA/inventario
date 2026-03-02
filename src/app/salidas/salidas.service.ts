import { Injectable, UsePipes, ValidationPipe, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { resJsonClass } from 'src/utils/resJsonClass';

import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SalidaDTO } from './dto/create-salida.dto';

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

    /*async salidas(salidasDto: SalidaDTO) {
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
                const { cant, cveProd, impSub, precioUnidad } = prod;

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
    }*/

    async salidas(salidasDto: SalidaDTO) {
        const { cvebod, cveProductos, cvemov, usuarioAlta, usuarioId, fechaSalida, observ, imptot, sermov } = salidasDto;

        const queryRunner = this.dataSource.createQueryRunner();

        try {
            // Abrimos la conexión y transacción
            await queryRunner.connect();
            await queryRunner.startTransaction();

            const entityManager = queryRunner.manager;

            const queryFolMov = `
            exec SP_GV_CrearFolMov
                @cvebod = @0,
                @cvemov = @1,
                @sermov = @2;
            `;

            const resFolMov = await entityManager.query(queryFolMov, [cvebod, cvemov, sermov]);

            if (resFolMov[0].error || !resFolMov[0].FolMov) {
                // si falla uno, lanzamos excepción y detenemos el bucle
                throw this.ApiJson.customeHttpExeption(resFolMov[0].Mensaje, resFolMov[0].Estatus);
            }

            // recorrer cada producto
            for (const prod of cveProductos) {
                const { cant, cveProd, impSub, precioUnidad } = prod;

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

                const res = await entityManager.query(query, [
                    cvebod,
                    cveProd,
                    cvemov,
                    resFolMov[0].FolMov,
                    sermov,
                    usuarioAlta,
                    fechaSalida,
                    observ,
                    imptot,
                    usuarioId,
                    cant,
                    precioUnidad,
                    impSub]
                );

                if (res[0].error) {
                    // si falla uno, lanzamos excepción y detenemos el bucle
                    throw this.ApiJson.customeHttpExeption(res[0].Mensaje, res[0].Estatus);
                }
            }

            await queryRunner.commitTransaction();

            return this.ApiJson.customeResSuccess('Salidas creada exitosamente', [])
        } catch (error) {
            // Rollback en caso de error
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }

            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            )
        } finally {
            // Siempre liberar el queryRunner
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }
        }
    }

    async getSalidas(cvebod: number) {
        const query = `
            exec sp_gv_getsalidasporbodega
                @cvebod = @0;
        `;

        try {
            const res = await this.dataSource.query(query, [cvebod]);

            // Si no hay filas
            if (!res || res.length === 0) {
                return this.ApiJson.customeResSuccess('No se encontraron salidas', []);
            }

            return this.ApiJson.customeResSuccess('Salidas obtenidas exitosamente', res)
        } catch (error) {
            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            )
        }
    }

    async getSalida(cvebod: number, folmov: number, cvemov: number, sermov?: string) {
        const query = `
            exec SP_GV_GetSalida
                @cvebod = @0,
                @folmov = @1,
                @cvemov = @2,
                @sermov = @3;
        `;

        try {
            const res = await this.dataSource.query(query, [cvebod, folmov, cvemov, sermov ?? ""]);

            // Si no hay filas
            if (!res || res.length === 0) {
                return this.ApiJson.customeResSuccess('No se encontraron salidas', []);
            }

            return this.ApiJson.customeResSuccess('Salidas obtenidas exitosamente', res)
        } catch (error) {
            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            )
        }
    }
}
