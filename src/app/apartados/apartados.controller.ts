import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UseAuth } from 'src/guards/authGuard/authGuard';
import { ApartadosService } from './apartados.service';
import { CreateApartadoDto } from './dto/createApartado.dto';

@ApiBearerAuth()  
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Apartados')
@UseAuth()   
@Controller('Apartados')
export class ApartadosController {

      constructor(private readonly apartadosService: ApartadosService) {}
        @Post()
        @ApiOperation({
          summary: 'Crar un apartado',
          description: 'Crea un apartado',
        })
        @ApiBody({
          type: CreateApartadoDto,
          description: 'Datos del movimiento de apartado',
        })
      @ApiResponse({
        status: 200,
        description: 'Traspaso aceptado Exitosamente',
      })
        @ApiResponse({
    status: 400,
    description: 'Datos inválidos en la solicitud',
  })
    @ApiResponse({
    status: 500,
    description: 'Error interno del servidor',
  })
        create(   @Body() createApartadoDto : CreateApartadoDto) {
        return this.apartadosService.create(createApartadoDto);
      
        }
}
