import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtServiceCustom } from 'src/globalServices/jwt-service/jwt-service-custom';
import { payLoadToken } from 'src/types/types';
import { resJsonClass } from 'src/utils/resJsonClass';
import { DataSource, EntityManager } from 'typeorm';
import { CreateApartadoDto } from './dto/createApartado.dto';

interface resCompraMovtoResponse {
    error: boolean;
    mensaje: string;
    estatus: number;
}

@Injectable()
export class ApartadosService {

    constructor(
        private JwtServiceCustom: JwtServiceCustom,
        private readonly dataSource: DataSource,
        private readonly manager: EntityManager,
    ) { }

    public ApiJson = new resJsonClass();

    async create(createApartadoDto:CreateApartadoDto) {
  
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

        try {

              const entityManager = queryRunner.manager;
                const payloadToken: payLoadToken = this.JwtServiceCustom.payloadToken as payLoadToken;
            
               const{
                cveProCli,
                observ,
                 usuarioId,
                 impTot,
                 tipMov,
                UsuarioAlta,
                articulo,
                movimiento

               } = createApartadoDto;
                    console.log(createApartadoDto);

                     /* ================= VALIDACIONES ================= */

                if (!movimiento?.length)
                  throw new HttpException('Debe existir al menos un movimiento', HttpStatus.BAD_REQUEST);
            
                if (!articulo?.length)
                  throw new HttpException('Debe existir al menos un artículo', HttpStatus.BAD_REQUEST);
            
                if (tipMov !== 6)
                  throw new HttpException('El tipo de movimiento debe ser un traspaso', HttpStatus.BAD_REQUEST);

                

        } catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }

            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Error ${error['message'] || 'Ocurrió un error interno'}`,
            );

        } finally {
            // Siempre liberar el queryRunner
            if (!queryRunner.isReleased) {
                await queryRunner.release();
            }

        }

    }
}
