import { Module } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { EntradasController } from './entradas.controller';

@Module({
  controllers: [EntradasController],
  providers: [EntradasService],
})
export class EntradasModule {}
