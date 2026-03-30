import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { TraspasosService } from "./traspasos.service";
import { CreateTraspasoDto } from "./dto/create-traspaso.dto";
import { AceptarTraspaso } from "./dto/aceptar-traspaso.dto";

import { RechazarTraspaso } from "./dto/rechazar-traspaso.dto";
import { CancelarTraspasoDTO } from "./dto/cancelar-traspaso.dto";



@WebSocketGateway({cors:{origin:'*'}})
export class TraspasoWebsocket{
    @WebSocketServer()
    server: Server;

    constructor(private readonly traspasoService:TraspasosService){}

    

    @SubscribeMessage('crear-traspaso')
    async crearTraspaso(@MessageBody() dto: CreateTraspasoDto, @ConnectedSocket() client: Socket){
        console.log(dto)
        const traspaso = await this.traspasoService.createMovimientoTraspaso(
            dto
        );
   // Identificar rooms (bodega origen y destino)
    const roomOrigen = `bodega-${dto.cveBodOrig}`;
    const roomDestino = `bodega-${dto.CveBodDes}`;

    //  Emitir evento a todos los clientes conectados a esas bodegas
    this.server.to(roomOrigen).emit('traspaso-creado', traspaso);
    this.server.to(roomDestino).emit('traspaso-creadoDestino', traspaso);

        //  Respuesta al cliente que envió el evento
    return { ok: true, data: traspaso };
    
    }


    @SubscribeMessage('aceptar-traspaso')
    async aceptarTraspaso(@MessageBody() dto: AceptarTraspaso,  @ConnectedSocket() client: Socket){
        console.log(dto)
        const res = await this.traspasoService.aceptarMovimientoTraspaso(
            dto
        );
         // Room de la bodega origen y destino
const roomOrigen = `bodega-${res.data[0].CveBod}`;
const roomDestino = `bodega-${res.data[0].aceptarTraspaso[0].CveBodDes}`;


         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-aceptado',res.data);
      this.server.to(roomDestino).emit('traspaso-aceptadoDestino',res.data);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: res };
    }

// Cliente se une a una room de bodega
  @SubscribeMessage('join-bodega')
  handleJoinBodega(@MessageBody() cveBod: number, @ConnectedSocket() client: Socket) {
    const room = `bodega-${cveBod}`;
    client.join(room);
    client.emit('joined-bodega', { room });
    console.log(cveBod)
  }


    @SubscribeMessage('cancelar-traspaso')
    async  cancelarTraspaso(@MessageBody() dto: CancelarTraspasoDTO, @ConnectedSocket() client: Socket){
        console.log(dto)
         const res = await this.traspasoService.cancelarTraspasoMovimiento(
            dto
        );
         // Room de la bodega origen y destino
      const roomOrigen = `bodega-${dto.cveBodOrig}`;
      const roomDes = `bodega-${dto.CveBodDes}`;



         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-cancelado',res);
      this.server.to(roomDes).emit('traspaso-canceladoDestino',res);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: res };

    }
        @SubscribeMessage('rechazar-traspaso')
        async  rechazarTraspaso(@MessageBody() dto: RechazarTraspaso, @ConnectedSocket() client: Socket){
             const res = await this.traspasoService.rechazarTraspaso(
            dto
        );
         // Room de la bodega origen y destino
      const roomOrigen = `bodega-${dto.cveBodOrig}`;
      const roomDestino = `bodega-${dto.CveBodDes}`;


         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-rechazado',res);
      this.server.to(roomDestino).emit('traspaso-rechazoDestino',res);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: res };


        }
}