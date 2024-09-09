
# Node Concurrency Tutorial 📝

- [Installation](#installation)
- [Concepts](#concepts)
- [Usage](#usage)
  - [Creating a Publisher and Subscriber](#creating-a-publisher-and-subscriber)
  - [Creating and Managing Jobs](#creating-and-managing-jobs)
  - [Scheduling a Job](#scheduling-a-job)
  - [Running Jobs in Parallel](#running-jobs-in-parallel)
  - [Throttling Jobs](#throttling-jobs)
- [Running the Example](#running-the-example)
- [Understanding the Output](#understanding-the-output)
- [JavaScript Concepts](#javascript-concepts)
- [Conclusion](#conclusion)


## Installation
To get started with `node-concurrency`, create a new TypeScript project and install the package:
```bash
mkdir my-concurrency-app
cd my-concurrency-app
npm init -y
npm install typescript node-concurrency
```
Set up TypeScript by creating a tsconfig.json file:

~~~json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist"
  },
  "include": ["src/**/*"]
}
~~~

## Concept
Before using the package, let's understand some important JavaScript concepts:

- Call Stack: Keeps track of function calls. JavaScript runs one function at a time. It operates on a Last In, First Out (LIFO) principle.
- Event Loop: Manages the execution of asynchronous tasks, ensuring that JavaScript does not block while waiting for operations like timers or I/O.
- Task Queues:
  - Microtask Queue: Handles tasks (like promises) that need to be executed immediately after the current script finishes but before other tasks.
  - Task Queue: Manages tasks like setTimeout or I/O operations.


## Usage
Here’s how to use node-concurrency in your project:

### Creating a Publisher and Subscriber
Set up an event system to listen for events, such as job completion.

~~~typescript
import { JobFactory, Concurrency, ConcurrencyProxy, EventPublisher } from 'nodeconcurrency';

// Create a Publisher
const publisher = new EventPublisher();

// Subscribe to listen for events
publisher.subscribe('jobEvent', (data) => {
    console.log('Event received:', data);
});
~~~

### Creating and Managing Jobs
Create and manage jobs using the `JobFactory`.

~~~typescript
const concurrency = Concurrency.builder();
const proxy = new ConcurrencyProxy(concurrency, publisher);

const job1 = JobFactory.createSimpleJob(() => {
    return new Promise((resolve) => {
        setTimeout(() => resolve('Job 1 completed'), 1000); // 1 second delay
    });
});

const job2 = JobFactory.createSimpleJob(() => {
    return new Promise((resolve) => {
        setTimeout(() => resolve('Job 2 completed'), 500); // 0.5 second delay
    });
});

const job3 = JobFactory.createSimpleJob(() => {
    return new Promise((resolve) => {
        setTimeout(() => resolve('Job 3 completed'), 700); // 0.7 second delay
    });
});
~~~
### Scheduling a Job
Schedule a job to run in the future.
~~~typescript
proxy.withMetadata('jobEvent', { id: 1 }).schedule(job1, new Date(Date.now() + 2000)); // Run in 2 seconds
~~~

### Running Jobs in Parallel
Run multiple jobs in parallel with a specified chunk size.
~~~typescript
proxy.withMetadata('jobEvent', { id: 2 }).parallel([job2, job3], 2)
    .then(results => console.log('Parallel Jobs Completed:', results));
~~~

### Throttling Jobs
Limit how often a job can run with throttling.
~~~typescript
const throttledJob = JobFactory.createSimpleJob(() => Promise.resolve('Throttled Job executed'));
proxy.withMetadata('jobEvent', { id: 3 }).throttle(throttledJob, 2000, 'throttleJob');
~~~

### Running the Example
Compile your TypeScript code to JavaScript and run it:
~~~bash
npx tsc
node dist/index.js
~~~

### Understanding the Output
When you run the code, you should see something like:

~~~css
Event received: { eventName: 'jobEvent', inputParams: { id: 1 }, status: 'scheduled' }
Parallel Jobs Completed: [ 'Job 2 completed', 'Job 3 completed' ]
Event received: { eventName: 'jobEvent', inputParams: { id: 2 }, status: 'completed' }
Event received: { eventName: 'jobEvent', inputParams: { id: 3 }, status: 'throttled' }
~~~

### JavaScript Concepts
- Call Stack: Adds jobs to the stack when it's their turn to execute.
- Event Loop: Moves jobs from queues to the call stack when the stack is empty.
- Task Queues:
  - Microtask Queue: Manages resolved promises.
  - Task Queue: Manages tasks like setTimeout or I/O.
