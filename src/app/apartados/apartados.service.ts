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
                login,
                usuarioId,
                UsuarioAlta,
                articulo,
                movimiento,
                pagos,
                detallePagos

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


                   const resPagoApartado: Array<
                resApartadosMovtoResponse & { FolPag: number; }
            > = await entityManager.query(
                `EXEC [dbo].[SP_GV_AgregarPagoApartado]
                      @Cvebod        = @0,//
                      @SerMov       = @1, //
                      @CveMov       = @2,//
                      @Folmov        = @3,//
                      @CveProCli        = @4,//
                      @ImpTot   = @5,//
                     @Observa      = @6,//
                      @Login        = @7,//
                      @UsuarioAlta        = @8`,
                [
                    100,
                    serMov,
                    16,
                    FolMov,
                    cveProvCli,
                     movimiento[0].impTot,
                      observ ? observ : '',
                    movimiento[0].impTot,
                    login,
                    UsuarioAlta ? UsuarioAlta  : ''
                ],
            );

            if (!resPagoApartado[0] || resPagoApartado[0].error) {
                const mensaje = resPagoApartado[0]?.mensaje || 'Error al crear el pago apartado';
                const estatus =
                    resPagoApartado[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                this.ApiJson.customeHttpExeption(mensaje, estatus);
            }

            const FolPag = resPagoApartado[0].FolPag;


                 // ============================================
                  // 4. INSERTAR DETALLE DE PAGO DEL APARTADO
                  // ============================================
         const resDetPagoApartado: Array<
                resApartadosMovtoResponse & {  }
            > = await entityManager.query(
                `EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]
                      @FolPag        = @0,//
                      @CveTpPgo      = @1, //
                      @Imppag      = @2,//
                      @observa       = @3,//
                    @UsuarioAlta   = @4`,
                [
                    FolPag,
                    detallePagos[0].cveTpPgo,
                   movimiento[0].impTot,
                   observ ? observ : '',
                     UsuarioAlta ? UsuarioAlta  : ''
                ],
            );

            if (!resDetPagoApartado[0] || resDetPagoApartado[0].error) {
                const mensaje = resDetPagoApartado[0]?.mensaje || 'Error al crear el detalle del pago apartado';
                const estatus =
                    resDetPagoApartado[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                this.ApiJson.customeHttpExeption(mensaje, estatus);
            }

              // ============================================
                  // 5. INSERTAR DETALLE DE PAGO INICIAL
                  // ============================================

const resPagoApartadoInicial: Array<
                resApartadosMovtoResponse & {  }
            > = await entityManager.query(
                `EXEC [dbo].[SP_GV_AgregarPagoApartadoInicial]
                  @Cvebod        = @0,//
                      @SerMov       = @1, //
                      @CveMov       = @2,//
                      @Folmov        = @3,//
                      @NumPagosTotal        = @4,//
                      @UltFolPag     = @5, //
                      @ImpTotalApar    = @6,//
                     @ImpPagoProg      = @7,//
                  	@Login  = @8`,
                [
                    100,
                  serMov,
                  16,
                  FolMov,
                  pagos[0].numPagosTotal? pagos[0].numPagosTotal : 0,
                  FolPag,
                  movimiento[0].impTot,
                      pagos[0].impPagoProg,
                     login
                ],
            );

            if (!resPagoApartadoInicial[0] || resPagoApartadoInicial[0].error) {
                const mensaje = resPagoApartadoInicial[0]?.mensaje || 'Error al crear el pago del apartado Inicial';
                const estatus =
                    resPagoApartadoInicial[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                this.ApiJson.customeHttpExeption(mensaje, estatus);
            }



                          // ============================================
                  // 6. CAMBIAR EXISTENCIA DE LA BODEGA ORIGEN A LA BODEGA 100
                  // ============================================
            
const resCambioExiste: Array<
                resApartadosMovtoResponse & {  }
            > = await entityManager.query(
                `EXEC [dbo].[SP_GV_AgregarCambioExisteBodCien]
                @CveProd     = @0,//
                    	@CveBod      = @1, //
                     	@Cant      = @2,//
                     	@Login       = @3,//`,
                [
                    articulo[0].cveProd,
                  100,
                  articulo[0].cant,
                 login
                ],
            );

            if (!resCambioExiste[0] || resCambioExiste[0].error) {
                const mensaje = resCambioExiste[0]?.mensaje || 'Error al cambiar la existencia a la bodega 100';
                const estatus =
                    resCambioExiste[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
                this.ApiJson.customeHttpExeption(mensaje, estatus);
            }

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

   async obtenerApartadosGeneral(
  pagina: number,
  limit: number,
) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {

    // Calcular offset
    const offset = (pagina - 1) * limit;

    // Ejecutar SP con paginación
    const query = `
      EXEC SP_GV_ApartadosGeneral
        @Offset = @0,
        @Limit = @1
    `;

    const res: any[] = await queryRunner.manager.query(query, [
      offset,
      limit,
    ]);

    if (res[0]?.error) {
      this.ApiJson.customeHttpExeption(
        res[0].mensaje,
        res[0].estatus,
      );
    }

    return this.ApiJson.customeResSuccess(
      'Apartados Obtenidos',
      {
        pagina,
        limit,
        total: res[0]?.total || 0,
        data: res,
      },
    );

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

    // Liberar conexión
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }

  }
}


  async obtenerApartadoDetalle(
  Folmov: number,
  SerMov: string,
  pagina: number,
  limit: number,
) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // Calcular offset
    const offset = (pagina - 1) * limit;

    // Ejecutar SP con paginación
    const query = `
      EXEC SP_GV_ApartadosDetallePagos 
        @FolMov = @0,
        @SerMov = @1,
        @Offset = @2,
        @Limit = @3
    `;

    const res: any[] = await queryRunner.manager.query(query, [
      Folmov,
      SerMov,
      offset,
      limit,
    ]);

    if (res[0]?.error) {
      this.ApiJson.customeHttpExeption(
        res[0].mensaje,
        res[0].estatus,
      );
    }

    return this.ApiJson.customeResSuccess(
      'Detalle del Apartado',
      {
        pagina,
        limit,
        total: res[0]?.total || 0,
        data: res,
      },
    );

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

    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }

  }
}

}
