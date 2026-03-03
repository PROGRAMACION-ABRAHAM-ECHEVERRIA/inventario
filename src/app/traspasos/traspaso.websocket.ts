import { SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody } from "@nestjs/websockets";
import { Server } from "socket.io";
import { TraspasosService } from "./traspasos.service";
import { CreateTraspasoDto } from "./dto/create-traspaso.dto";
import { AceptarTraspaso } from "./dto/aceptar-traspaso.dto";


@WebSocketGateway({cors:{origin:'*'}})
export class TraspasoWebsocket{
    @WebSocketServer()
    server: Server;

    constructor(private readonly traspasoService:TraspasosService){}

    @SubscribeMessage('crear-traspaso')
    async crearTraspaso(@MessageBody() dto: CreateTraspasoDto){
        const traspaso = await this.traspasoService.createMovimientoTraspaso(
            dto
        );

        this.server.emit('traspaso-creado', traspaso);
    
    }


    @SubscribeMessage('aceptar-traspaso')
    async aceptarTraspaso(@MessageBody() dto: AceptarTraspaso){
        const aceptarTraspaso = await this.traspasoService.aceptarMovimientoTraspaso(
            dto
        );
        this.server.emit('traspaso-aceptado', aceptarTraspaso);
    }



}