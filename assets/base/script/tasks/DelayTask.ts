// import { GameTask } from '@common/script/tasks/GameTask';

// /**
//  * 等待任務
//  */
// export class DelayTask extends GameTask {

//     /**任務名稱 */
//     protected name: string = 'DelayTask';

//     /**等待秒數 */
//     public delaySeconds: number;

//     /**
//      * 建構函數
//      * @param delaySeconds 等待秒數
//      */
//     constructor(delaySeconds: number) {
//         super();
//         this.delaySeconds = delaySeconds;
//     }

//     /**執行 */
//     execute(): void {
//         setTimeout(() => {
//             this.finish();
//         }, 1000 * this.delaySeconds);
//     }

//     /**持續更新 */
//     update(_deltaTime: number): void {
//         // throw new Error('Method not implemented.');
//     }
// }