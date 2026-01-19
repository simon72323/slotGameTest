// import { SettingsPage1 } from 'db://assets/base/components/settingsPage/SettingsPage1';
// import { AudioKey } from 'db://assets/base/script/audio/AudioKey';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { BaseEvent } from 'db://assets/base/script/main/BaseEvent';
// import { SpinButtonState } from 'db://assets/base/script/types/BaseType';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { SkipUI } from '../../components/SkipUI/SkipUI';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameAudioKey, SlotMachineID } from '../constant/GameConst';
// import { gameData, gameTimeScale } from '../main/GameData';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { delay, XUtils } from 'db://assets/base/script/utils/XUtils';

// /**
//  * 老虎機停輪
//  */
// export class StopTask extends GameTask {
//   protected name: string = 'StopTask';

//   /**輪帶索引 */
//   // public rngList: number[];
//   /**停輪盤面 */
//   public newSymbolPattern: number[];
//   /**是否為scatter中獎 */
//   public isScatterWin: boolean = false;
//   /**是否為最後一盤 */
//   public isLastPlane: boolean = false;

//   async execute(): Promise<void> {
//     gameData().hasSkip = false;

//     //單軸停止
//     SlotMachine2.stopOnReel.on((id: number, col: number) => {
//       col == 0 && AudioManager.getInstance().play(GameAudioKey.reel_stop_1);
//       col == 1 && AudioManager.getInstance().play(GameAudioKey.reel_stop_2);
//       col == 2 && AudioManager.getInstance().play(GameAudioKey.reel_stop_3);
//       col == 3 && AudioManager.getInstance().play(GameAudioKey.reel_stop_4);
//       col == 4 && AudioManager.getInstance().play(GameAudioKey.reel_stop_5);
//       col == 5 && AudioManager.getInstance().play(GameAudioKey.reel_stop_6);
//       col == 6 && AudioManager.getInstance().play(GameAudioKey.reel_stop_7);
//     }, this);

//     //老虎機進場停止
//     SlotMachine2.fixedStop.emit(SlotMachineID.BS, this.newSymbolPattern, () => {
//       this.checkFinish();
//     });
//     //急停
//     BaseEvent.clickSkip.once(() => {
//       this.onSkip();
//     }, this);
//     SkipUI.show.emit();
//   }

//   /**檢查完成 */
//   private checkFinish(): void {
//     //公版規定, 停盤後Spin按鈕禁用
//     SettingsPage1.setSpinState.emit(SpinButtonState.Disabled);
//     BaseEvent.clickSkip.off(this);
//     SkipUI.hide.emit();
//     this.finish();
//   }

//   /**跳過 */
//   private onSkip(): void {
//     // UIBlack.hideChargeBlack.emit();//微微壓黑底消失(充能符號顯示時用)
//     gameData().hasSkip = true;
//     // SkipUI.hide.emit();
//     // BaseEvent.clickSkip.off(this);
//     SlotMachine2.fixedSkip.emit(SlotMachineID.BS, this.newSymbolPattern);
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
