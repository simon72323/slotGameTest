import { Logger } from '../utils/Logger';

/**
 * 逾時處理器
 */
export class TimeoutManager {
  private static instance: TimeoutManager;
  public static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  private timeoutMap: Map<string, { key: number; callback: Function }> = new Map();
  /**
   *
   * @param seconds 秒數
   * @param callback
   */
  public register(name: string, seconds: number, callback: Function): void {
    if (this.timeoutMap.has(name)) {
      this.remove(name);
    }
    let timeout = setTimeout(callback, seconds * 1000);
    this.timeoutMap.set(name, { key: timeout, callback: callback });
  }

  /**
   *
   * @param name
   */
  public remove(name: string): void {
    let timeout = this.timeoutMap.get(name);
    if (timeout) {
      clearTimeout(timeout.key);
      this.timeoutMap.delete(name);
    } else {
      Logger.log(`TimeoutManager找不到對應的key = ${name}`);
    }
  }
}
