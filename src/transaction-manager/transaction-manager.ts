interface Transaction {
  id: string;
  locked: boolean;
}

class TransactionManager {
  private transactions: Map<string, Transaction> = new Map();

  public async acquireLock(transactionId: string): Promise<boolean> {
    if (this.transactions.has(transactionId)) {
      return false;
    }
    this.transactions.set(transactionId, { id: transactionId, locked: true });
    return true;
  }

  public async releaseLock(transactionId: string): Promise<void> {
    if (this.transactions.has(transactionId)) {
      this.transactions.delete(transactionId);
    }
  }

  public async isLocked(transactionId: string): Promise<boolean> {
    if (this.transactions.has(transactionId)) {
      return this.transactions.get(transactionId)?.locked ?? false;
    }
    return false;
  }
}

export default TransactionManager;