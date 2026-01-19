import { Asset, assetManager } from 'cc';

/**
 * Bundle 資源加載器
 * 用於統一管理 bundle 資源的加載，支持進度回調和完成通知
 */
export class BundleLoader {
  // ==================== 靜態屬性 ====================

  /** 讀取完成通知註冊表 */
  private static eventMap: Map<string, ((assets: any) => void)[]> = new Map();

  /** 已經讀取完成的 bundle 資源緩存 */
  private static bundleResMap: Map<string, LangRes> = new Map();

  // ==================== 實例屬性 ====================

  /** 待加載的任務列表 */
  private taskList: LoadTask[] = [];

  // ==================== 公開方法 ====================

  /**
   * 註冊資源加載完成通知
   * @param bundle bundle 名稱
   * @param dir 資源目錄路徑
   * @param callback 加載完成回調函數
   */
  public static onLoaded(bundle: string, dir: string, callback: (assets: any) => void): void {
    const key = BundleLoader.getResourceKey(bundle, dir);

    // 如果資源已經加載完成，立即執行回調
    if (BundleLoader.bundleResMap.has(key)) {
      callback(BundleLoader.bundleResMap.get(key));
      return;
    }

    // 如果資源還在加載中，註冊回調等待完成
    if (!BundleLoader.eventMap.has(key)) {
      BundleLoader.eventMap.set(key, []);
    }
    BundleLoader.eventMap.get(key)!.push(callback);
  }

  /**
   * 添加加載任務
   * @param bundle bundle 名稱
   * @param dir 資源目錄路徑
   * @param type 資源類型
   */
  public add(bundle: string, dir: string, type: any): void {
    this.taskList.push({
      bundleName: bundle,
      dir: dir,
      type: type
    });
  }

  /**
   * 開始執行所有加載任務
   * @param onProgress 可選的進度回調函數
   * 參數: completedCount(已完成數量), totalCount(總數量), item(當前加載項)
   */
  public async load(onProgress?: (completedCount: number, totalCount: number, item: any) => void): Promise<void> {
    const promiseList = this.taskList.map((task) => this.loadTask(task, onProgress));
    await Promise.all(promiseList);

    // 清空任務列表，避免重複加載
    this.taskList = [];
  }

  /**
   * 釋放指定 bundle 資源
   * @param key 資源鍵值，格式: "bundleName/dir"
   */
  public static release(key: string): void {
    const langRes = BundleLoader.bundleResMap.get(key);
    if (!langRes) {
      return;
    }

    // 釋放所有資源
    for (const assetName in langRes) {
      const asset = langRes[assetName];
      if (asset) {
        assetManager.releaseAsset(asset);
      }
    }

    // 從緩存中移除
    BundleLoader.bundleResMap.delete(key);
  }

  // ==================== 私有方法 ====================

  /**
   * 載入單一任務
   * @param task 加載任務
   * @param onProgress 進度回調函數
   */
  private async loadTask(task: LoadTask, onProgress?: (completedCount: number, totalCount: number, item: any) => void): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let bundle = assetManager.getBundle(task.bundleName);

      // 執行目錄加載
      const loadDirectory = () => {
        const langRes: LangRes = {};

        bundle.loadDir(
          task.dir,
          task.type,
          onProgress, // 進度回調
          (err, resource) => {
            // 處理加載錯誤或空資源
            if (err || resource.length === 0) {
              console.error(`[BundleLoader] ${task.bundleName}/${task.dir} 內沒有資源或加載失敗!`, err);
              resolve();
              return;
            }

            // 將資源存入 Map
            resource.forEach((item) => {
              langRes[item.name] = item;
            });

            // 通知所有註冊的回調
            this.notifyCallbacks(task.bundleName, task.dir, langRes);

            // 緩存資源
            const key = BundleLoader.getResourceKey(task.bundleName, task.dir);
            BundleLoader.bundleResMap.set(key, langRes);

            resolve();
          }
        );
      };

      // 如果 bundle 不存在，先加載 bundle
      if (!bundle) {
        assetManager.loadBundle(task.bundleName, (err, loadedBundle) => {
          if (err || !loadedBundle) {
            console.error(`[BundleLoader] 無法加載 bundle: ${task.bundleName}`, err);
            reject(err);
            return;
          }
          bundle = loadedBundle;
          loadDirectory();
        });
      } else {
        loadDirectory();
      }
    });
  }

  /**
   * 通知所有註冊的回調函數
   * @param bundleName bundle 名稱
   * @param dir 資源目錄
   * @param assets 加載完成的資源
   */
  private notifyCallbacks(bundleName: string, dir: string, assets: LangRes): void {
    const key = BundleLoader.getResourceKey(bundleName, dir);
    const callbacks = BundleLoader.eventMap.get(key);

    if (callbacks) {
      callbacks.forEach((callback) => {
        callback(assets);
      });
      // 通知完成後清除回調列表
      BundleLoader.eventMap.delete(key);
    }
  }

  /**
   * 生成資源鍵值
   * @param bundle bundle 名稱
   * @param dir 資源目錄
   * @returns 資源鍵值
   */
  private static getResourceKey(bundle: string, dir: string): string {
    return `${bundle}/${dir}`;
  }
}

// ==================== 類型定義 ====================

/**
 * 加載任務定義
 */
export type LoadTask = {
  /** bundle 名稱 */
  bundleName: string;
  /** 資源目錄路徑 */
  dir: string;
  /** 資源類型 */
  type: any;
};

/**
 * 語言資源 Map
 */
type LangRes = {
  [key: string]: Asset;
};
