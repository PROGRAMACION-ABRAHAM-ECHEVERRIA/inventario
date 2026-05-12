import { Module } from '@nestjs/common';
import { ApartadosController } from './apartados.controller';
import { ApartadosService } from './apartados.service';


@Module({
  controllers: [ApartadosController],
  providers: [ApartadosService]
})
export class ApartadosModule {}
