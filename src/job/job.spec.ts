import { JobFactory, SimpleJob } from './job';

describe('JobFactory', () => {
    it('should create a SimpleJob', async () => {
        const job = JobFactory.createSimpleJob(() => Promise.resolve('Job completed'));
        expect(job).toBeInstanceOf(SimpleJob);
        const result = await job.execute();
        expect(result).toBe('Job completed');
    });
});
