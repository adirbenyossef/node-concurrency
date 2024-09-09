export interface Job {
    execute(): Promise<any>;
    id: string;
}

export class SimpleJob implements Job {
    private readonly task: () => Promise<any>;
    id: string;

    constructor(task: () => Promise<any>, id: string) {
        this.task = task;
        this.id = id;
    }

    async execute(): Promise<any> {
        return this.task();
    }
}

export class JobFactory {
    static createSimpleJob(task: () => Promise<any>, id: string): Job {
        return new SimpleJob(task, id);
    }
}