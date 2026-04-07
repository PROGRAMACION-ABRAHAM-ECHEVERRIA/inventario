import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { DataSource, EntityManager } from 'typeorm';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { SpResponse } from 'src/types/resJson';
interface response { 
  error: boolean; 
  mensaje: string; 
  estatus: number;  
};  


@Injectable()
export class EntradasService {
  constructor(private readonly  dataSource: DataSource, private readonly jwtServiceCustom: JwtServiceCustom, private readonly manager: EntityManager){}
    public ApiJson = new resJsonClass(); 
 async crearEntrada(createEntradaDto: CreateEntradaDto) {
  const queryRunner = this.dataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const entityManager = queryRunner.manager;

    const payloadToken: payLoadToken =
      this.jwtServiceCustom.payloadToken as payLoadToken;

    /* ================= VALIDACIONES CLAVE ================= */

    if (!createEntradaDto.movimiento?.length) {
      throw new HttpException(
        'Debe existir al menos un movimiento',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!createEntradaDto.articulo?.length) {
      throw new HttpException(
        'Debe existir al menos un artículo',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!createEntradaDto.existencias?.length) {
      throw new HttpException(
        'Debe existir al menos una existencia',
        HttpStatus.BAD_REQUEST,
      );
    }

   if(createEntradaDto.tipMov !== 3){
  throw new HttpException(
        'El tipo de movimiento deber ser una entrada',
        HttpStatus.BAD_REQUEST,
      );
   }
    const movimiento = createEntradaDto.movimiento[0];
    const existencia = createEntradaDto.existencias[0];

    /* ================= INSERTAR MOVIMIENTO ================= */
   
    const resMovtos: Array<
      response & { Folmov: number; fecmov: string; ImpSub : number}
    > = await entityManager.query(
      `EXEC [dbo].[SP_GV_AgregarMovTosBool2]
        @CVEBOD        = @0,
        @CveMov        = @1,
        @SerMov        = @2,
        @OrdCom        = @3,
        @NumDoc        = @4,
        @CveProvCli    = @5,
        @DiasCred      = @6,
        @ImpMov        = @7,
        @ImpDes        = @8,
        @PorcDesc      = @9,
        @ImpFle        = @10,
        @ImpSub        = @11,
        @ImpIva        = @12,
        @PorcIva       = @13,
        @ImpTot        = @14,
        @Login         = @15,
        @CveVen        = @16,
        @Observ        = @17,
        @ImpLet        = @18,
        @Facturada     = @19,
        @Cancelada     = @20,
        @Devuelto      = @21,
        @Afectado      = @22,
        @NumDias       = @23,
        @RepEntregada  = @24,
        @Garantia      = @25,
        @UsuarioAlta   = @26,
        @UsuarioId     = @27`,
      [
        createEntradaDto.cveBod,
        createEntradaDto.cveMov,
        createEntradaDto.serMov,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
       movimiento.impTot, //impsub si es un articulo es el valor del articulo y si son muchos es el total
        0,
        0,
        movimiento.impTot,
        createEntradaDto.usuarioAlta,
        0,
        movimiento.observ ?? '',
        movimiento.impLet ?? '',
        0,
        0,
        0,
        0,
        0,
        0,
        '',
        createEntradaDto.usuarioAlta,
        payloadToken.UsuarioId,
      ],
    );

    if (!resMovtos[0] || resMovtos[0].error) {
      this.ApiJson.customeHttpExeption(
        resMovtos[0]?.mensaje || 'Error al crear el movimiento',
        resMovtos[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const FolMov = resMovtos[0].Folmov;
    const fecMov = resMovtos[0].fecmov;
    const ImpSub = resMovtos[0].ImpSub

    /* ================= DETALLE MOVIMIENTO ================= */

    for (const articulo of createEntradaDto.articulo) {

        const [validarLisPre]: {LISPRE6: number, LISPRE5: number}[] = await entityManager.query(`SELECT LISPRE6, LISPRE5 FROM CATPROD WHERE Cveprod = @0`, [articulo.cveProd]); 

        const lispre = (validarLisPre.LISPRE6 != 0) ? validarLisPre.LISPRE6 : validarLisPre.LISPRE5  ;   

        if(lispre  != articulo.preUni ){
          this.ApiJson.customeHttpExeption(`El precio de lista6 (${lispre}) del producto ${articulo.cveProd} no coincide con el precio registrado en el catálogo (${articulo.preUni}).`, HttpStatus.BAD_REQUEST); 
        }; 


      const [resDetMovtos]: SpResponse = await entityManager.query(
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
          createEntradaDto.cveBod,
          FolMov,
          createEntradaDto.cveMov,
          createEntradaDto.serMov,
          articulo.cveProd,
          articulo.cant,
          articulo.lisPre,
          0.00,
          articulo.preUni,
          articulo.preUni, //impsub
          articulo.desProd,
          createEntradaDto.usuarioAlta,
        ],
      );

      if (resDetMovtos?.error) {
        this.ApiJson.customeHttpExeption(
          resDetMovtos.mensaje || 'Error al crear detalle de movimiento',
          resDetMovtos.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
        );
       
      }
    }

    /* ================= EXISTENCIAS (ORDEN CORRECTO) ================= */

    for (const articulo of createEntradaDto.articulo) {
      const [resExiste]: SpResponse = await entityManager.query(
        `EXEC [dbo].[SP_GV_AgregarExisteBool2]
          @CVEPROD     = @0,
          @CVEBOD      = @1,
          @EXISTE      = @2,
          @FECINV      = @3,
          @ULTCOS      = @4,
          @COSPRO      = @5,
          @EXIFIS      = @6,
          @UsuarioAlta = @7`,
        [
          articulo.cveProd,
          createEntradaDto.cveBod,
          articulo.cant,
          existencia.fecInv,
          0,
          0,
          0,
          createEntradaDto.usuarioAlta,
        ],
      );

      if (resExiste?.error) {
        this.ApiJson.customeHttpExeption(
          resExiste.mensaje || 'Error al crear existencia',
          resExiste.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
        );
             
      }
    }

    await queryRunner.commitTransaction();

    return this.ApiJson.customeResSuccess(
      'Entrada Creada Exitosamente',
      {
        FolMov,
        fecMov,
        usuarioAlta: createEntradaDto.usuarioAlta
      },
    );
  } catch (err: any) {
    console.log(err)
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw err instanceof HttpException
      ? err
      : new InternalServerErrorException(
          err?.message || 'Ocurrió un error interno',
        );

        
  } finally {
    if (!queryRunner.isReleased) {
      await queryRunner.release();
    }
  }
}


async ObteneTotalProdMov(
  CVEBOD: number,
 pagina :number,
  limit :number,
) {
  try {

    const query = `
      EXEC dbo.SP_GV_ObteneTotalProdMov @CVEBOD = @0
    `;

    const res: any[] = await this.manager.query(query, [CVEBOD]);

  if (res[0].error) {
        this.ApiJson.customeHttpExeption(res[0].mensaje, res[0].estatus); 
      };
          // Función para formatear Date a SQL Server sin conversión de zona horaria
    const formatDateToSQL = (date: Date | string | null): string | null => {
      if (!date) return null;
      let d: Date;
      if (typeof date === 'string') {
        d = new Date(date);
      } else {
        d = date;
      }
      const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
             `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
    };
        //Formateamos la fecha
    const formattedRes = res.map(item => ({
      ...item,
      FechaAlta: formatDateToSQL(item.FechaAlta),
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
  } catch (err: any) {
    if (err instanceof HttpException) throw err;

    throw new InternalServerErrorException(
      `Error ${err?.message || 'Ocurrió un error interno'}`,
    );
  }
}

async ObtenerTotalProdMovSearch(CVEBOD:number, SEARCH:string,  pagina :number,
  limit :number){

  try {
    

        const query = `
      EXEC dbo.SP_GV_ObteneTotalProdMovSearch @CVEBOD = @0,@SEARCH = @1
    `;

    const res: any[] = await this.manager.query(query, [CVEBOD, SEARCH]);

      if (res.length == 0) {
        this.ApiJson.customeHttpExeption('No se encontro ', 404); 
      };

      // Función para formatear Date a SQL Server sin conversión de zona horaria
    const formatDateToSQL = (date: Date | string | null): string | null => {
      if (!date) return null;
      let d: Date;
      if (typeof date === 'string') {
        d = new Date(date);
      } else {
        d = date;
      }
      const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
             `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
    };
        //Formateamos la fecha
    const formattedRes = res.map(item => ({
      ...item,
      FechaAlta: formatDateToSQL(item.FechaAlta),
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


  } catch (err:any) {
    console.log(err)
        if (err instanceof HttpException) {
      throw err;
    }

    throw new InternalServerErrorException(
      `Error ${err['mensaje'] || 'Ocurrió un error interno'}`
    );
  }
}
 async ObteneProdByMov(CVEBOD: number, CVEMOV: number, FOLMOV: number, SERMOV:string){
  try { 
    console.log(CVEBOD); 
    console.log(CVEMOV); 
    console.log(FOLMOV); 
    console.log(SERMOV); 
      const query = `
      EXEC dbo.SP_GV_ObteneProdByMov
        @CVEBOD = @0,
        @CVEMOV = @1,
        @FOLMOV = @2,
        @SERMOV = @3
    `;
       const res: SpResponse = await this.manager.query(query, [CVEBOD, CVEMOV, FOLMOV, SERMOV]);
     
     if (res[0].error) {
        this.ApiJson.customeHttpExeption(res[0].mensaje, res[0].estatus); 
      };
     return this.ApiJson.customeResSuccess(res[0].mensaje, res); 

  } catch (err: any) {

     if(err instanceof HttpException){
      throw err;
    }
    throw new InternalServerErrorException(
      
       `Error ${err ['mensaje'] || 'Ocurrió un error interno'}`,
       
    );
  }
 } 

  async ObteneProdByMovParams(CVEBOD: number | null, CVEMOV: number | null, FOLMOV: number | null, SERMOV: string | null){
  try {  

    if(!SERMOV){ 
      SERMOV = ' '
    } 
      const query = `
     EXEC [dbo].[SP_GV_ObteneProdByMov]
        @CVEBOD = @0,
        @CVEMOV = @1,
        @FOLMOV = @2,
        @SERMOV = @3
    `;
       const res: SpResponse = await this.manager.query(query, [CVEBOD, CVEMOV, FOLMOV, SERMOV]);
     
     if (res[0].error) {
      console.log(res[0].error)
        this.ApiJson.customeHttpExeption(res[0].mensaje, res[0].estatus); 
        console.log(res[0].error)
      };
     return this.ApiJson.customeResSuccess(res[0].mensaje, res); 

  } catch (err: any) {

    console.log(err);

     if(err instanceof HttpException){
      throw err;
    }
    throw new InternalServerErrorException(
      
       `Error ${err['mensaje'] || 'Ocurrió un error interno'}`,
       
    );
  }
 }


async ObteneTotalProdMovFilter(
  CVEBOD: number | null,
  SERMOV: string | null,
  DESMOV: string | null,
  DESBOD: string | null,
  FECHAALTA: string | null,
  pagina: number = 1,
  limit: number = 10,
) {
  try {
    //console.log('Parámetros recibidos:', { CVEBOD, SERMOV, DESMOV, DESBOD, FECHAALTA, pagina, limit });

    const query = `
      EXEC dbo.SP_GV_ObteneTotalProdMovFilter
        @CVEBOD = @0,
        @SERMOV = @1,
        @DESMOV = @2,
        @DESBOD = @3,
        @FECHAALTA = @4
    `;

    const res: any[] = await this.manager.query(query, [
      CVEBOD ?? null,
      SERMOV ?? null,
      DESMOV ?? null,
      DESBOD ?? null,
      FECHAALTA ?? null,
    ]);

    //console.log('Resultado bruto del SP:', res);

    if (!res || res.length === 0) {
      return this.ApiJson.customeResSuccess('No se encontraron registros', []);
    }

    // Función para formatear Date a SQL Server sin conversión de zona horaria
    const formatDateToSQL = (date: Date | string | null): string | null => {
      if (!date) return null;
      let d: Date;
      if (typeof date === 'string') {
        d = new Date(date);
      } else {
        d = date;
      }
      const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
             `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
    };

    //Formateamos la fecha
    const formattedRes = res.map(item => ({
      ...item,
      FechaAlta: formatDateToSQL(item.FechaAlta),
    }));

    // PAGINACIÓN
  const total = formattedRes.length;
    const totalPginas = Math.ceil(total / limit);
    const start = (pagina - 1) * limit;
    const data = formattedRes.slice(start, start + limit);
    
    //  Retornamos paginado con total
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

  } catch (err: any) {
    console.log('Error atrapado en el servicio:', err);

    if (err instanceof HttpException) {
      throw err;
    }

    throw new InternalServerErrorException(
      `Error ${err['mensaje'] || 'Ocurrió un error interno'}`
    );
  }
}


}
