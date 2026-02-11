import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SalidasService } from './salidas.service';
import { ApiTags } from '@nestjs/swagger';
import { SalidaDTO } from './dto/create-salida.dto';

@Controller('salidas')
@ApiTags('Salidas')
export class SalidasController {
    constructor(private readonly salidasService: SalidasService) { }

    @Post('')
    salidas(@Body() salidaDTO: SalidaDTO) {
        return this.salidasService.salidas(salidaDTO);
    }

    @Get(':cvebod')
    getSalidas(@Param('cvebod') cvebod: number) {
        return this.salidasService.getSalidas(cvebod);
    }
}
