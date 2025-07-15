export class Memoizer<T> {
    private isCached: boolean;
    private readonly getter: () => T;
    private cachedValue: T;

    constructor(getter: () => T) {
        this.getter = getter;
        this.isCached = true;
        this.cachedValue = getter();
    }

    public get(): T {
        if (!this.isCached) {
            this.cachedValue = this.getter();
            this.isCached = true;
            return this.cachedValue;
        }
        else {
            return this.cachedValue;
        }
    }

    public clear(): void {
        this.isCached = false;
    }
}