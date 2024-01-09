import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleService],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a list of origins', () => {
    const a = service.origins();
    expect(a).toContain('NZDN');
    expect(a).toContain('NZWN');
  });

  it('should return a list of routes', () => {
    const a = service.routes('NZWN');
    expect(a.length).toBeGreaterThan(0);
    const b = a.find((r) => r.destination === 'NZWB');
    expect(b).toBeDefined();
  });

  it('should return a list of flights', () => {
    const flights = service.flights('NZWB', 'NZWN');
    expect(flights.length).toBeGreaterThan(0);
  });
});
