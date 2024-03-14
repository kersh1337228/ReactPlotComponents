export type Callback = () => void | Promise<void>
export type Constructor<T extends {}> = new (...args: any[]) => T
