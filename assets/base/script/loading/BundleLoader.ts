import { assetManager } from 'cc';

/**
 * bundle資源讀取器
 */
export class BundleLoader {
    /**讀取完成通知註冊 */
    private static eventMap: Map<string, ((assets: any) => void)[]> = new Map();

    /**任務列表 */
    private taskList: LoadTask[] = [];

    /**已經讀取完成的bundle資源 */
    private static bundleResMap: Map<string, any> = new Map();

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

    /**
     * 新增task
     * @param bundleName 
     * @param dir 
     * @param type 
     */
    public add(bundleName: string, dir: string, type: any): void {
        this.taskList.push({ bundleName, dir, type });
    }

    /**
     * 開始讀取
     * @param waitAll 
     */
    public async load(waitAll: boolean = false): Promise<void> {
        if (waitAll) {
            //等待所有task讀取完成
            let promiseList = [];
            this.taskList.forEach((task) => {
                promiseList.push(this.loadTask(task));
            });
            await Promise.all(promiseList);
        }
        else {
            //載入單一task後立即結束
            this.taskList.forEach((task) =>  this.loadTask(task));
        }
    }

    /**
     * 讀取單一task
     * @param task 
     * @returns 
     */
    private async loadTask(task: LoadTask): Promise<void> {
        return new Promise<void>((res) => {
            let bundle = assetManager.getBundle(task.bundleName);

            let loadDir = () => {
                let langRes = {};
                bundle.loadDir(task.dir, task.type, (err, resource) => {
                    if (resource.length === 0) {
                        console.error(`${task.bundleName} ${task.dir} 內沒有資源!!!`);
                    }
                    else {
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
            }
            else {
                loadDir();
            }
        });
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
}
