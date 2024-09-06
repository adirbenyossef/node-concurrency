import { JobFactory, Concurrency, ConcurrencyProxy, EventManager } from '../src/index';

// Set up publisher-subscriber system
const publisher = new EventManager();

publisher.subscribe('jobEvent', (data) => {
    console.log('Event received:', data);
});

// Build concurrency manager
const concurrency = Concurrency.builder();
const proxy = new ConcurrencyProxy(concurrency, publisher);

// Create jobs using the factory
const job1 = JobFactory.createSimpleJob(() => Promise.resolve('Job 1 completed'));
const job2 = JobFactory.createSimpleJob(() => Promise.resolve('Job 2 completed'));
const job3 = JobFactory.createSimpleJob(() => Promise.resolve('Job 3 completed'));

// Schedule a job
proxy.withMetadata('jobEvent', { id: 1 }).schedule(job1, new Date(Date.now() + 5000));

// Execute tasks in parallel
proxy.withMetadata('jobEvent', { id: 2 }).parallel([job2, job3], 2);

// Throttle a job
const throttledJob = JobFactory.createSimpleJob(() => Promise.resolve('Throttled Job executed'));
proxy.withMetadata('jobEvent', { id: 3 }).throttle(throttledJob, 2000, 'throttleJob');