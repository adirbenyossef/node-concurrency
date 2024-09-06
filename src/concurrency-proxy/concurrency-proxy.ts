// ConcurrencyProxy.ts
import { Concurrency } from '../concurrency/concurrency';
import { Job } from '../job/job';
import { EventManager } from '../pub-sub/pub-sub';

export class ConcurrencyProxy {
    private concurrency: Concurrency;
    private manager: EventManager;
    private metadata: { [key: string]: any } = {};

    constructor(concurrency: Concurrency, manager: EventManager) {
        this.concurrency = concurrency;
        this.manager = manager;
    }

    withMetadata(eventName: string, inputParams: any): ConcurrencyProxy {
        this.metadata = { eventName, inputParams };
        return this;
    }

    schedule(job: Job, timestamp: Date) {
        this.concurrency.schedule(job, timestamp);
        this.manager.publish(this.metadata.eventName, {
            ...this.metadata,
            status: 'scheduled',
            timestamp,
        });
    }

    async parallel(jobs: Job[], chunkSize: number) {
        const results = await this.concurrency.parallel(jobs, chunkSize);
        this.manager.publish(this.metadata.eventName, {
            ...this.metadata,
            status: 'completed',
            results,
        });
        return results;
    }

    throttle(job: Job, interval: number, id: string) {
        this.concurrency.throttle(job, interval, id);
        this.manager.publish(this.metadata.eventName, {
            ...this.metadata,
            status: 'throttled',
            interval,
        });
    }
}
