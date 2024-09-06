import { EventManager } from '../pub-sub/pub-sub';

describe('EventPublisher', () => {
    let manager: EventManager;

    beforeEach(() => {
        manager = new EventManager();
    });

    it('should allow subscribing to events', () => {
        const callback = jest.fn();
        manager.subscribe('testEvent', callback);
        manager.publish('testEvent', { data: 'test' });
        expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should allow unsubscribing from events', () => {
        const callback = jest.fn();
        manager.subscribe('testEvent', callback);
        manager.unsubscribe('testEvent', callback);
        manager.publish('testEvent', { data: 'test' });
        expect(callback).not.toHaveBeenCalled();
    });
});
