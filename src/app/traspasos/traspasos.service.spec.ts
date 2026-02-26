import { Test, TestingModule } from '@nestjs/testing';
import { TraspasosService } from './traspasos.service';

describe('TraspasosService', () => {
  let service: TraspasosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TraspasosService],
    }).compile();

    service = module.get<TraspasosService>(TraspasosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
