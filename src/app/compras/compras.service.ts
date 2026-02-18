import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCompraDto } from './dto/create-compra.dto';
import { UpdateCompraDto } from './dto/update-compra.dto';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { DataSource } from 'typeorm';
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



      // ============================================
      // 1. INSERTAR MOVIMIENTO
      // ============================================
      const resMovtos: Array<
        resCompraMovtoResponse & { Folmov: number; fecmov: string }> = await entityManager.query(
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
          CreateCompraDto.OrdCom,
          CreateCompraDto.NumDoc,
          CreateCompraDto.CVEPROVCLI,
          CreateCompraDto.DiasCred,
          CreateCompraDto.ImpTot,
          CreateCompraDto.ImpDes,
          CreateCompraDto.PorcDesc,
          CreateCompraDto.ImpFle,
          CreateCompraDto.ImpSub,
          CreateCompraDto.ImpIva,
          CreateCompraDto.PorcIva,
          CreateCompraDto.ImpTot,
          CreateCompraDto.UsuarioAlta,
          CreateCompraDto.CveVen,
          CreateCompraDto.Observ,
          CreateCompraDto.ImpLet,
          CreateCompraDto.Facturada,
          CreateCompraDto.Cancelada,
          CreateCompraDto.Devuelto,
          CreateCompraDto.Afectado,
          CreateCompraDto.NumDias,
          CreateCompraDto.RepEntregada,
          CreateCompraDto.Garantia,
          CreateCompraDto.UsuarioAlta,
          payloadToken.UsuarioId,
        ],
      );

      if (!resMovtos[0] || resMovtos[0].error) {
        const mensaje = resMovtos[0]?.mensaje || 'Error al crear el movimiento';
        const estatus =resMovtos[0]?.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
        this.ApiJson.customeHttpExeption(mensaje, estatus);
      }

      const FolMov = resMovtos[0].Folmov;
      const fecMov = resMovtos[0].fecmov;

      // ============================================
      // 2. INSERTAR DETALLES DE MOVIMIENTO 
      // ============================================
      for (const articulo of CreateCompraDto.Articulos) {
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
            articulo.CveProd,
            articulo.Cant,
            articulo.LisPre,
            articulo.porcentaje,
            articulo.PreUni,
            articulo.importeTotal,
            articulo.DesProd,
            CreateCompraDto.UsuarioAlta,
          ],
        ); 
      

        if (resDetmovtos?.error) {
          const mensaje = resDetmovtos.mensaje || 'Error al crear detalle de movimiento';
          const estatus =resDetmovtos.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
          this.ApiJson.customeHttpExeption(mensaje, estatus);
        }  

      }  

      // ============================================
      // 2. INSERTAR DETALLES DE COMPRA 
      // ============================================
      for (const articulo of CreateCompraDto.Articulos) {
        const [resDetCompra]: SpResponse = await entityManager.query(
          `EXEC [dbo].[SP_GV_AgregarDetalleCompra]
            @FolMov = @0,  
            @CveBod = @1,
            @SerMov = @2,  
            @CveMov = @3, 
            @FecCom = @4, 
            @Lote   = @5 , 
            @CveProdFac @6, 
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
            articulo.lote,  
            articulo.CveProdFac, 
            articulo.CveProd, 
            articulo.PreUni, 
            articulo.Cant, 
            articulo.Cant, 
            articulo.importeTotal, 
            articulo.porcentaje, 
            CreateCompraDto.UsuarioAlta
          ],
        );  

        if (resDetCompra?.error) {
          const mensaje = resDetCompra.mensaje || 'Error al crear detalle de movimiento';
          const estatus =resDetCompra.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
          this.ApiJson.customeHttpExeption(mensaje, estatus);
        }  

      } 


      // ============================================
      // 2. Crear productos  
      // ============================================   

      for (const articulo of CreateCompraDto.Articulos) {  

        // armando CVEPROD 
        const CVEPROD = `${CreateCompraDto.CVEBOD}-${articulo.lote}-${articulo.Generado}`; 

        const [resProducto]: SpResponse = await entityManager.query(
          `EXEC dbo.SP_GV_AgregarProductoCompra
              @CVEPROD = ?,
              @DESPROD = ?,
              @CVEUNI = ?,
              @CVEFAM = ?,
              @CVEMAR = ?,
              @DESMOD = '',
              @DESUBI = '',
              @TIPPROD = 1,
              @EDOPROD = 1,
              @PAQPROD = 0,
              @CODBAR = '',
              @NUMOBJ = 0,
              @OBSERVA = ?,
              @FOTO = 0x,
              @LISPRE1 = ?,
              @LISPRE2 = 0,
              @LISPRE3 = 0,
              @LISPRE4 = 0,
              @LISPRE5 = 0,
              @LISPRE6 = ?,
              @MINPROD = 0,
              @MAXPROD = 0,
              @CVEPRODPROV = '',
              @MANSERIE = 0,
              @MANKILOM = 0,
              @MANRENTA = 0,
              @DIAINI1 = 0,
              @DIAFIN1 = 0,
              @DIATOLER1 = 0,
              @DIAPREC1 = 0,
              @DIAINI2 = 0,
              @DIAFIN2 = 0,
              @DIATOLER2 = 0,
              @DIAPREC2 = 0,
              @DIAINI3 = 0,
              @DIAFIN3 = 0,
              @DIATOLER3 = 0,
              @DIAPREC3 = 0,
              @DIAINI4 = 0,
              @DIAFIN4 = 0,
              @DIATOLER4 = 0,
              @DIAPREC4 = 0,
              @DISPLUN = 0,
              @DISPMAR = 0,
              @DISPMIE = 0,
              @DISPJUE = 0,
              @DISPVIE = 0,
              @DISPSAB = 0,
              @DISPDOM = 0,
              @KILOMMANTTO = 0,
              @RENTASMANTTO = 0,
              @NUMSEMMANTTO = 0,
              @FECHAREAL = GETDATE(),
              @FACTORACTPRECIO = 1,
              @FLETEACTPRECIO = 0,
              @CODBAR2 = '',
              @CODBAR3 = '',
              @CODBAR4 = '',
              @IMPCODBARPOS = 0,
              @FACTORACTPRECIO2 = 1,
              @FACTORACTPRECIO3 = 1,
              @FACTORACTPRECIO4 = 1,
              @FACTORACTPRECIO5 = 1,
              @FACTORACTPRECIO6 = 1,
              @Detalle = 0,
              @Listado1 = 0,
              @Listado2 = 0,
              @Listado3 = 0,
              @Listado4 = 0,
              @PrecioAdic = 0,
              @Listado5 = 0,
              @Casco = 0,
              @Asientos = 0,
              @Respaldos = 0,
              @Otros1 = 0,
              @Otros2 = 0,
              @PrecioAdic2 = 0,
              @ListadoCol1 = 0,
              @ListadoCol2 = 0,
              @Listado6 = 0,
              @Otros3 = 0,
              @ListadoCol3 = 0,
              @Tienda = 0,
              @Mayoreo = 0,
              @ColorMad1 = 0,
              @ColorMad2 = 0,
              @ColorMad3 = 0,
              @Caducidad = 0,
              @NivelControl = 0,
              @CVEMOV = 0,
              @nTipoPrecio = 0,
              @nCantDesc = 0,
              @categoria = 'A',
              @BimAplicado = 0,
              @Precio1Ori = 0,
              @HistBimChg = '',
              @EmpSucOri = 0,
              @EmpLoteEnaj = '',
              @EmpFolBoleta = 0,
              @EmpFolIndice = 0,
              @EmpFecPres = '1900-01-01',
              @EmpMontEval = 0,
              @EmpMontPres = 0,
              @EmpMontInte = 0,
              @EmpPlazo = 0,
              @EmpDiasPlazo = 0,
              @EmpDescPlazo = '',
              @EmpTasa = 0,
              @EmpRefrendos = 0,
              @EmpLogin = '',
              @EmpValuador = '',
              @EmpPagoCapital = 0,
              @EmpInteresPagado = 0,
              @EmpRecargoPagado = 0,
              @EmpSaldo = 0,
              @PrecioDef = 0,
              @PorcDesc = 0,
              @PorcDescWEB = 0,
              @CveUserResp = '',
              @CveUserGte = '',
              @EdoFisico = '',
              @EmpInteres = 0,
              @EmpRecargo = 0,
              @EmpCosFinDias = 0,
              @EmpCosFin = 0,
              @UsuarioAlta = ?,
              @ProdNuevo = 1,
              @Esjoyeria = 0`,
          [
            articulo.CveProd,        // CVEPROD
            articulo.DesProd,        // DESPROD
            articulo.CveUni,         // CVEUNI
            articulo.CveFam,         // CVEFAM
            articulo.CveMar,         // CVEMAR
            articulo.ObservaProd ?? '',  // OBSERVA
            0,        // LISPRE1
            articulo.PreUni,        // LISPRE6
            CreateCompraDto.UsuarioAlta, 
            articulo.lote // UsuarioAlta
          ],
        ); 
      

        if (resProducto?.error) {
          const mensaje = resProducto.mensaje || 'Error al crear detalle de movimiento';
          const estatus = resProducto.estatus || HttpStatus.INTERNAL_SERVER_ERROR;
          this.ApiJson.customeHttpExeption(mensaje, estatus);
        }  

      } 

      // ============================================
      // 5. Modificar Existencias
      // ============================================

        for (const articulo of CreateCompraDto.Articulos) {
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
            articulo.CveProd,
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
        };
        }; 
      

      // ============================================
      // 6. COMMIT DE LA TRANSACCIÓN
      // ============================================
      await queryRunner.commitTransaction();

      return this.ApiJson.customeResSuccess('Venta creada exitosamente', {
        FolMov,
        fecMov,
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
}
  
