import { Test, TestingModule } from '@nestjs/testing';
import { EntradasService } from './entradas.service';

describe('EntradasService', () => {
  let service: EntradasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntradasService],
    }).compile();

    service = module.get<EntradasService>(EntradasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
