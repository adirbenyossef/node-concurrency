import { JobFactory } from '../job/job';
import { Concurrency } from '../concurrency/concurrency';
import { EventManager } from '../pub-sub/pub-sub';
import { ConcurrencyProxy } from './concurrency-proxy';

describe('ConcurrencyProxy', () => {
    let concurrency: Concurrency;
    let manager: EventManager;
    let proxy: ConcurrencyProxy;

    beforeEach(() => {
        concurrency = Concurrency.builder();
        manager = new EventManager();
        proxy = new ConcurrencyProxy(concurrency, manager);
    });

    it('should schedule a job and publish an event', done => {
        const job = JobFactory.createSimpleJob(() => Promise.resolve('Scheduled Job executed'));

        const eventSpy = jest.fn();
        manager.subscribe('jobEvent', eventSpy);

        proxy.withMetadata('jobEvent', { id: 1 }).schedule(job, new Date(Date.now() + 100));

        setTimeout(() => {
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                eventName: 'jobEvent',
                inputParams: { id: 1 },
                status: 'scheduled',
            }));
            done();
        }, 200);
    });

    it('should execute tasks in parallel and publish an event', async () => {
        const job1 = JobFactory.createSimpleJob(() => Promise.resolve('Job 1 complete'));
        const job2 = JobFactory.createSimpleJob(() => Promise.resolve('Job 2 complete'));

        const eventSpy = jest.fn();
        manager.subscribe('jobEvent', eventSpy);

        await proxy.withMetadata('jobEvent', { id: 2 }).parallel([job1, job2], 2);

        expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
            eventName: 'jobEvent',
            inputParams: { id: 2 },
            status: 'completed',
        }));
    });

    it('should throttle a job and publish an event', done => {
        const job = JobFactory.createSimpleJob(() => Promise.resolve('Throttled Job executed'));
        const eventSpy = jest.fn();

        manager.subscribe('jobEvent', eventSpy);

        proxy.withMetadata('jobEvent', { id: 3 }).throttle(job, 200, 'throttleJob');

        setTimeout(() => {
            expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
                eventName: 'jobEvent',
                inputParams: { id: 3 },
                status: 'throttled',
            }));
            done();
        }, 300);
    });
});
