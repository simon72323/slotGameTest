// import { AudioKey } from 'db://assets/base/script/audio/AudioKey';
// import { BaseConst } from 'db://assets/base/script/constant/BaseConst';
// import { TimeoutManager } from 'db://assets/base/script/utils/TimeoutManager';
// import { AudioManager } from '../../../base/script/audio/AudioManager';
// import { BaseDataManager } from '../../../base/script/main/BaseDataManager';
// import { BaseEvent } from '../../../base/script/main/BaseEvent';
// import { GameTask } from '../../../base/script/tasks/GameTask';
// import { AutoPlayMode, ModuleID } from '../../../base/script/types/BaseType';
// import { BannerUI } from '../../components/BannerUI/BannerUI';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { TransUI } from '../../components/TransUI/TransUI';
// import { GameAudioKey } from '../constant/GameConst';
// import { gameData, GameData } from '../main/GameData';
// import { MultiplierUI } from '../../components/MultiplierUI/MultiplierUI';
// import { CharacterUI } from '../../components/CharacterUI/CharacterUI';
// import { BearTransUI } from '../../components/BearTransUI/BearTransUI';
// import { Symbol2 } from '../../components/slotMachine2/Symbol2';
// import { CharacterTopUI } from '../../components/CharacterUI/CharacterTopUI';
// import { ReelBgUI } from '../../components/ReelBgUI/ReelBgUI';
// import { FreeSpinTimes } from '../../components/FreeSpinTimes/FreeSpinTimes';

// /**
//  * 轉場
//  */
// export class TransTask extends GameTask {
//   protected name: string = 'TransTask';
//   /**轉場目標 */
//   public to: ModuleID;
//   /**次數 */
//   public times: number;
//   /**超級scatter數量 */
//   public superScatterCount: number;

//   execute(): void {
//     BaseDataManager.getInstance().curModuleID = BaseDataManager.getInstance().nextModuleID;

//     //中免費轉停止
//     if (
//       BaseDataManager.getInstance().auto.isAutoPlay() === true &&
//       BaseDataManager.getInstance().auto.mode === AutoPlayMode.tillBonus
//     ) {
//       BaseDataManager.getInstance().auto.stopAuto();
//     }

//     //轉場狀態
//     BaseDataManager.getInstance().setState(s5g.game.proto.ESTATEID.K_FEATURE_TRIGGER); //轉場
//     BaseDataManager.getInstance().setState(s5g.game.proto.ESTATEID.K_FEATURE_SHOWSCATTERWIN); //顯示scatter中獎
//     BaseDataManager.getInstance().setState(s5g.game.proto.ESTATEID.K_FEATURE_TRANSLATE); //轉場

//     const isSuperWin = this.superScatterCount > 0;
//     //小熊跳出並出現火箭轉場

//     BearTransUI.show.emit(isSuperWin, () => {
//       AudioManager.getInstance().play(GameAudioKey.free_game_transition_2);
//       CharacterTopUI.hideBlack.emit();
//       //轉場淡入
//       TransUI.fadeIn.emit(
//         this.times,
//         () => {
//           //轉場全遮(更換場景資源)
//           BaseEvent.changeScene.emit(ModuleID.FS);
//           Symbol2.resetHideWin.emit(); //重置隱藏圖示
//           !isSuperWin && ReelBgUI.showReelBg.emit(1); //切換reelBg
//           MultiplierUI.resetMultiplier.emit();
//           //還原廣告狀態
//           BannerUI.reset.emit();
//           FreeSpinTimes.refreshRemainTimes.emit(this.times);
//           //初始化盤面
//           let stripTable = BaseDataManager.getInstance().getStripTable()._strips;
//           gameData().slotParser.setStripTable(stripTable, gameData().fsInitRng, null);
//           SlotMachine2.setup.emit(0, gameData().slotParser);
//         },
//         () => {
//           //點擊轉場按鈕
//           TransUI.click.once(() => {
//             AudioManager.getInstance().play(GameAudioKey.free_game_start);
//             // console.log('點擊轉場按鈕');
//             this.onTransEnd();
//           }, this);
//         },
//       );
//       //10秒後自動進入
//       TimeoutManager.getInstance().register(
//         BaseConst.TIMEOUT_FEATURE_WAIT_START.key,
//         BaseConst.TIMEOUT_FEATURE_WAIT_START.seconds,
//         () => {
//           this.onTransEnd();
//         },
//       );
//     });
//   }

//   /**
//    * 轉場結束
//    */
//   private onTransEnd(): void {
//     AudioManager.getInstance().stop(GameAudioKey.free_game_transition_2, 0.2);
//     TimeoutManager.getInstance().remove(BaseConst.TIMEOUT_FEATURE_WAIT_START.key);
//     TransUI.click.off(this);
//     //轉場結束
//     TransUI.fadeOut.emit(() => {
//       AudioManager.getInstance().play(AudioKey.FsMusic);
//       if (this.superScatterCount > 0) {
//         MultiplierUI.superBuyMultiplier.emit(this.superScatterCount);
//       }
//       CharacterUI.characterStart.emit();
//       this.finish();
//     });
//   }

//   update(deltaTime: number): void {
//     // throw new Error("Method not implemented.");
//   }
// }
