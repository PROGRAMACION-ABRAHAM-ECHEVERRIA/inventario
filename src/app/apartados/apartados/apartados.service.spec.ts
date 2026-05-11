import { Test, TestingModule } from '@nestjs/testing';
import { ApartadosService } from './apartados.service';

describe('ApartadosService', () => {
  let service: ApartadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApartadosService],
    }).compile();

    service = module.get<ApartadosService>(ApartadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
