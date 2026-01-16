import { Asset, assetManager } from 'cc';

/**
 *
 */
export class BundleLoader {
  /**讀取完成通知註冊 */
  private static eventMap: Map<string, ((assets: any) => void)[]> = new Map();

  private taskList: LoadTask[] = [];

  /**已經讀取完成的bundle資源 */
  private static bundleResMap: Map<string, LangRes> = new Map();

  /**
   * 註冊讀取完成通知
   * @param bundle
   * @param dir
   * @param callback
   */
  public static onLoaded(bundle: string, dir: string, callback: (assets: any) => void): void {
    let key = bundle + '/' + dir;

    //已經讀取完畢
    if (BundleLoader.bundleResMap.has(key)) {
      callback(BundleLoader.bundleResMap.get(key));
    }
    //還沒讀取完畢
    else {
      if (!BundleLoader.eventMap.has(key)) {
        BundleLoader.eventMap.set(key, []);
      }
      BundleLoader.eventMap.get(key).push(callback);
    }
  }

  public add(bundle: string, dir: string, type: any): void {
    this.taskList.push({ bundleName: bundle, dir: dir, type: type });
  }

  /**
   * 開始讀取
   * @param waitAll
   */
  public async load(waitAll: boolean = false): Promise<void> {
    if (waitAll) {
      let promiseList = [];
      this.taskList.forEach((task) => {
        promiseList.push(this.loadTask(task));
      });
      await Promise.all(promiseList);
    } else {
      this.taskList.forEach((task) => this.loadTask(task));
    }
  }

  private async loadTask(task: LoadTask): Promise<void> {
    return new Promise<void>((res, rej) => {
      let bundle = assetManager.getBundle(task.bundleName);

      let loadDir = () => {
        let langRes: LangRes = {};
        bundle.loadDir(task.dir, task.type, (err, resource) => {
          if (resource.length === 0) {
            console.error(`${task.bundleName} ${task.dir} 內沒有資源!!!`);
            res();
          } else {
            resource.forEach((item) => {
              langRes[`${item.name}`] = item;
            });

            //廣播
            let key: string = task.bundleName + '/' + task.dir;
            if (BundleLoader.eventMap.has(key)) {
              BundleLoader.eventMap.get(key).forEach((callback) => {
                callback(langRes);
              });
            }
            BundleLoader.bundleResMap.set(key, langRes);
            BundleLoader.eventMap.delete(key);
            res();
          }
        });
      };

      //bundle都沒有的話, 要先讀取bundle
      if (!bundle) {
        assetManager.loadBundle(task.bundleName, () => {
          bundle = assetManager.getBundle(task.bundleName);
          loadDir();
        });
      } else {
        loadDir();
      }
    });
  }

  /**
   * 釋放bundle資源
   * @param key
   */
  public static release(key: string): void {
    const langRes = BundleLoader.bundleResMap.get(key);
    if (langRes) {
      for (const assetName in langRes) {
        const asset = langRes[assetName];
        if (asset) {
          assetManager.releaseAsset(asset);
        }
      }
      BundleLoader.bundleResMap.delete(key);
    }
  }
}

/**
 * 逾時定義
 */
export type LoadTask = {
  /**對應bundle */
  bundleName: string;
  /**language下路徑 */
  dir: string;
  /**格式 */
  type: any;
};

type LangRes = {
  [key: string]: Asset;
};
