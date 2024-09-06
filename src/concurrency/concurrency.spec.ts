import { JobFactory } from '../job/job';
import { Concurrency } from './concurrency';

describe('Concurrency', () => {
    let concurrency: Concurrency;

    beforeEach(() => {
        concurrency = Concurrency.builder();
    });

    it('should schedule a job for future execution', done => {
        const job = JobFactory.createSimpleJob(() => Promise.resolve('Scheduled Job executed'));

        const spy = jest.spyOn(job, 'execute');
        concurrency.schedule(job, new Date(Date.now() + 100));

        setTimeout(() => {
            expect(spy).toHaveBeenCalled();
            done();
        }, 200);
    });

    it('should execute tasks in parallel with chunked processing', async () => {
        const job1 = JobFactory.createSimpleJob(() => Promise.resolve('Job 1 complete'));
        const job2 = JobFactory.createSimpleJob(() => Promise.resolve('Job 2 complete'));

        const results = await concurrency.parallel([job1, job2], 2);
        expect(results).toEqual(['Job 1 complete', 'Job 2 complete']);
    });

    it('should throttle job execution', done => {
        const job = JobFactory.createSimpleJob(() => Promise.resolve('Throttled Job executed'));
        const spy = jest.spyOn(job, 'execute');

        concurrency.throttle(job, 200, 'throttleJob');

        setTimeout(() => {
            expect(spy).toHaveBeenCalledTimes(1);
            done();
        }, 300);
    });
});
