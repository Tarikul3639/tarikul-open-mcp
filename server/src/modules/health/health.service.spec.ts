import { HealthService } from './health.service.js';

describe('HealthService', () => {
  it('reports a connected database', async () => {
    const prisma = { $connect: vi.fn().mockResolvedValue(undefined) };
    const service = new HealthService(prisma as never);

    await expect(service.check()).resolves.toEqual({
      status: 'online',
      database: 'connected',
    });
  });

  it('reports an unavailable database when Prisma cannot connect', async () => {
    const prisma = {
      $connect: vi.fn().mockRejectedValue(new Error('offline')),
    };
    const service = new HealthService(prisma as never);

    await expect(service.check()).resolves.toEqual({
      status: 'degraded',
      database: 'unavailable',
    });
  });
});
