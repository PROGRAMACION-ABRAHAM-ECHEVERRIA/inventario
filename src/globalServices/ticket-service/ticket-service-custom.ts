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
    isReimp: boolean,
  ) {

    const queryEncabezado = `
      EXEC SP_GV_Obtener_encabezado_ticket
      @CveBod = @0,
      @CveMov = @1,
      @FolMov = @2,
      @SerMov = @3
    `;

    let servicios: Object[] = [];

    const [getEncabezadoTicket] = await manager.query(queryEncabezado, [
      CveBod,
      CveMov,
      FolMov,
      SerMov,
    ]);

    const queryDetalleArticulo = `
      EXEC SP_GV_Obtener_Detalle_Reimpresion
      @CveBod = @0,
      @CveMov = @1,
      @FolMov = @2,
      @SerMov = @3
    `;

    const getDetalleArticulos = await manager.query(queryDetalleArticulo, [
      CveBod,
      CveMov,
      FolMov,
      SerMov,
    ]);

    // ejemplo temporal
    const CvePRE = 'PRE';

    const productoPRE = getDetalleArticulos.find(
      (p) => p.CveProd === CvePRE,
    );

    const ArtSinPre = getDetalleArticulos.filter(
      (item) => item.CveProd !== CvePRE,
    );

    if (productoPRE) {
      servicios.push(productoPRE);
    }

    const queryDetallePagos = `
      EXEC SP_GV_Obtener_pago_reimpresion
      @CveBod = @0,
      @CveMov = @1,
      @FolMov = @2,
      @SerMov = @3
    `;

    const getDetallePagos = await manager.query(queryDetallePagos, [
      CveBod,
      CveMov,
      FolMov,
      SerMov,
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
      clausulas: getClausulas,
      reimpresion: isReimp,
    };
  }
}