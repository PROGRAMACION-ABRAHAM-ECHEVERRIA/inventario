import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { TraspasosService } from "./traspasos.service";
import { CreateTraspasoDto } from "./dto/create-traspaso.dto";
import { AceptarTraspaso } from "./dto/aceptar-traspaso.dto";
import { CancelarTraspaso } from "./dto/cancelar-traspaso.dto";
import { RechazarTraspaso } from "./dto/rechazar-traspaso.dto";



@WebSocketGateway({cors:{origin:'*'}})
export class TraspasoWebsocket{
    @WebSocketServer()
    server: Server;

    constructor(private readonly traspasoService:TraspasosService){}

    

    @SubscribeMessage('crear-traspaso')
    async crearTraspaso(@MessageBody() dto: CreateTraspasoDto, @ConnectedSocket() client: Socket){

        const traspaso = await this.traspasoService.createMovimientoTraspaso(
            dto
        );
   // Identificar rooms (bodega origen y destino)
    const roomOrigen = `bodega-${dto.cveBod}`;
    const roomDestino = `bodega-${dto.CveBodDes}`;

    //  Emitir evento a todos los clientes conectados a esas bodegas
    this.server.to(roomOrigen).emit('traspaso-creado', traspaso);
    this.server.to(roomDestino).emit('traspaso-creado', traspaso);

        //  Respuesta al cliente que envió el evento
    return { ok: true, data: traspaso };
    
    }


    @SubscribeMessage('aceptar-traspaso')
    async aceptarTraspaso(@MessageBody() dto: AceptarTraspaso,  @ConnectedSocket() client: Socket){
        const aceptarTraspaso = await this.traspasoService.aceptarMovimientoTraspaso(
            dto
        );
         // Room de la bodega origen y destino
      const roomOrigen = `bodega-${dto.cveBod}`;
      const roomDestino = `bodega-${dto.CveBodDes}`;


         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-aceptado',aceptarTraspaso);
      this.server.to(roomDestino).emit('traspaso-aceptado',aceptarTraspaso);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: aceptarTraspaso };
    }

// Cliente se une a una room de bodega
  @SubscribeMessage('join-bodega')
  handleJoinBodega(@MessageBody() cveBod: number, @ConnectedSocket() client: Socket) {
    const room = `bodega-${cveBod}`;
    client.join(room);
    client.emit('joined-bodega', { room });
  }


    @SubscribeMessage('cancelar-traspaso')
    async  cancelarTraspaso(@MessageBody() dto: CancelarTraspaso, @ConnectedSocket() client: Socket){
         const res = await this.traspasoService.cancelarTraspaso(
            dto
        );
         // Room de la bodega origen y destino
      const roomOrigen = `bodega-${dto.cveBod}`;



         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-cancelado',res);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: res };

    }
        @SubscribeMessage('rechazar-traspaso')
        async  rechazarTraspaso(@MessageBody() dto: RechazarTraspaso, @ConnectedSocket() client: Socket){
             const res = await this.traspasoService.rechazarTraspaso(
            dto
        );
         // Room de la bodega origen y destino
      const roomOrigen = `bodega-${dto.cveBod}`;
      const roomDestino = `bodega-${dto.CveBodDes}`;


         // Notificar a todos los clientes conectados a esas bodegas
      this.server.to(roomOrigen).emit('traspaso-rechazado',res);
      this.server.to(roomDestino).emit('traspaso-rechazo',res);

       // Respuesta al cliente que hizo la solicitud
      return { ok: true, data: res };


        }
}