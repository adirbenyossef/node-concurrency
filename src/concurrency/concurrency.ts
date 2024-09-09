import { Job } from '../job/job';
import TransactionManager from '../transaction-manager/transaction-manager';

const transactionManager = new TransactionManager();

export class Concurrency {
    private scheduledTasks: Array<{ job: Job, timestamp: number }> = [];
    private throttledJobs: Map<string, NodeJS.Timeout> = new Map();

    private constructor(private readonly executor: (job: Job) => Promise<any>) { }

    static builder() {
        return new Concurrency((job: Job) => job.execute());
    }

    async schedule(job: Job, timestamp: Date): Promise<Concurrency> {
        const delay = timestamp.getTime() - Date.now();
    if (delay <= 0) {
      throw new Error('Timestamp should be in the future.');
    }

    if (!await transactionManager.acquireLock(job.id)) {
      throw new Error(`Job ${job.id} is already scheduled`);
    }

    try {
      setTimeout(() => this.scheduleTask(job, delay), delay);
    } finally {
      await transactionManager.releaseLock(job.id);
    }

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

    private async scheduleTask(job: Job, delay: number): Promise<void> {
        try {
            if (!await transactionManager.acquireLock(job.id)) {
              throw new Error(`Job ${job.id} is already running`);
            }
            await this.executeJob(job);
        } finally {
        await transactionManager.releaseLock(job.id);
        }
    }

    private async executeJob(job: Job): Promise<void> {
        await this.executor(job);
        this.scheduledTasks.shift();
    }
}
