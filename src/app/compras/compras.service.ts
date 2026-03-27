import {HttpException, HttpStatus, Injectable, InternalServerErrorException} from '@nestjs/common';
import { ArticulosComprasDto, CreateCompraDto } from './dto/create-compra.dto';
import { UpdateEncabezadoFactura } from './dto/update-compra.dto';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { DataSource, EntityManager } from 'typeorm';
import { resJsonClass } from 'src/utils/resJsonClass';
import { SpResponse } from 'src/types/resJson';

interface resCompraMovtoResponse {
  error: boolean;
  mensaje: string;
  estatus: number;
}

@Injectable()
export class ComprasService {
  constructor(
    private JwtServiceCustom: JwtServiceCustom,
    private readonly dataSource: DataSource,
    private readonly manager: EntityManager,
  ) {}

  public ApiJson = new resJsonClass();

  /* #region PostCompra */
  // Abraham Echeverria
  // 17/02/2026
  // Endpoint para dar de alta a una compra
  async create(CreateCompraDto: CreateCompraDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      // Abrimos la conexión y transacción
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const entityManager = queryRunner.manager;
      const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;

      const porIva = !CreateCompraDto.IVA ? 0 : 16;

      await this.validarDescuentoGlobal(
        CreateCompraDto.PorcDesc,
        CreateCompraDto.ImpTot,
        CreateCompraDto.ImpSub,
        CreateCompraDto.Articulos,
        porIva,
      );

      // validando el CveProvCli
      if (!CreateCompraDto.CVEPROVCLI) {
        this.ApiJson.customeHttpExeption(
          'Ingresa un proveedor',
          HttpStatus.BAD_REQUEST,
        );
      }

      let [findProv] = await entityManager.query(
        `SELECT 1 FROM [dbo].[CATPROV] WHERE CVEPROV = @0`,
        [CreateCompraDto.CVEPROVCLI],
      );

      if (!findProv) {
        this.ApiJson.customeHttpExeption(
          'No existe el proveedor',
          HttpStatus.NOT_FOUND,
        );
      }

      let [findNumdoc] = await entityManager.query(
        `SELECT 1 FROM [dbo].[MOVTOS] WHERE NumDoc = @0`,
        [CreateCompraDto.NumDoc],
      );

      if (findNumdoc) {
        this.ApiJson.customeHttpExeption(
          'El folio de la factura ya existe',
          HttpStatus.AMBIGUOUS,
        );
      }

      // ============================================
      // 1. Crear productos
      // ============================================

      for (const articulo of CreateCompraDto.Articulos) {
        // armando CVEPROD
        const CVEPROD = `${CreateCompraDto.CVEBOD}-${articulo.lote}-${articulo.Generado}`;

        const [resProducto]: SpResponse = await entityManager.query(
          ` EXEC [dbo].[SP_GV_AgregarProductoCompra]  
            @CVEPROD = @0 ,
            @DESPROD = @1,
            @CVEUNI = @2, 
            @CVEFAM = @3,
            @CVEMAR = @4,
            @OBSERVA = @5, 
            @LISPRE1 = @6,
            @LISPRE2 = @7,
            @LISPRE6 = @8,
            @UsuarioAlta = @9 
          `,
          [
            CVEPROD, // @0
            articulo.DesProd, // @1
            articulo.CveUni, // @2
            articulo.CveFam, // @3
            articulo.CveMar, // @4
            articulo.ObservaProd ?? '', // @5
            articulo.Lispre1, // @6 LISPRE1
            articulo.Lispre2, // @6 LISPRE2
            articulo.PreUni, // @7 LISPRE6
            CreateCompraDto.UsuarioAlta, // @8 UsuarioAlta
          ],
        );

        if (resProducto?.error) {
          const mensaje = resProducto.mensaje || 'Error al crear el producto';
          const estatus =
            resProducto.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
          this.ApiJson.customeHttpExeption(mensaje, estatus);
        }
      }

      // ============================================
      // 2. INSERTAR MOVIMIENTO
      // ============================================
      const resMovtos: Array<
        resCompraMovtoResponse & { Folmov: number; fecmov: string }
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
          @UsuarioId = @27`,
        [
          CreateCompraDto.CVEBOD,
          1,
          CreateCompraDto.SerMov,
          0,
          CreateCompraDto.NumDoc,
          CreateCompraDto.CVEPROVCLI,
          0,
          CreateCompraDto.ImpTot,
          CreateCompraDto.ImpDes,
          CreateCompraDto.PorcDesc,
          0,
          CreateCompraDto.ImpSub,
          CreateCompraDto.ImpIva,
          porIva,
          CreateCompraDto.ImpTot,
          CreateCompraDto.UsuarioAlta,
          0,
          CreateCompraDto.Observ ? CreateCompraDto.Observ : '',
          CreateCompraDto.ImpLet,
          0,
          0,
          0,
          0,
          0,
          0,
          '',
          CreateCompraDto.UsuarioAlta,
          payloadToken.UsuarioId,
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
      // 3. INSERTAR DETALLES DE MOVIMIENTO
      // ============================================
      for (const articulo of CreateCompraDto.Articulos) {
        const CVEPROD = `${CreateCompraDto.CVEBOD}-${articulo.lote}-${articulo.Generado}`;
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
            CreateCompraDto.CVEBOD,
            FolMov,
            CreateCompraDto.CveMov,
            CreateCompraDto.SerMov,
            CVEPROD,
            articulo.Cant,
            articulo.Lispre1 != 0 && articulo.Lispre2 != 0
              ? 0
              : articulo.Lispre1 != 0
                ? 1
                : 2,
            articulo.PorcDesc,
            articulo.PreUni,
            articulo.importeTotal,
            articulo.DesProd,
            CreateCompraDto.UsuarioAlta,
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
      // 4. INSERTAR DETALLES DE COMPRA
      // ============================================

      for (const articulo of CreateCompraDto.Articulos) {
        const CVEPROD = `${CreateCompraDto.CVEBOD}-${articulo.lote}-${articulo.Generado}`;

        const [resDetCompra]: SpResponse = await entityManager.query(
          `EXEC [dbo].[SP_GV_AgregarDetalleCompra]
            @FolMov = @0,  
            @CveBod = @1,
            @SerMov = @2,  
            @CveMov = @3, 
            @FecCom = @4, 
            @Lote   = @5 , 
            @CveProdFac = @6, 
            @CveProd = @7, 
            @PreUni = @8, 
            @Cant = @9, 
            @ImpTot = @10, 
            @Descuento = @11, 
            @UsuarioAlta = @12`,
          [
            FolMov,
            CreateCompraDto.CVEBOD,
            CreateCompraDto.SerMov,
            CreateCompraDto.CveMov,
            articulo.fecInv,
            articulo.lote,
            articulo.CveProdFac,
            CVEPROD,
            articulo.PreUni,
            articulo.Cant,
            articulo.importeTotal,
            articulo.PorcDesc,
            CreateCompraDto.UsuarioAlta,
          ],
        );

        if (resDetCompra?.error) {
          const mensaje =
            resDetCompra.mensaje || 'Error al crear detalle de movimiento';
          const estatus =
            resDetCompra.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
          this.ApiJson.customeHttpExeption(mensaje, estatus);
        }
      }

      // ============================================
      // 5. Modificar Existencias
      // ============================================
      for (const articulo of CreateCompraDto.Articulos) {
        const CVEPROD = `${CreateCompraDto.CVEBOD}-${articulo.lote}-${articulo.Generado}`;

        const [resExiste]: SpResponse = await entityManager.query(
          `EXEC [dbo].[SP_GV_AgregarExisteCompra]
            @CVEPROD     = @0,
            @CVEBOD      = @1,
            @EXISTE      = @2,
            @FECINV      = @3,
            @ULTCOS      = @4,
            @COSPRO      = @5,
            @EXIFIS      = @6,
            @UsuarioAlta = @7`,
          [
            CVEPROD,
            CreateCompraDto.CVEBOD,
            articulo.Cant,
            articulo.fecInv,
            0,
            0,
            0,
            CreateCompraDto.UsuarioAlta,
          ],
        );

        if (resExiste?.error) {
          this.ApiJson.customeHttpExeption(
            resExiste.mensaje || 'Error al crear existencia',
            resExiste.estatus || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // ============================================
      // 6. COMMIT DE LA TRANSACCIÓN
      // ============================================
      await queryRunner.commitTransaction();

      return this.ApiJson.customeResSuccess('Compra creada exitosamente', {
        NumDoc: CreateCompraDto.NumDoc,
        FolMov,
        fecMov,
        CveBod: CreateCompraDto.CVEBOD,
        CveMov: CreateCompraDto.CveMov,
        Sermov: CreateCompraDto.SerMov,
        UsuarioAlta: CreateCompraDto.UsuarioAlta,
        totalArticulos: CreateCompraDto.Articulos.length,
      });
    } catch (error) {
      // Rollback en caso de error
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
  /* #endregion */

  /* #region GetAllCompras */
  // Abraham Echeverria
  // 17/02/2026
  async getAllCompras() {
    try {
      const query = `SELECT [SerMov]
      ,[CveMov]
      ,[Observ]
      ,[DESMOV]
      ,[FolMov]
      ,[CveBod]
      ,[DESBOD]
      ,[NumDoc]
      ,[CVEPROV]
      ,[NOMPROV]
      ,[TotalCantidadProductos]
      ,[TotalImporte]
      ,[UsuarioAlta]
      ,[FechaAlta]
      FROM [SICAVI].[dbo].[VW_GV_ObtenerCompras]
      ORDER BY FechaAlta DESC;`;
      const getCompras = await this.manager.query(query);

      return this.ApiJson.customeResSuccess('Compras Obtenidas', getCompras);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error ${error['message'] || 'Ocurrió un error interno'}`,
      );
    }
  }
  /* #endregion */

  /* #region getComprasDetalle */
  // Abraham Echeverria
  // 17/02/2026
  async getComprasDetalle(
    CveBod: number,
    FolMov: number,
    CveMov: number,
    SerMov: string,
  ) {
    try {
      const query = `
        SP_GV_ObtenerDetalleDeCompra @CveBod = @0, @FolMov = @1, @CveMov = @2, @SerMov = @3
      `;
      const getCompras = await this.manager.query(query, [
        CveBod,
        FolMov,
        CveMov,
        SerMov,
      ]);  

      return this.ApiJson.customeResSuccess('Compras Obtenidas', getCompras);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error ${error['message'] || 'Ocurrió un error interno'}`,
      );
    }
  }
  /* #endregion */

  /* #region validarDescuentoGlobal */
  // Abraham Echeverria
  // 17/02/2026
  async validarDescuentoGlobal(
  porDescuentoGlobal: number,
  imptot: number,
  subImpTot: number,
  productos: ArticulosComprasDto[],
  PorIva?: number,
) {

  const descuentoGlobal = porDescuentoGlobal / 100;
  const IVA = PorIva ? PorIva / 100 : 0;

  let subtotalCalculado = 0;

  productos.forEach((producto) => {

    const subtotalProducto = producto.Cant * producto.PreUni;

    // descuento por producto
    const descProducto = subtotalProducto * (producto.PorcDesc / 100);

    const subtotalConDescProducto = subtotalProducto - descProducto;

    // descuento global
    const descGlobal = subtotalConDescProducto * descuentoGlobal;

    const subtotalFinalProducto = subtotalConDescProducto - descGlobal;

    subtotalCalculado += subtotalFinalProducto;

  });

  const totalConIVA = subtotalCalculado * (1 + IVA);

  const totalCalculado = Math.round(totalConIVA * 100) / 100;

  if (totalCalculado !== imptot) {
    return this.ApiJson.customeHttpExeption(
      'El total no coincide con la sumatoria de los productos',
      HttpStatus.BAD_REQUEST,
    );
  }
}
  /* #endregion */

  /* #region getComprasDetalleTotales */ 
  // Abraham Echeverria 
  // 24/02/2026
  async getComprasDetalleTotales(
    CveBod: number,
    FolMov: number,
    CveMov: number,
    SerMov: string,
  ) {
    try {
      const query = ` 
          SELECT  
          ImpDes, 
          PorcDesc, 
          ImpSub, 
          ImpIva, 
          PorcIva, 
          ImpTot, 
          ImpLet, 
          Observ
          FROM MOVTOS 
          WHERE CveBod = @0 AND FolMov = @1 AND CveMov = @2 AND SerMov = @3`;

      const getTotales = await this.manager.query(query, [
        CveBod,
        FolMov,
        CveMov,
        SerMov,
      ]);

      if (getTotales.length === 0) {
        this.ApiJson.customeHttpExeption(
          'Lo sentimos, pero no encontramos los totales',
          HttpStatus.NOT_FOUND,
        );
      }

      return this.ApiJson.customeResSuccess('Totales obtenidos', getTotales[0]);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        `Error ${error['message'] || 'Ocurrió un error interno'}`,
      );
    }
  }
  /* #endregion */

  /* #region updateEncabezadoFactura */
  // Abraham Jesus Echeverria Ruiz
  // 24/02/2026
  async updateEncabezadoFactura(
    CveBod: number,
    FolMov: number,
    CveMov: number,
    SerMov: string,
    updateEncabezadoFactura: UpdateEncabezadoFactura,
  ) {
    try {
      const { NumDoc, fechaAlta, CVEPROVCLI, Observ, UsuarioMod } =
        updateEncabezadoFactura;

      let query = `EXEC SP_GV_ActualizarEncabezadoFactura
	                  @NumDoc = @0, 
                    @FechaAlta = @1, 
                    @Observ = @2,  
                    @CVEPROVCLI = @3, 
                    @UsuarioMod = @4,  
                    -- campos para llave primaria 
                    @CveBod = @5, 
                    @FolMov = @6, 
                    @CveMov = @7, 
                    @SerMov = @8 `;

      let [res]: SpResponse = await this.manager.query(query, [
        NumDoc,
        fechaAlta,
        Observ,
        CVEPROVCLI,
        UsuarioMod,
        CveBod,
        FolMov,
        CveMov,
        SerMov,
      ]);

      if (res.error) {
        this.ApiJson.customeHttpExeption(res.mensaje, res.estatus);
      }

      let findEncabezado = await this.manager.query(
        `select NumDoc, FechaAlta, Observ, CveProvCli  FROM MOVTOS WHERE CveBod = @0 AND FolMov = @1 AND CveMov = @2 AND SerMov = @3`,
        [CveBod, FolMov, CveMov, SerMov],
      );

      return this.ApiJson.customeResSuccess(res.mensaje, findEncabezado);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        `Error ${err['message'] || 'Ocurrió un error interno'}`,
      );
    }
  }
  /* #endregion */

}
