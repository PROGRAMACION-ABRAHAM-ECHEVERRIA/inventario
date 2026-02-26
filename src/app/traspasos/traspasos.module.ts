import { Module } from '@nestjs/common';
import { TraspasosService } from './traspasos.service';
import { TraspasosController } from './traspasos.controller';

@Module({
  controllers:[TraspasosController],
  providers: [TraspasosService]
})
export class TraspasosModule {}
