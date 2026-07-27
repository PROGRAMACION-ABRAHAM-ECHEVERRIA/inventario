import { Injectable } from "@nestjs/common";
import { EntityManager } from "typeorm";

@Injectable()
export class TicketService {

  constructor() {}

async getTicket(
  manager: EntityManager,
  CveBod: number,
  FolMov: number,
  CveMov: number,
  SerMov: string,
  FolPag: number,
  isReimp: boolean,
  //isPago : boolean,
  isLiquidacion: boolean
) {

  const queryEncabezado = `
    EXEC SP_GV_Obtener_encabezado_ticket_Apartado
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3
  `;

  const [getEncabezadoTicket] = await manager.query(queryEncabezado, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]);
  

  const queryDetalleArticulo = `
    EXEC SP_GV_Obtener_Detalle_Reimpresion_Apartado
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3,
    @FolPag = @4
  `;

  const getDetalleArticulos = await manager.query(queryDetalleArticulo, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
    FolPag
  ]);

 // console.log('isPago:', isPago);
//console.log(getDetalleArticulos);

  const CvePRE = 'PRE';

  const productoPRE = getDetalleArticulos.find(p => p.CveProd === CvePRE);

  const ArtSinPre = getDetalleArticulos.filter(item => item.CveProd !== CvePRE);

  const servicios = productoPRE ? [productoPRE] : [];

    let getSiguientePagoApartado = [];
  let getDescuentoApartado = [];

  const queryDetallePagos = `
    EXEC SP_GV_Obtener_pago_reimpresion_Apartado
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3,
    @FolPag = @4
  `;

  const getDetallePagos = await manager.query(queryDetallePagos, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]);


        const querySiguientePagoApartado = `
      EXEC SP_GV_ObtenerProximoPagoApartado
      @FolPag = @0,
      @FolMov = @1,
      	@CveBod = @2,
	@CveMov = @3,
	@SerMov = @4
    `;

    getSiguientePagoApartado = await manager.query(querySiguientePagoApartado, [
      FolPag,
      FolMov,
      CveBod,
      CveMov,
      SerMov
    ]);

    const queryDescuentoApartado = `
      EXEC SP_GV_ObtenerDescuentoApartado
      @FolPag = @0,
      @FolMov = @1,
      @CveBod = @2,
      @CveMov = @3,
      @SerMov = @4
    `;

    getDescuentoApartado = await manager.query(queryDescuentoApartado, [
      FolPag,
      FolMov,
      CveBod,
      CveMov,
      SerMov
    ]);

  const queryClausulas = `
    EXEC SP_GV_Obtener_Clausulas_Ticket
    @CveBod = @0,
    @CveMov = @1,
    @FolMov = @2,
    @SerMov = @3
  `;

  const getClausulas = await manager.query(queryClausulas, [
    CveBod,
    CveMov,
    FolMov,
    SerMov,
  ]);

  return {
    encabezadoTicket: getEncabezadoTicket,
    articulos: ArtSinPre,
    servicios,
    pagos: getDetallePagos,

    pagoProximo: getSiguientePagoApartado,
    descuentoApartado:  getDescuentoApartado,

    clausulas: getClausulas,
    reimpresion: isReimp,
    isLiquidacion
  };
}
}