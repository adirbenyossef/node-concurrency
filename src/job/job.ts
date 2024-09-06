export interface Job {
    execute(): Promise<any>;
}

export class SimpleJob implements Job {
    private readonly task: () => Promise<any>;

    constructor(task: () => Promise<any>) {
        this.task = task;
    }

    async execute(): Promise<any> {
        return this.task();
    }
}

export class JobFactory {
    static createSimpleJob(task: () => Promise<any>): Job {
        return new SimpleJob(task);
    }
}