import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource, EntityManager } from 'typeorm';
import { CreateApartadoDto } from './dto/createApartado.dto';
import { SpResponse } from 'src/types/resJson';
import { TicketService } from 'src/globalServices/ticket-service/ticket-service-custom';
import { CreatePagoApartadoProgramadoDto } from './dto/pagoApartadoProgramado';
import { CancelarApartadoDto } from './dto/cancelacionApartado';
import { ValeService } from 'src/globalServices/vale-service/vale-service.custom';
import { PreDto } from './dto/apartado';
import { CambiotipoPagoApartadoDto } from './dto/cambiarPagoApartado';



interface returnIntento { 
    IntentoValido: boolean
    TotalIntentos:number
} 

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
    private readonly valeService: ValeService,
    private readonly dataSource: DataSource,
    private readonly manager: EntityManager
    
  ) { }

  public ApiJson = new resJsonClass();

async create(createApartadoDto: CreateApartadoDto) {

  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();


  try {


    const entityManager = queryRunner.manager;


    const payloadToken: payLoadToken =
      this.JwtServiceCustom.payloadToken as payLoadToken;



    const {
      CVECLI,
      observ,
      cvebodOrigen,
      serMov,
      articulo,
      movimiento,
      pagos,
      detallePagos,
      pre

    } = createApartadoDto;



    const usuario =
      payloadToken.Usuario ?? 'sin usuario';



    const CVE_MOV_APARTADO = 16;
    const BODEGA_APARTADO = 100;




    /* ================= VALIDACIONES ================= */


    if (!movimiento?.length) {

      throw new HttpException(
        'Debe existir al menos un movimiento',
        HttpStatus.BAD_REQUEST
      );

    }



    if (!articulo?.length) {

      throw new HttpException(
        'Debe existir al menos un artículo',
        HttpStatus.BAD_REQUEST
      );

    }



    if (cvebodOrigen === BODEGA_APARTADO) {

      throw new HttpException(
        'La bodega origen no puede ser la bodega 100',
        HttpStatus.BAD_REQUEST
      );

    }



    if (!CVECLI) {

      throw this.ApiJson.customeHttpExeption(
        'Ingresa el cliente',
        HttpStatus.BAD_REQUEST
      );

    }





    /* ================= VALIDAR EXISTENCIA ================= */


    for (const art of articulo) {


      const [resValidacion]: SpResponse =

        await entityManager.query(

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



      if(resValidacion?.error){


        throw this.ApiJson.customeHttpExeption(

          resValidacion.mensaje,
          resValidacion.estatus

        );


      }


    }


    /* ================= CREAR MOVIMIENTO ================= */


    const resMovtos:
      Array<resApartadosMovtoResponse & {
        Folmov:number;
        fecmov:string;
      }>

      = await entityManager.query(


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
        @CVECLI        = @28`,

      [

        BODEGA_APARTADO,
        CVE_MOV_APARTADO,
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

        usuario,

        0,

        observ ?? '',

        movimiento[0].impLet,

        0,
        0,
        0,
        0,
        0,
        0,

        '',

        usuario,

        payloadToken.UsuarioId ?? 0,

        1,

        CVECLI

      ]

    );




    if(!resMovtos[0] || resMovtos[0].error){


      throw this.ApiJson.customeHttpExeption(

        resMovtos[0]?.mensaje ??
        'Error al crear movimiento',

        resMovtos[0]?.estatus ??
        HttpStatus.INTERNAL_SERVER_ERROR

      );


    }



    const FolMov = resMovtos[0].Folmov;

    const fecMov = resMovtos[0].fecmov;




    /* ================= DETALLE NORMAL ================= */


    for(const art of articulo){



      const [resDetMov]: SpResponse =

        await entityManager.query(


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
          @IsApartado  = @12`,

        [

          BODEGA_APARTADO,

          FolMov,

          CVE_MOV_APARTADO,

          serMov,

          art.cveProd,

          art.cant,

          art.lisPre ?? 0,

          0,

          art.lisPre ?? 0,

          art.lisPre * art.cant,

          art.desProd,

          usuario,

          1

        ]

      );



      if(resDetMov?.error){


        throw this.ApiJson.customeHttpExeption(

          resDetMov.mensaje,

          resDetMov.estatus

        );


      }


    }

        /* =====================================================
       VALIDAR PRE Y AGREGAR DETALLE REV-EXT-000001
       (EL PRE ES UN SEGUNDO REGISTRO EN DETMOVTOS)
    ====================================================== */


    for (const art of articulo) {


      const [resPre] = await entityManager.query(

        `EXEC SP_GV_ValidarProductoPRE
            @CveProd = @0`,

        [
          art.cveProd
        ]

      );



     if (resPre?.TienePRE && Number(pre?.[0]?.idGar) !== 0) {

        /*
          Cuando tiene PRE y una garantia se agrega un segundo detalle:

          Producto normal:
          05-383-29254001

          +
          
          REV-EXT-000001
        */


        const importePRE =
          pre?.[0]?.idGar ??
          pre?.[0]?.impPre ??
          0;




        const [resDetPRE]: SpResponse =

          await entityManager.query(

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
            @IsApartado  = @12`,

          [

            BODEGA_APARTADO,
            FolMov,
            CVE_MOV_APARTADO,
            serMov,
            // Producto PRE
            'REV-EXT-000001',
            1,
            pre[0].impPre,
            0,
             pre[0].impPre,
           pre[0].impPre,
            `PERIODO DE REVISION EXTENDIDA DEL PRODUCTO ${art.cveProd}`,
            usuario,
            1

          ]

        );





        if(resDetPRE?.error){


          throw this.ApiJson.customeHttpExeption(

            resDetPRE.mensaje,

            resDetPRE.estatus

          );


        }






        /* ===========================
           INSERTAR GARANTIA PRE
        ============================ */


        const [resMovtosGar]: SpResponse =

          await entityManager.query(

          `EXEC SP_GV_Agregar_MovtosGar

            @CveBod = @0,
            @SerMov = @1,
            @FolMov = @2,
            @CveProd = @3,
            @IdGar = @4,
            @Finicial = @5,
            @CveMov = @6,
            @UsuarioAlta = @7`,

          [

            BODEGA_APARTADO,

            serMov,

            FolMov,


            art.cveProd,


            pre?.[0]?.idGar ?? null,


            fecMov,


            CVE_MOV_APARTADO,


            usuario

          ]

        );




        if(resMovtosGar?.error){


          throw this.ApiJson.customeHttpExeption(

            resMovtosGar.mensaje,

            resMovtosGar.estatus

          );


        }


      }


    }





    /* =====================================================
       CREAR PAGO DEL APARTADO
    ====================================================== */


    const resPagoApartado:

      Array<resApartadosMovtoResponse & {
        FolPag:number
      }>

      = await entityManager.query(


      `EXEC [dbo].[SP_GV_AgregarPagoApartado]

          @Cvebod        = @0,
          @SerMov        = @1,
          @CveMov        = @2,
          @Folmov        = @3,
          @CVECLI        = @4,
          @ImpTot        = @5,
          @Observa       = @6,
          @Login         = @7,
          @UsuarioAlta   = @8`,

      [

        BODEGA_APARTADO,

        serMov,

        CVE_MOV_APARTADO,

        FolMov,

        CVECLI,


        movimiento[0].impTot,//pAGO CON PRE SI ESE ES ELcaso


        observ ?? '',


        usuario,


        usuario

      ]

    );





    if(!resPagoApartado[0] || resPagoApartado[0].error){
         //  console.log(resPagoApartado)
      throw this.ApiJson.customeHttpExeption(

        resPagoApartado[0].mensaje,

        resPagoApartado[0].estatus

      );


    } 




    const FolPag =
      resPagoApartado[0].FolPag;
console.log('Folpag',FolPag)


if(FolPag === undefined){
     throw this.ApiJson.customeHttpExeption(

        'No se encontro un folpag',

        404

      );
}


    /* =====================================================
   DETALLE DEL PAGO APARTADO NORMAL
====================================================== */


const resDetPagoApartado:

Array<resApartadosMovtoResponse>

= await entityManager.query(


`EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]

    @FolPag      = @0,
    @CveTpPgo    = @1,
    @Imppag      = @2,
    @observa     = @3,
    @UsuarioAlta = @4`,

[

  FolPag,

  detallePagos?.[0]?.cveTpPgo ?? 0,

  pagos?.[0]?.impPagoProg ?? 0,

  observ ?? '',

  usuario

]

);



if(!resDetPagoApartado[0] ||
   resDetPagoApartado[0].error){

       console.log(resDetPagoApartado)
 throw this.ApiJson.customeHttpExeption(

    resDetPagoApartado[0]?.mensaje ??
    'Error al crear detalle pago apartado',

    resDetPagoApartado[0]?.estatus ??
    HttpStatus.INTERNAL_SERVER_ERROR

 );


}





/* =====================================================
   VALIDAR SI ALGUN ARTICULO TIENE PRE y una garantia, se agrega el registro del pago del pre en detPagos con el mismo folpag
====================================================== */


for(const art of articulo){


 const [resPre] = await entityManager.query(

   `EXEC SP_GV_ValidarProductoPRE
      @CveProd = @0`,

   [
     art.cveProd
   ]

 );



 if (resPre?.TienePRE && Number(pre?.[0]?.idGar) !== 0) {
     console.log(resPre)


   const resDetPagoPRE:

   Array<resApartadosMovtoResponse>

   = await entityManager.query(


   `EXEC [dbo].[SP_GV_AgregarDetallePagoApartado]

       @FolPag      = @0,
       @CveTpPgo    = @1,
       @Imppag      = @2,
       @observa     = @3,
       @UsuarioAlta = @4`,


   [

     FolPag,

      pre[0].cveTpPgoPre,

     pre?.[0]?.impPre ?? 0,


     'PAGO PRE',


     usuario


   ]

 );


 if(!resDetPagoPRE[0] ||
    resDetPagoPRE[0].error){

     console.log(resDetPagoPRE)
    throw this.ApiJson.customeHttpExeption(

      resDetPagoPRE[0]?.mensaje ??
      'Error al crear pago PRE',

      resDetPagoPRE[0]?.estatus ??
      HttpStatus.INTERNAL_SERVER_ERROR

    );


 }


 }


}
   
    /* =====================================================
       INSERTAR PAGO INICIAL DEL APARTADO
    ====================================================== */


    const resPagoApartadoInicial:

      Array<resApartadosMovtoResponse>

      = await entityManager.query(


      `EXEC [dbo].[SP_GV_AgregarPagoApartadoInicial]

          @Cvebod          = @0,
          @CvebodOrigen    = @1,
          @SerMov          = @2,
          @CveMov          = @3,
          @Folmov          = @4,
          @NumPagosTotal   = @5,
          @UltFolPag       = @6,
          @ImpTotalApar    = @7,
          @ImpPagoProg     = @8,
          @Login           = @9`,


      [

        BODEGA_APARTADO,

        cvebodOrigen,

        serMov,

        CVE_MOV_APARTADO,

        FolMov,


        pagos?.[0]?.numPagosTotal ?? 0,


        FolPag,


        movimiento[0].impTot,


        pagos?.[0]?.impPagoProg ?? 0,


        usuario

      ]

    );





    if(!resPagoApartadoInicial[0] ||
       resPagoApartadoInicial[0].error){

     console.log(resPagoApartadoInicial)
      throw this.ApiJson.customeHttpExeption(

        resPagoApartadoInicial[0]?.mensaje ??
        'Error al crear pago inicial apartado',

        resPagoApartadoInicial[0]?.estatus ??
        HttpStatus.INTERNAL_SERVER_ERROR

      );


    }






    /* =====================================================
       CAMBIAR EXISTENCIA DE TODOS LOS PRODUCTOS
       BODEGA ORIGEN -> BODEGA 100
    ====================================================== */


    for(const art of articulo){



      const resCambioExiste:

        Array<resApartadosMovtoResponse>

        = await entityManager.query(


        `EXEC [dbo].[SP_GV_AgregarCambioExisteBodCien]

            @CveProd = @0,
            @CveBod  = @1,
            @Cant    = @2,
            @Login   = @3`,


        [

          art.cveProd,

          cvebodOrigen,

          art.cant,

          usuario

        ]

      );





      if(!resCambioExiste[0] ||
         resCambioExiste[0].error){

       console.log(resCambioExiste)
        throw this.ApiJson.customeHttpExeption(

          resCambioExiste[0]?.mensaje ??
          'Error al cambiar existencia a bodega 100',

          resCambioExiste[0]?.estatus ??
          HttpStatus.INTERNAL_SERVER_ERROR

        );


      }


    }







    /* =====================================================
       GENERAR TICKET
    ====================================================== */


    const ticket = await this.ticketService.getTicket(

      entityManager,

      BODEGA_APARTADO,

      FolMov,

      CVE_MOV_APARTADO,

      serMov,

      FolPag,

      false,
      false,

     // false

    );

         console.log(ticket)






    /* =====================================================
       CONFIRMAR TRANSACCION
    ====================================================== */


    await queryRunner.commitTransaction();





    return this.ApiJson.customeResSuccess(

      'Apartado Creado Exitosamente',

      {

        ticket

      }

    );






  } catch(err:any) {
    if (err instanceof HttpException) {
      throw err;
    }

    throw new InternalServerErrorException(
      `Error ${err['mensaje'] || 'Ocurrió un error interno'}`
    );

  } finally {



    if(!queryRunner.isReleased){

      await queryRunner.release();

    }



  }


}
  async obtenerApartadoDetalle(
    Folmov: number,
    SerMov: string
  ) {

    //const queryRunner = this.dataSource.createQueryRunner();

    //await queryRunner.connect();
    //await queryRunner.startTransaction();

    try {

      const query = `
      EXEC [dbo].[SP_GV_ApartadosDetallePagos]
        @FolMov = @0,
        @SerMov = @1
    `;

      const res: any[] = await this.manager.query(query, [
        Folmov,
        SerMov
      ]);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No se encontró el detalle del apartado',
          HttpStatus.BAD_REQUEST
        )
      }




      return this.ApiJson.customeResSuccess(
        'Detalle de pagos obtenidos',
        {

          res
        },
      );

    } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
  }

  async obtenerCancelacionApartadoAC(){
    //const queryRunner = this.dataSource.createQueryRunner();

    //await queryRunner.connect();
    //await queryRunner.startTransaction();

    try {

      
      const query = `SELECT  [CveMot]
      ,[DesMot]
      ,[Habilitado]
      ,[GeneraNC]
      ,[PorcPenal]
      ,[UsuarioAlta]
      ,[FechaAlta]
      ,[UsuarioMod]
      ,[FechaMod]
      ,[UsuarioBaja]
      ,[FechaBaja]
      ,[CveEstatus]
  FROM [SICAVI].[dbo].[VW_GV_CatMotCancApar_AC]`;

      const res: any[] = await this.manager.query(query);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No se encontraron tipos  movimientos de cancelacion activos ',
          404
        )
      }




      return this.ApiJson.customeResSuccess(
       'Tipo movimientos cancelacion obtenidos',
        {

          res
        },
      );

      
    } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
  }
  async obtenerCancelacionApartadoBA(){
     //const queryRunner = this.dataSource.createQueryRunner();

    //await queryRunner.connect();
    //await queryRunner.startTransaction();
    try {
       const query = `SELECT [CveMot]
      ,[DesMot]
      ,[Habilitado]
      ,[GeneraNC]
      ,[PorcPenal]
      ,[UsuarioAlta]
      ,[FechaAlta]
      ,[UsuarioMod]
      ,[FechaMod]
      ,[UsuarioBaja]
      ,[FechaBaja]
      ,[CveEstatus]
  FROM [SICAVI].[dbo].[VW_GV_CatMotCancApar_BA]`;

      const res: any[] = await this.manager.query(query);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No se encontraron tipos  movimientos de cancelacion no activos ',
          404
        )
      }

      return this.ApiJson.customeResSuccess(
        'Tipo movimientos cancelacion obtenidos',
        {

          res
        },
      );
      
    } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
  }

async obtenerApartadosVigentesByBodega(
    CVEBOD: number,
  BUSCADOR: string,
  pagina: number,
  limit: number,
){
  try {
       const query = `
      EXEC [dbo].[SP_GV_ObtenerApartadosVigentesByBodegaOrigen]
        @CVEBOD = @0,
        @BUSCADOR = @1
    `;

     const res: any[] = await this.manager.query(query, [
      CVEBOD,
     BUSCADOR || '', // por si viene null o undefined
    ]);

     if (res.length === 0) {
      this.ApiJson.customeHttpExeption('No hay apartados vigentes', 404);
    }

    //CALCULO DEL TOTAL DE REGISTROS
const formattedRes = res.map(item => ({
  ...item,
}));

    // PAGINACIÓN
    const total = formattedRes.length;
    const totalPginas = Math.ceil(total / limit);
    const start = (pagina - 1) * limit;
    const data = formattedRes.slice(start, start + limit);

    return this.ApiJson.customeResSuccess(
      res[0]?.mensaje || 'Consulta exitosa',
      {
        pagina,
        limit,
        total,
        totalPginas,
        data,
      },
    );
  } catch (error:any) {
        if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
}
async obtenerApartadosPagadosByBodega(
    CVEBOD: number,
  BUSCADOR: string,
  pagina: number,
  limit: number,
){
    try {
           const query = `
      EXEC SP_GV_ObtenerApartadosPagadosByBodegaOrigen
        @CVEBOD = @0,
        @BUSCADOR = @1
    `;

     const res: any[] = await this.manager.query(query, [
      CVEBOD,
     BUSCADOR || '', // por si viene null o undefined
    ]);

    

     if (res.length === 0) {
      this.ApiJson.customeHttpExeption('No hay Apartados Pagados', 404);
    }
      


    //CALCULO DEL TOTAL DE REGISTROS
const formattedRes = res.map(item => ({
  ...item,
}));

    // PAGINACIÓN
    const total = formattedRes.length;
    const totalPginas = Math.ceil(total / limit);
    const start = (pagina - 1) * limit;
    const data = formattedRes.slice(start, start + limit);

    return this.ApiJson.customeResSuccess(
      res[0]?.mensaje || 'Consulta exitosa',
      {
        pagina,
        limit,
        total,
        totalPginas,
        data,
      },
    );
  } catch (error:any) {
      if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
}
async obtenerApartadosCanceladosByBodega(
    CVEBOD: number,
  BUSCADOR: string,
  pagina: number,
  limit: number,
){
     try {
           const query = `
      EXEC SP_GV_ObtenerApartadosCanceladosByBodegaOrigen
        @CVEBOD = @0,
        @BUSCADOR = @1
    `;
         const res: any[] = await this.manager.query(query, [
      CVEBOD,
     BUSCADOR || '', // por si viene null o undefined
    ]);

      if (res.length === 0) {
      this.ApiJson.customeHttpExeption('No hay Apartados Cancelados', 404);
    }


    // Formateamos la fecha y los decimales para que sean strings consistentes
    const formattedRes = res.map(item => ({
      ...item,
    }));

    // PAGINACIÓN
    const total = formattedRes.length;
    const totalPginas = Math.ceil(total / limit);
    const start = (pagina - 1) * limit;
    const data = formattedRes.slice(start, start + limit);

    return this.ApiJson.customeResSuccess(
      res[0]?.mensaje || 'Consulta exitosa',
      {
        pagina,
        limit,
        total,
        totalPginas,
        data,
      },
    );

  } catch (error:any) {
      if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
}

async validarLiquidacionApartado(
   SerMov:string,
   FolMov: number,
   NumPago:number,
  ImpPagoProg:number,

){
  try {

     const query = `
      EXEC SP_GV_ValidarLiquidacionApartado
        @CveBod = @0,
    @SerMov = @1,
    @CveMov = @2,
    @FolMov = @3,
    @NumPago = @4,
    @ImpPagoProg =@5
    `;

       const res: any[] = await this.manager.query(query, [
    100, SerMov,16, FolMov, NumPago, ImpPagoProg]);

     if (res.length === 0) {
      this.ApiJson.customeHttpExeption('No hay Apartados Cancelados', HttpStatus.BAD_REQUEST);
    }

    return this.ApiJson.customeResSuccess(
      res[0]?.mensaje || 'Consulta exitosa',
      {
        res,
      },
    );

    
  } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
}

async obtenerTicketReimpresionPagoApartado(
  //  CveBodDes: number,
  FolMov: number,
  CveMov: number,
  SerMov: string,
  FolPag: number,
  //isPago:boolean
){

  
   // const queryRunner = this.dataSource.createQueryRunner();
  //await queryRunner.connect();
  //await queryRunner.startTransaction();
   try {

       const entityManager = this.manager;
  const ticket = await this.ticketService.getTicket(
entityManager,100, FolMov,CveMov,SerMov,FolPag, true, false//isPago,//false
    );


    return{
      ticket
    }

   } catch (error:any) {
       if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );

   }
}

async obtenerValesReimpresionCancelacionApartado(
  FolMov: number,
      SerMovOrg: string,
){
    //const queryRunner = this.dataSource.createQueryRunner();
  //await queryRunner.connect();
  //await queryRunner.startTransaction();
  try {
        const entityManager = this.manager;
  const vale = await this.valeService.getVale(
entityManager,100, FolMov, 16, SerMovOrg, true
    );

 return{
      vale
    }
    
  } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }

}
/*   async obtenerApartadosPendientes(
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

  } */

/*       async obtenerApartadosPagados(
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
  } */

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
     // cvebod,
      serMov,
      folMov,
      //cveMov,
      CVECLI,
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
      @CVECLI = @4,
      @ImpTot = @5,
      @Observa = @6,
      @Login = @7,
      @UsuarioAlta = @8`,
      [
        100,
        serMov,
        16,
        folMov,
        CVECLI,
        impPagoProg,
        observ ?? '',
      payloadToken.Usuario ?? 'sin usuario',//  payloadToken.Usuario ?? 'sin usuario' //  'IARCI'
        payloadToken.Usuario ?? 'sin usuario'// payloadToken.Usuario ?? 'sin usuario' //  'IARCI'
      ]
    );

    if (!resPagoApartado?.[0] || resPagoApartado[0].error) {
      //console.log(resPagoApartado[0])
      //throw new Error(resPagoApartado?.[0]?.mensaje || 'Error al crear pago');
         this.ApiJson.customeHttpExeption(
           resPagoApartado?.[0]?.mensaje || 'Error al crear pago',
               HttpStatus.BAD_REQUEST,
        );
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
      //throw new Error(resDetPagoApartado?.[0]?.mensaje || 'Error al crear detalle');
       this.ApiJson.customeHttpExeption(
           resDetPagoApartado?.[0]?.mensaje || 'Error al crear detalle del pago',
               HttpStatus.BAD_REQUEST,
        );
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
        100,
        serMov,
        16,
        folMov,
        numPago,
        impPagoProg
      ]
    );

    const result = validacion?.[0];
      console.log(result)
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
    
      @SerMov = @0,
      @FolMov = @1,
      @NumPago = @2,
      @FolPagNuevo = @3,
      @ImpPagoProg = @4,
      @Login = @5`,
      [
      
        serMov,
        folMov,
        numPago,
        FolPagNuevo,
        impPagoProg,
        payloadToken.Usuario ?? 'sin usuario' //'IARCI'//payloadToken.Usuario ?? 'sin usuario'
      ]
    );

    if (!resFinal?.[0] || resFinal[0].error) {
      //console.log(resFinal[0])
     // throw new Error(resFinal?.[0]?.mensaje || 'Error al procesar pago');
       this.ApiJson.customeHttpExeption(
            resFinal?.[0]?.mensaje || 'Error al realizar',
               HttpStatus.BAD_REQUEST,
        );
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
      100,
      folMov,
      16,
      serMov,
      FolPagNuevo,
      false,
      //true,
      esLiquidacion
    );

    return {
      error: 0,
      FolPagNuevo,
      esLiquidacion,
      mensaje: mensajeFinal,
      ticket
    }; 

/*     return this.ApiJson.customeResSuccess(
        mensajeFinal,
        {
          FolPagNuevo,
            esLiquidacion,
          ticket
        },
      ); */

  } catch (err: any) {
     if (err instanceof HttpException) {
      throw err;
    }

    throw new InternalServerErrorException(
      `Error ${err['mensaje'] || 'Ocurrió un error interno'}`
    );

  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
}

async cancelarApartado(cancelarApartado:CancelarApartadoDto){
       const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
    try {
        const entityManager = queryRunner.manager;
       const {
          cvebodOrg,
          serMovOrg,
          folMov,
          tipCancel,
          cvecli,
          cveProd,
          usuarioBaja,
          refLlave
          
    } = cancelarApartado;

        const isIntentoValido : returnIntento = await entityManager.query(
      `EXEC [dbo].[SP_ValidarIntentosCancelacionApartado]
      @CvebodDes = @0,
      @SerMov = @1,
      @CveMov = @2,
       @CveProd = @3`,
      [
        100,
        serMovOrg,
        16,
        cveProd
      ]
    );

   console.log(isIntentoValido[0].IntentoValido)

    if(!isIntentoValido[0].IntentoValido){
     
         this.ApiJson.customeHttpExeption(
            'No se puede cancelar, el apartado eccede el numero de intentos',
               HttpStatus.BAD_REQUEST,
        );
    }

     // =====================================================
    // 1. CREAR ENCABEZADO
    // =====================================================
    const resCancelacionApartado = await entityManager.query(
      `EXEC [dbo].[SP_GV_CancelarApartadoVigente]
        @CvebodOrg  = @0,
         @SerMovOrg = @1,
      @FolMov = @2,
           @TipCancel = @3,
      @CVECLI = @4,
      @UsuarioBaja = @5,
      @RefLlave = @6`,
      [
        cvebodOrg,
        serMovOrg,
        folMov,
        tipCancel,
        cvecli,
        usuarioBaja,
        refLlave
      ]
    );
        console.log(resCancelacionApartado[0]);
    if (!resCancelacionApartado?.[0] || resCancelacionApartado[0].error) {

 this.ApiJson.customeHttpExeption(
    resCancelacionApartado?.[0]?.mensaje || 'Error al cancelar apartado',
    resCancelacionApartado?.[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR
  );
}

      // 6. COMMIT
    // =====================================================
    await queryRunner.commitTransaction();


    // Vale
    // =====================================================
    let vale = {};

if (
  resCancelacionApartado[0].TotalVales > 0 &&
  resCancelacionApartado[0].TotalDineroVales > 0
) {
  vale = await this.valeService.getVale(
    entityManager,
    100,
    folMov,
    16,
    serMovOrg,
    false
  );
}

return {
  resCancelacionApartado,
  vale
};
    


    }  catch (err: any) {

   if (err instanceof HttpException) {
      throw err;
    }

    throw new InternalServerErrorException(
      `Error ${err['mensaje'] || 'Ocurrió un error interno'}`
    );
}

}


async cambiarTipoPago(cambiotipoPagoApartadoDto: CambiotipoPagoApartadoDto){
    const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
       const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;

          const {
        folMov,
        serMov,
        cveTipPag,
        folpag,
         numPago,
         refLlave
    } = cambiotipoPagoApartadoDto;

     const res = await entityManager.query(
      `EXEC  [dbo].[SP_GV_CambioTipoPagoApartado]  
    @FolMov = @0,
    @SerMov =  @1,
	@FolPag = @2 ,
	@CveTipPag = @3,
	@NumPago = @4,
	@UsuarioMod = @5,
    @RefLlave = @6`,
      [
        folMov,
        serMov,
        folpag,
        cveTipPag,
        numPago,
       payloadToken.Usuario ?? 'sin usuario',//  payloadToken.Usuario ?? 'sin usuario' //  'IARCI'
        refLlave
    
      ]
    );
       console.log(res)
    if (!res?.[0] || res[0].error) {
      this.ApiJson.customeHttpExeption(
            res.mensaje || 'Error al crear existencia',
            res.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
          );
    }

      // ============================================
      // 6. COMMIT DE LA TRANSACCIÓN
      // ============================================
      await queryRunner.commitTransaction();

     return this.ApiJson.customeResSuccess(
  res[0].mensaje || 'El tipo de pago se cambio de manera exitosa',
  []
);
  } catch (err: any) {
      // Rollback en caso de error
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }

      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Error ${err['message'] || 'Ocurrió un error interno'}`,
      );
  }
}

async obtenerPagoByFolPag(

            Folmov: number,
               FolPag: number,
    SerMov: string,

        
  ) {


    try {

      const query = `
     EXEC [dbo].[SP_GV_ObtenerPagoByFolPag]

    @FolMov = @0,
    @SerMov = @1,
    @FolPag = @2
    `;

      const res: any[] = await this.manager.query(query, [
        Folmov,
        SerMov,
        FolPag
      ]);

      if (res.length == 0) {
        return this.ApiJson.customeHttpExeption(
          'No se encontró el detalle del apartado',
          HttpStatus.BAD_REQUEST
        )
      }




      return this.ApiJson.customeResSuccess(
        'Pago obtenido',
        {

          res
        },
      );

    } catch (error:any) {
     if (error instanceof HttpException) {
      throw error;
    }

    throw new InternalServerErrorException(
      `Error ${error['message'] || 'Ocurrió un error interno'}`,
    );
  }
  }








}
