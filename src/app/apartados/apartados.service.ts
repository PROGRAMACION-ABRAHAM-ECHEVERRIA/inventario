import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource, EntityManager } from 'typeorm';
import { CreateApartadoDto } from './dto/createApartado.dto';
import { SpResponse } from 'src/types/resJson';
import { TicketService } from 'src/globalServices/ticket-service/ticket-service-custom';
import { CreatePagoApartadoProgramadoDto } from './dto/pagoApartadoProgramado';



interface resApartadosMovtoResponse {
  error: boolean;
  mensaje: string;
  estatus: number;
}

@Injectable()
export class ApartadosService {

  constructor(
    private JwtServiceCustom: JwtServiceCustom,
    private readonly ticketService: TicketService,
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
        CVECLI,
        observ,
        cvebodOrigen,
        serMov,
        //login,
        //UsuarioAlta,
        articulo,
        movimiento,
        pagos,
        detallePagos

      } = createApartadoDto;
      // console.log(createApartadoDto);

      /* ================= VALIDACIONES ================= */

      if (!movimiento?.length)
        throw new HttpException('Debe existir al menos un movimiento', HttpStatus.BAD_REQUEST);

      if (!articulo?.length)
        throw new HttpException('Debe existir al menos un artículo', HttpStatus.BAD_REQUEST);


      if (cvebodOrigen === 100)
        throw new HttpException('La bodega origen  no puede ser la bodega de venta de apartados', HttpStatus.BAD_REQUEST);


      /* ================= VALIDAR EXISTENCIAS DEL ARTICULO ================= */

      for (const art of articulo) {

        const [resValidacion]: SpResponse = await entityManager.query(
          `EXEC SP_GV_ValidarIfExisProdInBod
          @CVEBOD = @0,
          @CVEPROD = @1,
          @CANTIDAD = @2`,
          [
            cvebodOrigen,
            art.cveProd,
            art.cant
          ]
        );

        if (resValidacion?.error) {

          throw this.ApiJson.customeHttpExeption(

            resValidacion.mensaje,
            resValidacion.estatus
          );
        }

      }


      // validando el CveProvCli
      if (!CVECLI) {
        this.ApiJson.customeHttpExeption(
          'Ingresa el cliente',
          HttpStatus.BAD_REQUEST,
        );
      }
      /* 
            let [findProv] = await entityManager.query(
              `SELECT 1 FROM [dbo].[CATPROV] WHERE CVEPROV = @0`,
              [cveProvCli],
            );
      
            if (!findProv) {
              this.ApiJson.customeHttpExeption(
                'No existe el proveedor',
                HttpStatus.NOT_FOUND,
              );
            } */








      // ============================================
      // 1. INSERTAR MOVIMIENTO
      // ============================================
      const resMovtos: Array<
        resApartadosMovtoResponse & { Folmov: number; fecmov: string }
      > = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarMovTosBool2]
            @CVEBOD        = @0,
            @CveMov        = @1, 
            @SerMov        = @2,
            @OrdCom        = @3,
            @NumDoc        = @4,
            @DiasCred      = @5,
            @ImpMov        = @6,
            @ImpDes        = @7,
            @PorcDesc      = @8,
            @ImpFle        = @9,
            @ImpSub        = @10,
            @ImpIva        = @11,
            @PorcIva       = @12,
            @ImpTot        = @13,
            @Login         = @14,
            @CveVen        = @15,
            @Observ        = @16,
            @ImpLet        = @17,
            @Facturada     = @18,
            @Cancelada     = @19,
            @Devuelto      = @20,
            @Afectado      = @21,
            @NumDias       = @22,
            @RepEntregada  = @23,
            @Garantia      = @24,
            @UsuarioAlta   = @25,
            @UsuarioId     = @26,
            @IsApartado    = @27, 
            @CVECLI = @28`,
        [
          100,
          16,
          serMov,
          0,
          0,
          0,
          movimiento[0].impTot,
          0,
          0,
          0,
          movimiento[0].impTot,
          0,
          0,
          movimiento[0].impTot,
            payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario', //  'IARCI'
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
          payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario', // 'IARCI'
          payloadToken.UsuarioId ? payloadToken.UsuarioId : 0,    //  112
          1,
          CVECLI
        ],
      );

      if (!resMovtos[0] || resMovtos[0].error) {
        //console.log('Movtos','',resMovtos)
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
                        @UsuarioAlta = @11, 
                        @IsApartado = @12`,
          [
            100,
            FolMov,
            16,
            serMov,
            art.cveProd,
            art.cant,
            art.lisPre ? art.lisPre : 0,
            0,
            art.lisPre,
            movimiento[0].impTot,
            art.desProd,
            payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario', //   'IARCI' 
            1
          ],
        );



        if (resDetmovtos?.error) {
          // console.log('DetMovtos','',resDetmovtos)
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
                      @Cvebod        = @0,
                      @SerMov       = @1, 
                      @CveMov       = @2,
                      @Folmov        = @3,
                      @CVECLI        = @4,
                      @ImpTot   = @5,
                      @Observa      = @6,
                      @Login        = @7,
                      @UsuarioAlta        = @8`,
        [
          100,
          serMov,
          16,
          FolMov,
          CVECLI,
          movimiento[0].impTot,
          observ ? observ : '',
         payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario', //   'IARCI'
          payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario' //   'IARCI'
        ],
      );


      if (!resPagoApartado[0] || resPagoApartado[0].error) {
        // console.log('ResPago Apartado',resPagoApartado)
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
        resApartadosMovtoResponse & {}
      > = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]
                      @FolPag        = @0,
                      @CveTpPgo      = @1, 
                      @Imppag      = @2,
                      @observa       = @3,
                    @UsuarioAlta   = @4`,
        [
          FolPag,
          detallePagos[0].cveTpPgo,
          pagos[0].impPagoProg,
          observ ? observ : '',
         payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario' ,// 'IARCI'
        ],
      );



      if (!resDetPagoApartado[0] || resDetPagoApartado[0].error) {
        // console.log('DetPagoApartado','',resDetPagoApartado)
        const mensaje = resDetPagoApartado[0]?.mensaje || 'Error al crear el detalle del pago apartado';
        const estatus =
          resDetPagoApartado[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
        this.ApiJson.customeHttpExeption(mensaje, estatus);
      }

      // ============================================
      // 5. INSERTAR DETALLE DE PAGO INICIAL
      // ============================================

      const resPagoApartadoInicial: Array<
        resApartadosMovtoResponse & {}
      > = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarPagoApartadoInicial]
                  @Cvebod        = @0,
                  @CvebodOrigen = @1,
                      @SerMov       = @2, 
                      @CveMov       = @3,
                      @Folmov        = @4,
                      @NumPagosTotal        = @5,
                      @UltFolPag     = @6, 
                      @ImpTotalApar    = @7,
                     @ImpPagoProg      = @8,
                  	@Login  = @9`,
        [
          100,
          cvebodOrigen,
          serMov,
          16,
          FolMov,
          pagos[0].numPagosTotal ? pagos[0].numPagosTotal : 0,
          FolPag,
          movimiento[0].impTot,
          pagos[0].impPagoProg,
          payloadToken.Usuario ? payloadToken.Usuario : 'sin usuario' ,//   'IARCI'
        ],
      );



      if (!resPagoApartadoInicial[0] || resPagoApartadoInicial[0].error) {
        //console.log('PagoApartadoInicial', '', resPagoApartadoInicial)
        const mensaje = resPagoApartadoInicial[0]?.mensaje || 'Error al crear el pago del apartado Inicial';
        const estatus =
          resPagoApartadoInicial[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
        this.ApiJson.customeHttpExeption(mensaje, estatus);
      }



      // ============================================
      // 6. CAMBIAR EXISTENCIA DE LA BODEGA ORIGEN A LA BODEGA 100
      // ============================================

      const resCambioExiste: Array<
        resApartadosMovtoResponse & {}
      > = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarCambioExisteBodCien]
                @CveProd     = @0,
                @CveBod      = @1,
                @Cant      = @2,
                @Login       = @3`,
        [
          articulo[0].cveProd,
          cvebodOrigen,
          articulo[0].cant,
          payloadToken.Usuario ?? 'sin usuario' // 'IARCI'
        ],
      );


      if (!resCambioExiste[0] || resCambioExiste[0].error) {
        //console.log('CambioExiste','',resCambioExiste)
        const mensaje = resCambioExiste[0]?.mensaje || 'Error al cambiar la existencia a la bodega 100';
        const estatus =
          resCambioExiste[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
        this.ApiJson.customeHttpExeption(mensaje, estatus);
      }



      await queryRunner.commitTransaction();
      const ticket = await this.ticketService.getTicket(
        entityManager,
        100,
        FolMov,
        16,
        serMov,
        FolPag,
        false,
        false
      );

      return this.ApiJson.customeResSuccess(
        'Apartado Creado Exitosamente',
        {
          ticket
        },
      );

    } catch (error: any) {

      console.log('ERROR ORIGINAL => ', error);

      try {

        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }

      } catch (rollbackError) {

        // console.log('ROLLBACK ERROR => ', rollbackError);

      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error ${error['message'] || 'Ocurrió un error interno'}`
      );
    } finally {
      // Siempre liberar el queryRunner
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }

    }

  }


  async obtenerApartadosPagados(
    pagina: number,
    limit: number,
  ) {

    try {

      const res: any[] = await this.dataSource.query(`
      EXEC SP_GV_ApartadosPagados
    `);

      const inicio = (pagina - 1) * limit;
      const fin = inicio + limit;

      const dataPaginada = res.slice(inicio, fin);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No hay Apartados Pagados',
          404
        )
      }

      return this.ApiJson.customeResSuccess(
        'Apartados Obtenidos',
        {
          pagina,
          limit,
          total: res.length,
          totalPaginas: Math.ceil(res.length / limit),
          data: dataPaginada,
        },
      );

    } catch (error: any) {

      throw new InternalServerErrorException(
        `Error ${error['message'] || 'Ocurrió un error interno'}`,
      );

    }
  }

  async obtenerApartadoDetalle(
    Folmov: number,
    SerMov: string
  ) {

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const query = `
      EXEC [dbo].[SP_GV_ApartadosDetallePagos]
        @FolMov = @0,
        @SerMov = @1
    `;

      const res: any[] = await queryRunner.manager.query(query, [
        Folmov,
        SerMov
      ]);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No se encontró el detalle del apartado',
          404
        )
      }




      return this.ApiJson.customeResSuccess(
        'Apartados Obtenidos',
        {

          res
        },
      );

    } catch (error: any) {

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

  async obtenerApartadosPendientes(
    pagina: number,
    limit: number,
  ) {


    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const query = `EXEC [dbo].[SP_GV_ApartadosPendientes] `;

      const res: any[] = await queryRunner.manager.query(query);
      const inicio = (pagina - 1) * limit;
      const fin = inicio + limit;

      const dataPaginada = res.slice(inicio, fin);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No hay Apartados Pendientes',
          404
        )
      }

      return this.ApiJson.customeResSuccess(
        'Apartados Pendientes Obtenidos',
        {
          pagina,
          limit,
          total: res.length,
          totalPaginas: Math.ceil(res.length / limit),
          data: dataPaginada,
        },
      );

    } catch (error: any) {

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


async createPagoApartadoProgramado(
  createPagoApartadoProgramadoDto: CreatePagoApartadoProgramadoDto
) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
     const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;

    const {
      cvebod,
      serMov,
      folMov,
      cveMov,
      cveProvCli,
      numPago,
      cveTpPgo,
      impPagoProg,
      observ
    } = createPagoApartadoProgramadoDto;

    // =====================================================
    // 1. CREAR ENCABEZADO
    // =====================================================
    const resPagoApartado = await entityManager.query(
      `EXEC [dbo].[SP_GV_AgregarPagoApartado]
      @Cvebod = @0,
      @SerMov = @1,
      @CveMov = @2,
      @Folmov = @3,
      @CveProCli = @4,
      @ImpTot = @5,
      @Observa = @6,
      @Login = @7,
      @UsuarioAlta = @8`,
      [
        cvebod,
        serMov,
        cveMov,
        folMov,
        cveProvCli,
        impPagoProg,
        observ ?? '',
      payloadToken.Usuario ?? 'sin usuario',//  payloadToken.Usuario ?? 'sin usuario' //  'IARCI'
        payloadToken.Usuario ?? 'sin usuario'// payloadToken.Usuario ?? 'sin usuario' //  'IARCI'
      ]
    );

    if (!resPagoApartado?.[0] || resPagoApartado[0].error) {
     // console.log(resPagoApartado[0])
      throw new Error(resPagoApartado?.[0]?.mensaje || 'Error al crear pago');
    }

    const FolPagNuevo = resPagoApartado[0].FolPag;

    // =====================================================
    // 2. DETALLE
    // =====================================================
    const resDetPagoApartado = await entityManager.query(
      `EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]
      @FolPag = @0,
      @CveTpPgo = @1,
      @Imppag = @2,
      @Observa = @3,
      @UsuarioAlta = @4`,
      [
        FolPagNuevo,
        cveTpPgo,
        impPagoProg,
        observ ?? '',
         payloadToken.Usuario ?? 'sin usuario'//'IARCI'//  payloadToken.Usuario ?? 'sin usuario'
      ]
    );

    if (!resDetPagoApartado?.[0] || resDetPagoApartado[0].error) {
      //console.log(resDetPagoApartado[0])
      throw new Error(resDetPagoApartado?.[0]?.mensaje || 'Error al crear detalle');
    }

    // =====================================================
    // 3. VALIDACIÓN LIQUIDACIÓN
    // =====================================================
    const validacion = await entityManager.query(
      `EXEC [dbo].[SP_GV_ValidarLiquidacionApartado]
      @CveBod = @0,
      @SerMov = @1,
      @CveMov = @2,
      @FolMov = @3,
      @NumPago = @4,
      @ImpPagoProg = @5`,
      [
        cvebod,
        serMov,
        cveMov,
        folMov,
        numPago,
        impPagoProg
      ]
    );

    const result = validacion?.[0];
    //  console.log(result)
    if (!result) {
      throw new Error('No se pudo validar la liquidación');
    }

  
    if (result.Mensaje && result.EsLiquidacion === false) {
      throw new Error(result.Mensaje);
    }

    const esLiquidacion = result.EsLiquidacion === 1;
   // const totalLiquidacion = Number(result.TotalLiquidacion ?? 0);

    // =====================================================
    // 4. DECISIÓN DE FLUJO
    // =====================================================
    let spFinal: string;
    let mensajeFinal: string;

    if (esLiquidacion) {


      spFinal = 'SP_GV_AgregarPagoApartadoProgramadoLiquidación';
      mensajeFinal = 'Pago procesado como LIQUIDACIÓN';

    } else {
      spFinal = 'SP_GV_AgregarPagoApartadoProgramado';
      mensajeFinal = 'Pago procesado como PAGO PROGRAMADO';
    }

    // =====================================================
    // 5. EJECUTAR SP FINAL
    // =====================================================
    const resFinal = await entityManager.query(
      `EXEC [dbo].[${spFinal}]
      @CveBod = @0,
      @SerMov = @1,
      @CveMov = @2,
      @FolMov = @3,
      @NumPago = @4,
      @FolPagNuevo = @5,
      @ImpPagoProg = @6,
      @Login = @7`,
      [
        cvebod,
        serMov,
        cveMov,
        folMov,
        numPago,
        FolPagNuevo,
        impPagoProg,
        payloadToken.Usuario ?? 'sin usuario' //'IARCI'//payloadToken.Usuario ?? 'sin usuario'
      ]
    );

    if (!resFinal?.[0] || resFinal[0].error) {
      //console.log(resFinal[0])
      throw new Error(resFinal?.[0]?.mensaje || 'Error al procesar pago');
    }
//console.log(FolPagNuevo)
    // =====================================================
    // 6. COMMIT
    // =====================================================
    await queryRunner.commitTransaction();

    // =====================================================
    // 7. TICKET
    // =====================================================
    const ticket = await this.ticketService.getTicket(
      entityManager,
      cvebod,
      folMov,
      cveMov,
      serMov,
      FolPagNuevo,
      false,
      esLiquidacion
    );

    return {
      error: 0,
      FolPagNuevo,
      esLiquidacion,
      mensaje: mensajeFinal,
      ticket
    };

  } catch (error: any) {

    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }

    throw new InternalServerErrorException(
      error?.message || 'Error interno del sistema'
    );

  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
}
/*  async createPagoApartadoProgramado( createPagoApartadoProgramadoDto: CreatePagoApartadoProgramadoDto){
      const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

  try {
        const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;
          const {
        cvebod,
        serMov,
        folMov,
        cveMov,
        cveProvCli,
        numPago,
        cveTpPgo,
        impPagoProg,
        observ
      } = createPagoApartadoProgramadoDto;
    // =====================================================
// 1. VALIDAR LIQUIDACIÓN
// =====================================================
const validacion = await entityManager.query(
  `EXEC [dbo].[SP_GV_ValidarLiquidacionApartado]
  @CveBod = @0,
  @SerMov = @1,
  @CveMov = @2,
  @FolMov = @3,
  @NumPago = @4,
  @ImpPagoProg = @5`,
  [
    cvebod,
    serMov,
    cveMov,
    folMov,
    numPago,
    impPagoProg
  ],
);

//  LOG IMPORTANTE
console.log('RESPUESTA SP VALIDACIÓN LIQUIDACIÓN =>', validacion);

const result = validacion?.[0];

if (!result) {
  console.log('VALIDACIÓN VACÍA =>', validacion);
  throw new Error('No se pudo validar la liquidación');
}

const esLiquidacion = result.EsLiquidacion === 1;
const totalLiquidacion = result.TotalLiquidacion;
if(esLiquidacion){
  console.log('Tiene liquidacion')
  console.log('INTERPRETADO =>', {
  esLiquidacion,
  totalLiquidacion,
  recibido: impPagoProg
});
}else{
  console.log('No tiene liquidacion')


console.log('INTERPRETADO =>', {
  esLiquidacion,
  totalLiquidacion,
  recibido: impPagoProg
});
}


    
  } catch (error:any) {
      throw new InternalServerErrorException(
        error?.message || 'Error interno del sistema'
      );
  }finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
}  */

  /* async createPagoApartadoProgramado(
    createPagoApartadoProgramadoDto: CreatePagoApartadoProgramadoDto
  ) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;

      const {
        cvebod,
        serMov,
        folMov,
        cveMov,
        cveProvCli,
        numPago,
        cveTpPgo,
        impPagoProg,
        observ
      } = createPagoApartadoProgramadoDto;
    console.log(numPago)
      // =====================================================
      // 1. VALIDAR LIQUIDACIÓN
      // =====================================================
      const validacion = await entityManager.query(
        `EXEC [dbo].[SP_GV_ValidarLiquidacionApartado]
        @CveBod = @0,
        @SerMov = @1,
        @CveMov = @2,
        @FolMov = @3,
        @NumPago = @4,
        @ImpPagoProg = @5`,
        [
          cvebod,
          serMov,
          cveMov,
          folMov,
          numPago,
          impPagoProg
        ],
      );

      const result = validacion?.[0];

      if (!result) {
        throw new Error('No se pudo validar la liquidación');
      }

      const esLiquidacion = result.EsLiquidacion === 1;
      const totalLiquidacion = result.TotalLiquidacion;

      // =====================================================
      // 2. VALIDACIÓN DE IMPORTE
      // =====================================================
      if (esLiquidacion && Number(impPagoProg) !== Number(totalLiquidacion)) {

             console.log('Validacion','',validacion)
        throw new Error(
          `El importe no coincide con la liquidación calculada. Debe ser: ${totalLiquidacion}`
        );
      }

      // =====================================================
      // 3. INSERTAR ENCABEZADO
      // =====================================================
      const resPagoApartado = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarPagoApartado]
        @Cvebod = @0,
        @SerMov = @1,
        @CveMov = @2,
        @Folmov = @3,
        @CveProCli = @4,
        @ImpTot = @5,
        @Observa = @6,
        @Login = @7,
        @UsuarioAlta = @8`,
        [
          cvebod,
          serMov,
          cveMov,
          folMov,
          cveProvCli,
          impPagoProg,
          observ ?? '',
         'IARCI',    //payloadToken.Usuario ?? 'sin usuario',   
          'IARCI' //payloadToken.Usuario ?? 'sin usuario'
        ],
      );

      if (!resPagoApartado[0] || resPagoApartado[0].error) {
           console.log('PagoApartado','',resPagoApartado[0])
        throw new Error(resPagoApartado[0]?.mensaje || 'Error al crear pago');
      }

      const FolPagNuevo = resPagoApartado[0].FolPag;
      console.log(FolPagNuevo)

      // =====================================================
      // 4. INSERTAR DETALLE
      // =====================================================
      const resDetPagoApartado = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]
        @FolPag = @0,
        @CveTpPgo = @1,
        @Imppag = @2,
        @observa = @3,
        @UsuarioAlta = @4`,
        [
          FolPagNuevo,
          cveTpPgo,
          impPagoProg,
          observ ?? '',
         'IARCI'   //payloadToken.Usuario ?? 'sin usuario'
        ],
      );

      if (!resDetPagoApartado[0] || resDetPagoApartado[0].error) {
          console.log('DetApartado','',resDetPagoApartado[0])
        throw new Error(
          resDetPagoApartado[0]?.mensaje || 'Error al crear detalle pago'
        );
      }

      // =====================================================
      // 5. SP FINAL (PROGRAMACIÓN O LIQUIDACIÓN)
      // =====================================================
      const spFinal = esLiquidacion
        ? 'SP_GV_AgregarPagoApartadoProgramadoLiquidación'
        : 'SP_GV_AgregarPagoApartadoProgramado';

      const resFinal = await entityManager.query(
        `EXEC [dbo].[${spFinal}]
        @CveBod = @0,
        @SerMov = @1,
        @CveMov = @2,
        @FolMov = @3,
        @FolPagNuevo = @4,
        @NumPago = @5,
        @ImpPagoProg = @6,
        @Login = @7`,
        [
          100,
          serMov,
          16,
          folMov,
          FolPagNuevo,
          numPago,
          impPagoProg,
          'IARCI' //payloadToken.Usuario ?? 'sin usuario'
        ],
      );

      if (!resFinal[0] || resFinal[0].error) {
          console.log('resFinal',resFinal)
        throw new Error(
          resFinal[0]?.mensaje || 'Error al procesar pago programado'
        );
      }

      // =====================================================
      // 6. GENERAR TICKET
      // =====================================================

      // =====================================================
      // 7. COMMIT
      // =====================================================

      await queryRunner.commitTransaction();
      const ticket = await this.ticketService.getTicket(
        entityManager,
        100,
        folMov,
        16,
        serMov,
        FolPagNuevo,
        false,
        esLiquidacion
      );

      return {
        error: 0,
        FolPagNuevo,
        esLiquidacion,
        mensaje: esLiquidacion
          ? 'Pago procesado como LIQUIDACIÓN'
          : 'Pago procesado como PAGO PROGRAMADO',

        ticket
      };

    } catch (error: any) {
       console.log('error','',error)
      try {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
        }
      } catch { }

      throw new InternalServerErrorException(
        error?.message || 'Error interno del sistema'
      );

    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  } */

}
