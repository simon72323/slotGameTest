// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';
// import { BaseSpinTask } from 'db://assets/base/script/tasks/BaseSpinTask';
// import { TaskManager } from 'db://assets/base/script/tasks/TaskManager';
// import { APIManager } from 'db://assets/base/script/utils/APIManager';
// import { BannerUI } from '../../components/BannerUI/BannerUI';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { GameAudioKey, SlotMachineID } from '../constant/GameConst';
// import { GameData } from '../main/GameData';
// import { IdleTask } from './IdleTask';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// /**
//  * 開始轉動
//  */
// export class SpinTask extends BaseSpinTask {
//   protected childExecute(): void {
//     //還原廣告狀態
//     BannerUI.reset.emit();

//     //重置scatter計數
//     BaseDataManager.getInstance().getData<GameData>().curScatterCount = 0;

//     //考量到先轉型、後轉型, 所以音效要在spin監聽
//     SlotMachine2.spinComplete.once((id) => {
//       AudioManager.getInstance().play(GameAudioKey.reel_spin);
//     }, this);
//     SlotMachine2.fixedSpin.emit(SlotMachineID.BS);

//     if (BaseDataManager.getInstance().isBS()) {
//       MultiplierUI.resetMultiplier.emit(); //重置倍率
//       CharacterUI.characterIdle.emit(); //回歸待機動畫
//       //先轉型(幸運一擊直接給結果不轉動)
//       // if (BaseDataManager.getInstance().buyFs === false && APIManager.getInstance().getSpinLate() === false) {
//       // SlotMachine2.fixedSpin.emit(SlotMachineID.BS);
//       // }
//     }
//   }

//   public childSpinFailed(): void {
//     if (BaseDataManager.getInstance().isBS() === true) {
//       TaskManager.getInstance().addTask(new IdleTask());
//     }
//   }
// }
