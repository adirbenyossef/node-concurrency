import { createClient } from 'redis';


class TransactionManager {
  private redisClient;

  constructor() {
    this.redisClient = createClient({
      socket: {
        port: 6379,
        host: 'localhost',
      },
    });
  }

  async acquireLock(transactionId: string, timeout: number = 30): Promise<boolean> {
    const lockKey = `lock:${transactionId}`;
    const lockValue = `lock:${transactionId}:${Date.now()}`;
    const result = await this.redisClient.set(lockKey, lockValue, {  EX: timeout, NX: true});
    return result === 'OK';
  }

  async releaseLock(transactionId: string): Promise<void> {
    const lockKey = `lock:${transactionId}`;
    await this.redisClient.del(lockKey);
  }

  async isLocked(transactionId: string): Promise<boolean> {
    const lockKey = `lock:${transactionId}`;
    const result = await this.redisClient.exists(lockKey);
    return result === 1;
  }
}

export default TransactionManager;