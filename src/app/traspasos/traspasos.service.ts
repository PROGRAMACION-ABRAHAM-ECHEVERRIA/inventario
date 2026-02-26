import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource } from 'typeorm/data-source/DataSource';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';

@Injectable()
export class TraspasosService {
    constructor(private readonly  dataSource: DataSource, private readonly manager: EntityManager){}
        public ApiJson = new resJsonClass(); 



 /* #region  TraspasosMovimiento */
  // Paulina May
  //Creacion 26/02/2026
    async obtenerMovimientoByTraspaso( ){

  try {

    let query = `SELECT  [CVEMOV]
      ,[DESMOV]
      ,[TIPMOV]
      ,[FECHAREAL]
      ,[UsuarioAlta]
      ,[FechaAlta]
      ,[LOGIN]
      ,[CveEstatus]
  FROM [SICAVI].[dbo].[VW_GV_TRASPASOS]`
   let res = await this.manager.query(query);
      if( res.length == 0){
         this.ApiJson.customeHttpExeption('Movimientos por entrada no disponible', HttpStatus.NOT_FOUND)
        }
   

    
   return this.ApiJson.customeResSuccess(
       'Consulta exitosa',
      {
        res
      },
    );
  } catch (err) {
    if(err instanceof HttpException){
      throw err;
    }
    throw new InternalServerErrorException(
       `Error ${err['message'] || 'Ocurrió un error interno'}`,
    )
    
  }
}
    /* #endregion */ 
}
