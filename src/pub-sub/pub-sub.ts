type EventCallback = (data?: any) => void;

export class EventManager {
    private events: { [eventName: string]: EventCallback[] } = {};

    subscribe(eventName: string, callback: EventCallback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    unsubscribe(eventName: string, callback: EventCallback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    publish(eventName: string, data?: any) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => callback(data));
    }
}
