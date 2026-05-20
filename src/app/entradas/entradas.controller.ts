import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, Query, InternalServerErrorException, Search } from '@nestjs/common';
import { EntradasService } from './entradas.service';
import { CreateEntradaDto } from './dto/create-entrada.dto';
import { UpdateEntradaDto } from './dto/update-entrada.dto';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Entradas')
@UseAuth()   
@Controller('entradas')
export class EntradasController {
  constructor(private readonly entradasService: EntradasService) {}

  @Post()
  @ApiOperation({summary: 'Endpoint Para hacer una entrada'})
  create(@Body() createEntradaDto: CreateEntradaDto) {
    return this.entradasService.crearEntrada(createEntradaDto);

  }

 @ApiOperation({ summary: 'Obtener todas las entradas por bodega' })
  @Get(':Folmov/') 
  ObteneTotalProdMov(@Param('CVEBOD') CVEBOD: number,
  @Query('page') page?: number,
  @Query('limit') limit?: number,){
    return this.entradasService.ObteneTotalProdMov(CVEBOD,
    Number(page) || 1,
    Number(limit) || 30,);
  }

@ApiOperation({ summary: 'Buscador' })
@ApiQuery({ name: 'CVEBOD', required: true, type: Number, description: 'Clave de la bodega (obligatorio)' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'SEARCH', required: false, type: String })
@Get('Buscador/ObteneTotalProdMovSearch') 
ObteneTotalProdMovSearch(
  @Query('CVEBOD') CVEBOD: number,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('SEARCH') Search?: string,
){
const searchValue = Search?.trim() ? Search.trim() : '';

return this.entradasService.ObtenerTotalProdMovSearch(
  CVEBOD,
  String(searchValue),
  Number(page) || 1,
  Number(limit) || 25,
);
}

    @ApiOperation({ summary: 'Obtener detalle por entrada' })
    @Get(':CVEBOD/:CVEMOV/:FOLMOV/:SERMOV') 
    ObteneProdByMov(@Param('CVEBOD') CVEBOD:number, @Param('CVEMOV') CVEMOV:number, @Param('FOLMOV') FOLMOV:number, @Param('SERMOV')SERMOV:string){
      console.log(SERMOV); 
        return this.entradasService.ObteneProdByMov(CVEBOD,CVEMOV,FOLMOV, SERMOV)
    } 

    @ApiQuery({ name: 'CVEBOD', required: true, type: Number, description: 'Clave de la bodega (obligatorio)' })
    @ApiQuery({ name: 'CVEMOV', required: true, type: String, description: 'Descripción del movimiento' })
    @ApiQuery({ name: 'FOLMOV', required: true, type: String, description: 'Folio movimiento' }) 
    @ApiQuery({ name: 'SERMOV', required: false, type: String, description: 'Serie del movimiento' })

  
    @ApiOperation({ summary: 'Obtener detalle por entrada' })
    @Get('detalle/entrada/queryParams') 
    ObteneProdByMovParams(
      @Query('CVEBOD') CVEBOD?: string,
            @Query('CVEMOV') CVEMOV?: string ,
                  @Query('FOLMOV') FOLMOV?: string, 
      @Query('SERMOV') SERMOV?: string,


    ){  
      if(!CVEBOD){ 
          throw new InternalServerErrorException('El parámetro CVEBOD es obligatorio');
      } 

      if(!CVEMOV){ 
          throw new InternalServerErrorException('El parámetro CVEBOD es obligatorio');
      } 

      if(!FOLMOV){ 
          throw new InternalServerErrorException('El parámetro CVEBOD es obligatorio');
      }
        return this.entradasService.ObteneProdByMovParams(
    +CVEBOD, 
    +CVEMOV, 
    +FOLMOV,
    SERMOV ?? null,
  );
    }


 @ApiOperation({ summary: 'Obtener todas las entradas por bodega y  filtrar por bodega, movimiento, serie y fecha' })
@ApiQuery({ name: 'CVEBOD', required: true, type: Number, description: 'Clave de la bodega (obligatorio)' })
@ApiQuery({ name: 'SERMOV', required: false, type: String, description: 'Serie del movimiento' })
@ApiQuery({ name: 'DESMOV', required: false, type: String, description: 'Descripción del movimiento' })
@ApiQuery({ name: 'DESBOD', required: false, type: String, description: 'Descripción de la bodega' })
@ApiQuery({ name: 'FECHAALTA', required: false, type: String, description: 'Fecha de alta (YYYY-MM-DD)' })
@Get('entradas/ObteneTotalProdMovFilter')
ObteneTotalProdMovFilter(
  @Query('CVEBOD') CVEBOD?: string,
  @Query('SERMOV') SERMOV?: string,
  @Query('DESMOV') DESMOV?: string,
  @Query('DESBOD') DESBOD?: string,
  @Query('FECHAALTA') FECHAALTA?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) {
  if (!CVEBOD) {
    throw new InternalServerErrorException('El parámetro CVEBOD es obligatorio');
  }

  return this.entradasService.ObteneTotalProdMovFilter(
    +CVEBOD,
    SERMOV ?? null,
    DESMOV ?? null,
    DESBOD ?? null,
    FECHAALTA ?? null, 
     Number(page) || 1,
    Number(limit) || 30,
  );
}

}



