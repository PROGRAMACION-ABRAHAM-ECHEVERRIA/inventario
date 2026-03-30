import { Module } from '@nestjs/common';
import { TraspasosService } from './traspasos.service';
import { TraspasosController } from './traspasos.controller';
import { TraspasoWebsocket } from './traspaso.websocket';

@Module({
  controllers:[TraspasosController],
  providers: [TraspasosService, TraspasoWebsocket]
})
export class TraspasosModule {}
