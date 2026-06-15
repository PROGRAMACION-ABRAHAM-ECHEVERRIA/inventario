import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { TraspasosService } from "./traspasos.service";
import { CreateTraspasoDto } from "./dto/create-traspaso.dto";
import { AceptarTraspaso } from "./dto/aceptar-traspaso.dto";
import { UseAuthWebsocket, WsAuthGuard } from "src/guards/authGuard/authGuardWebsocket";
import { RechazarTraspaso } from "./dto/rechazar-traspaso.dto";
import { CancelarTraspasoDTO } from "./dto/cancelar-traspaso.dto";




@WebSocketGateway({ cors: { origin: '*' } })
@UseAuthWebsocket()

export class TraspasoWebsocket {
    @WebSocketServer()
    server: Server;

    constructor(private readonly traspasoService: TraspasosService) { }



    @SubscribeMessage('crear-traspaso')
    async crearTraspaso(@MessageBody() dto: CreateTraspasoDto, @ConnectedSocket() client: Socket) {
       try {
         console.log(dto)
        const res = await this.traspasoService.createMovimientoTraspaso(dto);
        // Identificar rooms (bodega origen y destino)
        const roomOrigen = `bodega-${dto.cveBodOrig}`;
        const roomDestino = `bodega-${dto.CveBodDes}`;

        //  Emitir evento a todos los clientes conectados a esas bodegas
        this.server.to(roomOrigen).emit('traspaso-creado-origen', res);
        this.server.to(roomDestino).emit('traspaso-creado-destino', res);

        //  Respuesta al cliente que envió el evento
        return { ok: true, data: res };
       } catch (err:any) {
        console.error('Error al crear traspaso:', err);
            console.log(err);
            // Emitir error controlado al cliente
            client.emit('traspaso-no-creado', {
                error: true,
                mensaje: err?.mensaje || 'Error al cancelar el traspaso'
            });
       }

    }


    @SubscribeMessage('aceptar-traspaso')
    async aceptarTraspaso(@MessageBody() dto: AceptarTraspaso, @ConnectedSocket() client: Socket) {
       try {
                console.log(dto)
        const res = await this.traspasoService.aceptarMovimientoTraspaso(dto);
        // Room de la bodega origen y destino
        const roomOrigen = `bodega-${dto.CveBodOrig}`;
        const roomDestino = `bodega-${dto.CveBodOrig}`;


        // Notificar a todos los clientes conectados a esas bodegas
        this.server.to(roomOrigen).emit('traspaso-aceptado-origen', res);
        this.server.to(roomDestino).emit('traspaso-aceptado-destino', res);
 
        // Respuesta al cliente que hizo la solicitud
        return { ok: true, data: res };
       } catch (err:any) {
         console.error('Error al aceptar traspaso:', err);
            console.log(err);
            // Emitir error controlado al cliente
            client.emit('traspaso-no-aceptado', {
                error: true,
                mensaje: err?.mensaje || 'Error al cancelar el traspaso'
            });
       }
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
    async cancelarTraspaso(@MessageBody() dto: CancelarTraspasoDTO, @ConnectedSocket() client: Socket) {
        try {
            console.log(dto);

            const res = await this.traspasoService.cancelarTraspasoMovimiento(dto);

            // Notificar rooms
            const roomOrigen = `bodega-${dto.cveBodOrig}`;
            const roomDes = `bodega-${dto.CveBodDes}`;
            this.server.to(roomOrigen).emit('traspaso-cancelado-origen', res);
            this.server.to(roomDes).emit('traspaso-cancelado-destino', res);
    

        } catch (err:any) {
            console.error('Error al cancelar traspaso:', err);
            console.log(err);
            // Emitir error controlado al cliente
            client.emit('traspaso-no-cancelado', {
                error: true,
                mensaje: err?.mensaje || 'Error al cancelar el traspaso'
            });
        }
    }

    @SubscribeMessage('rechazar-traspaso')
    async rechazarTraspaso(@MessageBody() dto: RechazarTraspaso, @ConnectedSocket() client: Socket) {
        console.log(dto)
       try {
                const res = await this.traspasoService.rechazarTraspaso(dto);
        // Room de la bodega origen y destino
        const roomOrigen = `bodega-${dto.cveBodOrig}`;
        const roomDestino = `bodega-${dto.CveBodDes}`;


        // Notificar a todos los clientes conectados a esas bodegas
        this.server.to(roomOrigen).emit('traspaso-rechazado-origen', res);
        this.server.to(roomDestino).emit('traspaso-rechazo-destino', res);

        // Respuesta al cliente que hizo la solicitud
        return { ok: true, data: res };

        
       } catch (err: any) {
         console.error('Error al rechazar traspaso:', err);
            console.log(err);
            // Emitir error controlado al cliente
            client.emit('traspaso-no-rechazado', {
                error: true,
                mensaje: err?.mensaje || 'Error al cancelar el traspaso'
            });
       }

    }
}