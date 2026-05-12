import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource, EntityManager } from 'typeorm';
import { CreateApartadoDto } from './dto/createApartado.dto';
import { SpResponse } from 'src/types/resJson';


interface resApartadosMovtoResponse {
    error: boolean;
    mensaje: string;
    estatus: number;
}

@Injectable()
export class ApartadosService {

    constructor(
        private JwtServiceCustom: JwtServiceCustom,
        private readonly dataSource: DataSource,
        private readonly manager: EntityManager,
    ) { }

    public ApiJson = new resJsonClass();

    async create(createApartadoDto: CreateApartadoDto) {

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {

            const entityManager = queryRunner.manager;
            const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;

            const {
                cveProvCli,
                observ,
                cvebod,
                serMov,
                usuarioId,
                UsuarioAlta,
                articulo,
                movimiento

            } = createApartadoDto;
            console.log(createApartadoDto);

            /* ================= VALIDACIONES ================= */

            if (!movimiento?.length)
                throw new HttpException('Debe existir al menos un movimiento', HttpStatus.BAD_REQUEST);

            if (!articulo?.length)
                throw new HttpException('Debe existir al menos un artículo', HttpStatus.BAD_REQUEST);



            // validando el CveProvCli
            if (!cveProvCli) {
                this.ApiJson.customeHttpExeption(
                    'Ingresa un proveedor',
                    HttpStatus.BAD_REQUEST,
                );
            }

            let [findProv] = await entityManager.query(
                `SELECT 1 FROM [dbo].[CATPROV] WHERE CVEPROV = @0`,
                [cveProvCli],
            );

            if (!findProv) {
                this.ApiJson.customeHttpExeption(
                    'No existe el proveedor',
                    HttpStatus.NOT_FOUND,
                );
            }

            // ============================================
            // 1. INSERTAR MOVIMIENTO
            // ============================================
            const resMovtos: Array<
                resApartadosMovtoResponse & { Folmov: number; fecmov: string }
            > = await entityManager.query(
                `EXEC [dbo].[SP_GV_AgregarMovTosBool2]
                      @CVEBOD        = @0,//
                      @CveMov        = @1, //
                      @SerMov        = @2,//
                      @OrdCom        = @3,//
                      @NumDoc        = @4,//
                      @CveProvCli    = @5,//
                      @DiasCred      = @6,//
                      @ImpMov        = @7,//
                      @ImpDes        = @8,//
                      @PorcDesc      = @9,//
                      @ImpFle        = @10,//
                      @ImpSub        = @11,//
                      @ImpIva        = @12,//
                      @PorcIva       = @13,//
                      @ImpTot        = @14,//
                      @Login         = @15,//
                      @CveVen        = @16,//
                      @Observ        = @17,//
                      @ImpLet        = @18,//
                      @Facturada     = @19,//
                      @Cancelada     = @20,//
                      @Devuelto      = @21,//
                      @Afectado      = @22,//
                      @NumDias       = @23,//
                      @RepEntregada  = @24,//
                      @Garantia      = @25,//
                      @UsuarioAlta   = @26,
                      @UsuarioId = @27`,
                [
                    100,
                    16,
                    serMov,
                    0,
                    0,
                    cveProvCli,
                    0,
                    movimiento[0].impTot,
                    0,
                    0,
                    0,
                    movimiento[0].impTot,
                    0,
                    0,
                    movimiento[0].impTot,
                    UsuarioAlta,
                    movimiento[0].cveVen,
                    observ ? observ : '',
                    movimiento[0].impLet,
                    0,//Facturada
                    0,//Cancelada
                    0,//Devuelto
                    0,//Afectado
                    0,
                    0,
                    '',
                    UsuarioAlta,
                    usuarioId ? usuarioId : 0,
                ],
            );

            if (!resMovtos[0] || resMovtos[0].error) {
                const mensaje = resMovtos[0]?.mensaje || 'Error al crear el movimiento';
                const estatus =
                    resMovtos[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                this.ApiJson.customeHttpExeption(mensaje, estatus);
            }

            const FolMov = resMovtos[0].Folmov;
            const fecMov = resMovtos[0].fecmov;

            // ============================================
                  // 2. INSERTAR DETALLES DE MOVIMIENTO
                  // ============================================
                  for (const art of articulo) {
                    const [resDetmovtos]: SpResponse = await entityManager.query(
                      `EXEC [dbo].[SP_GV_AgregarDetMovTosBool2]
                        @CveBod      = @0,
                        @FolMov      = @1,
                        @CveMov      = @2,
                        @SerMov      = @3,
                        @CveProd     = @4,
                        @Cant        = @5,
                        @LisPre      = @6,
                        @PorcDesc    = @7,
                        @PreUni      = @8,
                        @ImpSub      = @9,
                        @DesProd     = @10,
                        @UsuarioAlta = @11`,
                      [
                     100,
                        FolMov,
                      16,
                     serMov,
                        art.cveProd,
                        art.cant,
                        art.lisPre ? art.lisPre: 0,
                       0,
                        art.lisPre,
                          movimiento[0].impTot,
                        art.desProd,
                     UsuarioAlta,
                      ],
                    );
            
                    if (resDetmovtos?.error) {
                      const mensaje =
                        resDetmovtos.mensaje || 'Error al crear detalle de movimiento';
                      const estatus =
                        resDetmovtos.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                      this.ApiJson.customeHttpExeption(mensaje, estatus);
                    }
                  }

                        // ============================================
                  // 3. INSERTAR PAGO DEL APARTADO
                  // ============================================

                 // ============================================
                  // 3. INSERTAR DETALLE DE PAGO DEL APARTADO
                  // ============================================


                          // ============================================
                  // 3. CAMBIAR EXISTENCIA DE LA BODEGA ORIGEN A LA BODEGA 100
                  // ============================================
            

        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            );

        } finally {
            // Siempre liberar el queryRunner
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }

        }

    }
}
