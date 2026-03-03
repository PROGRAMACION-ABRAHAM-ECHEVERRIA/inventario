import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { instanceToInstance } from 'class-transformer';
import { retry } from 'rxjs';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource } from 'typeorm/data-source/DataSource';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { CreateTraspasoDto } from './dto/create-traspaso.dto';
import { payLoadToken } from 'src/types/types';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { SpResponse } from 'src/types/resJson';
import { AceptarTraspaso } from './dto/aceptar-traspaso.dto';

interface response {
  error: boolean;
  mensaje: string;
  estatus: number;
};
@Injectable()
export class TraspasosService {
  constructor(private readonly dataSource: DataSource, private readonly jwtServiceCustom: JwtServiceCustom, private readonly manager: EntityManager) { }
  public ApiJson = new resJsonClass();

  /* #region  CrearTraspaso */
  // Paulina May
  //Creacion 02/03/2026
  async createMovimientoTraspaso(createTraspasoDto: CreateTraspasoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken =
        this.jwtServiceCustom.payloadToken as payLoadToken;
      /* ================= VALIDACIONES CLAVE ================= */

      if (!createTraspasoDto.movimiento?.length) {
        throw new HttpException(
          'Debe existir al menos un movimiento',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!createTraspasoDto.articulo?.length) {
        throw new HttpException(
          'Debe existir al menos un artículo',
          HttpStatus.BAD_REQUEST,
        );
      }


      if (createTraspasoDto.tipMov !== 6) {
        throw new HttpException(
          'El tipo de movimiento deber ser un traspaso',
          HttpStatus.BAD_REQUEST,
        );
      }

      const movimiento = createTraspasoDto.movimiento[0];
      /* ================= INSERTAR MOVIMIENTO ================= */
      const resMovtos: Array<
        response & { Folmov: number; fecmov: string; ImpSub: number }
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
        @UsuarioId     = @27,
        @CveBodOrig = @28,
        @CveBodDes = @29
        @CveEstatusParam =@30`,
        [
          createTraspasoDto.cveBod,
          createTraspasoDto.cveMov,
          createTraspasoDto.serMov,
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
          createTraspasoDto.usuarioAlta,
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
          createTraspasoDto.usuarioAlta,
          payloadToken.UsuarioId,
          createTraspasoDto.cveBod,
          createTraspasoDto.CveBodDes,
          'TPSD' // Estatus por defaul  traspaso  pendiente sucursal destino

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

      /* ================= DETALLE MOVIMIENTO ================= */
      for (const articulo of createTraspasoDto.articulo) {
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
            createTraspasoDto.cveBod,
            FolMov,
            createTraspasoDto.cveMov,
            createTraspasoDto.serMov,
            articulo.cveProd,
            createTraspasoDto.cant,
            articulo.lisPre,
            0.00,
            articulo.preUni,
            articulo.preUni, //impsub
            articulo.desProd,
            createTraspasoDto.usuarioAlta,
          ],
        );

        if (resDetMovtos?.error) {
          this.ApiJson.customeHttpExeption(
            resDetMovtos.mensaje || 'Error al crear detalle de movimiento',
            resDetMovtos.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
          );

        }
      }

      await queryRunner.commitTransaction();
      return this.ApiJson.customeResSuccess(
        'Traspaso Creado Exitosamente',
        {
          FolMov,
          fecMov,
          usuarioAlta: createTraspasoDto.usuarioAlta
        },
      );

    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error ${err['message'] || 'Ocurrio un error interno'}`
      )
    }
  }

  /* #endregion */


  /* #region  CrearTraspaso */
  // Paulina May
  //Creacion 02/03/2026
  async aceptarMovimientoTraspaso(aceptarTraspaso: AceptarTraspaso) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const entityManager = queryRunner.manager;

      /* ================= ACEPTAR TRASPASO================= */
      for (const articulo of aceptarTraspaso.articulo!) {
        const [resAceptarTraspaso]: SpResponse = await entityManager.query(
          `EXEC [dbo].[SP_GV_AceptarTraspaso]
                  @CveBod   = @0,
                    @CveBodDes = @1,
                    @CveMov = @2,
                    @SerMov  = @3,
                    @FolMov =@4`
          [
          aceptarTraspaso.cveBod ?? '',
          aceptarTraspaso.CveBodDes ?? '',
          aceptarTraspaso.cveMov ?? '',
          aceptarTraspaso.serMov ?? '',
          aceptarTraspaso.Folmov ?? ''
          ]
        );
        if (resAceptarTraspaso?.error) {
          this.ApiJson.customeHttpExeption(
            resAceptarTraspaso.mensaje || 'Error al crear detalle de movimiento',
            resAceptarTraspaso.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
          );

        }
      }

      await queryRunner.commitTransaction();
      return this.ApiJson.customeResSuccess(
        'Traspaso Creado Exitosamente',
        {
          aceptarTraspaso
        }
      );
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error ${err['message'] || 'Ocurrio un error interno'}`
      )


    }

  }

  /* #endregion */


  /* #region  TraspasosMovimiento */
  // Paulina May
  //Creacion 26/02/2026
  async obtenerMovimientoByTraspaso() {

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
      if (res.length == 0) {
        this.ApiJson.customeHttpExeption('Movimientos por entrada no disponible', HttpStatus.NOT_FOUND)
      }



      return this.ApiJson.customeResSuccess(
        'Consulta exitosa',
        {
          res
        },
      );
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error ${err['message'] || 'Ocurrió un error interno'}`,
      )

    }
  }
  /* #endregion */




}
