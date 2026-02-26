import { Module } from '@nestjs/common';
import { TraspasosService } from './traspasos.service';

@Module({
  providers: [TraspasosService]
})
export class TraspasosModule {}
