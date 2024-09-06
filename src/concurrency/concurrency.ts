import { Job } from '../job/job';

export class Concurrency {
    private scheduledTasks: Array<{ job: Job, timestamp: number }> = [];
    private throttledJobs: Map<string, NodeJS.Timeout> = new Map();

    private constructor() { }

    static builder() {
        return new Concurrency();
    }

    schedule(job: Job, timestamp: Date): Concurrency {
        const delay = timestamp.getTime() - Date.now();
        if (delay <= 0) {
            throw new Error('Timestamp should be in the future.');
        }
        setTimeout(() => job.execute(), delay);
        return this;
    }

    async parallel(jobs: Job[], chunkSize: number): Promise<any[]> {
        let results: any[] = [];
        for (let i = 0; i < jobs.length; i += chunkSize) {
            const chunkResults = await Promise.all(jobs.slice(i, i + chunkSize).map(job => job.execute()));
            results = results.concat(chunkResults);
        }
        return results;
    }

    throttle(job: Job, interval: number, id: string): Concurrency {
        const throttledFunc = (...args: any[]) => {
            if (!this.throttledJobs.has(id)) {
                this.throttledJobs.set(id, setTimeout(() => {
                    job.execute();
                    this.throttledJobs.delete(id);
                }, interval));
            }
        };
        throttledFunc();
        return this;
    }
}
