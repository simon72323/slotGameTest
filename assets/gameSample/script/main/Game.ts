// import { _decorator, instantiate, Node, Prefab, randomRangeInt, SpriteFrame } from 'cc';
// import { CHEAT } from 'cc/userland/macro';
// import { CheatUI } from 'db://assets/base/components/cheat/CheatUI';
// import { AudioKey } from 'db://assets/base/script/audio/AudioKey';
// import { BaseConst } from 'db://assets/base/script/constant/BaseConst';
// import { BaseEvent } from 'db://assets/base/script/main/BaseEvent';
// import { CheatCodeData } from 'db://assets/base/script/types/BaseType';
// import { AudioManager } from '../../../base/script/audio/AudioManager';
// import { BaseDataManager } from '../../../base/script/main/BaseDataManager';
// import { GameMain } from '../../../base/script/main/GameMain';
// import { BigWinUI } from '../../components/BigWinUI/BigWinUI';
// import { FSSettleUI } from '../../components/FSSettleUI/FSSettleUI';
// import { TransUI } from '../../components/TransUI/TransUI';
// import { GameAudioKey, GameBundleDir, LangBundleDir } from '../constant/GameConst';
// import { GameData } from './GameData';
// import { MessageHandler } from './MessageHandler';
// import { SlotMachine2 } from '../../components/slotMachine2/base/slotMachine2/SlotMachine2';
// import { SlotReelConfig2 } from '../../components/slotMachine2/base/slotMachine2/SlotType2';
// import { Symbol2 } from '../../components/slotMachine2/Symbol2';
// import { CheatChangeLang } from 'db://assets/base/components/cheat/CheatChangeLang';
// import { BundleLoader } from 'db://assets/base/script/main/BundleLoader';
// import { IdleTask } from '../task/IdleTask';
// import { RetriggerUI } from '../../components/RetriggerUI/RetriggerUI';
// const { ccclass, property } = _decorator;

// /**
//  * 遊戲主程式
//  */
// @ccclass('Game')
// export class Game extends GameMain {
//   /**
//    * 子類別資料載入實作
//    */
//   childOnLoad() {
//     /**設定全畫面節點 */
//     this.node.getChildByName('fullScreen').children.forEach((child) => {
//       this.fullScreenList.push(child);
//     });

//     //設定遊戲資料
//     BaseDataManager.getInstance().setData(new GameData());

//     //註冊封包處理
//     MessageHandler.getInstance().initialize();

//     //註冊語系資源(註冊完畢後GameMain會呼叫startLoadLanguage)
//     {
//       let lang: string = BaseDataManager.getInstance().urlParam.lang;
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.banner}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.bigwin}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.board}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.bs}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.featureBuy}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.fs}`, SpriteFrame);
//       this.loadLanguage(BaseConst.BUNDLE_LANGUAGE, `${lang}/${LangBundleDir.paytable}`, SpriteFrame);
//     }

//     //mg背景音不後載
//     const mgAudioNode = this.node.getChildByPath('audioMGNode');
//     AudioManager.getInstance().initialize(mgAudioNode);
//     AudioManager.getInstance().register(AudioKey.BsMusic, 'game_bgm/bgm_main_game_loop');
//   }

//   /**
//    * 後載資源
//    */
//   childPostponeLoad(): void {
//     /**後載音效資源 */
//     BundleLoader.onLoaded(BaseConst.BUNDLE_BASE_GAME.game, `${GameBundleDir.audio}`, (langRes: any) => {
//       let audioNode = instantiate(langRes[Object.keys(langRes)[0]]);
//       this.node.addChild(audioNode);
//       this.registerAudio(audioNode);

//       if (IdleTask.firstIn === false) {
//         if (BaseDataManager.getInstance().isBS() === false) {
//           AudioManager.getInstance().play(AudioKey.FsMusic, 1, 0.5);
//         }
//       }
//     });

//     //後載音效
//     let audio = new BundleLoader();
//     audio.add(BaseConst.BUNDLE_BASE_GAME.game, GameBundleDir.audio, Prefab);
//     audio.load(true);
//   }

//   /**
//    * 密技
//    */
//   childOnStart() {
//     if (CHEAT) {
//       //註冊密技語系資料夾
//       CheatChangeLang.setLangDir.emit([
//         LangBundleDir.banner,
//         LangBundleDir.bigwin,
//         LangBundleDir.board,
//         LangBundleDir.bs,
//         LangBundleDir.featureBuy,
//         LangBundleDir.fs,
//         LangBundleDir.paytable,
//       ]);

//       function registerRNGButton(title: string, rng: number[]): void {
//         CheatUI.registerButton.emit('SuperWin', 'RNG', title, () => {
//           let data = new CheatCodeData();
//           data.rngList = [rng];
//           BaseDataManager.getInstance().cheatCodeData = data;
//           CheatUI.hide.emit();
//         });
//       }

//       //密技
//       CheatUI.registerButton.emit('SuperWin', 'UI', '轉場', () => {
//         let times = 10;
//         TransUI.fadeIn.emit(
//           times,
//           () => {},
//           () => {
//             this.scheduleOnce(() => {
//               TransUI.fadeOut.emit(() => {});
//             }, 3);
//           },
//         );
//         CheatUI.hide.emit();
//       });

//       //密技
//       CheatUI.registerButton.emit('SuperWin', 'UI', 'retrigger', () => {
//         let times = 10;
//         const FSUI = this.node.getChildByPath('gameMain/FSUI');
//         FSUI.active = true;
//         RetriggerUI.show.emit(times);
//         this.scheduleOnce(() => {
//           RetriggerUI.hide.emit();
//           FSUI.active = !BaseDataManager.getInstance().isBS();
//         }, 3);
//         CheatUI.hide.emit();
//       });

//       CheatUI.registerButton.emit('SuperWin', 'UI', 'BW', () => {
//         BigWinUI.show.emit(randomRangeInt(1000, 100000));
//         // BigWinUI.show.emit(650);
//         CheatUI.hide.emit();
//       });

//       CheatUI.registerButton.emit('SuperWin', 'UI', '顯示SymID', () => {
//         Symbol2.showIdLabel.emit();
//         CheatUI.hide.emit();
//       });

//       CheatUI.registerButton.emit('SuperWin', 'FS', '結算', () => {
//         FSSettleUI.show.emit(
//           randomRangeInt(1000, 100000),
//           () => {},
//           () => {},
//         );
//         CheatUI.hide.emit();
//       });

//       CheatUI.registerButton.emit('SuperWin', 'FS', '結算0分', () => {
//         FSSettleUI.show.emit(
//           0,
//           () => {},
//           () => {},
//         );
//         CheatUI.hide.emit();
//       });

//       /**
//        * 註冊假資料
//        * @param title 標題
//        * @param data 假資料
//        */
//       function registerFakeData(title: string, data: string, fsType?: number): void {
//         CheatUI.registerButton.emit('SuperWin', 'FAKE_DATA', title, () => {
//           MessageHandler.fakeData.emit(data);
//           if (fsType !== undefined) {
//             BaseDataManager.getInstance().featureBuyType = fsType;
//             BaseEvent.buyFeature.emit();
//           }
//           CheatUI.hide.emit();
//         });
//       }
//       // let fakeData3SC =
//       //   '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"25","rng":[161,14,161,62,97,52,49],"win_line_group":[{"win_line_type":"kXTotalBetTrigger","line_no":255,"symbol_id":30,"pos":[6,12,27],"credit":0,"multiplier":1,"credit_long":"0"},{"win_line_type":"kXTotalBet","line_no":255,"symbol_id":3,"pos":[43,44,45,53,55,56,57],"credit":20,"multiplier":1,"credit_long":"20"}],"win_bonus_group":[{"module_id":"FS","times":10}],"sub_result":[{"sub_game_id":0,"credit":"5","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":12,"pos":[32,33,42,43,44],"credit":5,"multiplier":1,"credit_long":"5"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"bonus_multiplier_list":[1],"external_multiplier":1,"full_symbol_pattern":[2,3,11,1,12,3,2,2,30,1,12,4,2,2,3,2,11,12,3,3,4,2,3,4,1,3,4,2,4,1,4,13,3,3,4,30,13,4,13,2,3,2,3,1,30,1,2,3,1],"total_star_times":[{"times":[2,3,11,1,2,3,2,2,30,1,12,12,3,2,3,2,11,12,12,4,4,2,3,4,1,12,3,2,4,1,4,13,4,3,4,30,13,4,13,2,2,2,3,1,30,1,2,4,1]},{"times":[2,3,11,3,1,3,2,2,30,1,11,12,3,2,3,2,11,1,1,4,4,2,3,4,1,2,3,2,4,1,4,13,4,3,4,30,13,4,13,2,2,2,3,1,30,1,2,4,1]}],"multiplier_info":{"layouts":[{},{"positions":[18,19,25,32,33,40,47],"multiplier":[1,1,1,1,1,1,1]},{"positions":[10,11,17,18,19,25,32,33,40,47],"multiplier":[1,1,1,2,1,2,1,1,1,1]}]},"is_win_capped":false},"player_cent":"1098000","next_module":"FS","cur_module_play_times":1,"cur_module_total_times":1}';
//       // registerFakeData('3SC', fakeData3SC, 0);
//       // let fakeData2GSC =
//       //   '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"1000","rng":[52,40,125,150,1,88,5],"win_line_group":[{"win_line_type":"kXTotalBetTrigger","line_no":255,"symbol_id":30,"pos":[56],"credit":0,"multiplier":1,"credit_long":"0"},{"win_line_type":"kXTotalBetTrigger","line_no":255,"symbol_id":31,"pos":[36,63],"credit":1000,"multiplier":1,"credit_long":"1000"}],"win_bonus_group":[{"module_id":"BFS2","times":10},{"module_id":"BFS2","times":0}],"strip_index":0,"bonus_multiplier_list":[1,1],"external_multiplier":1,"full_symbol_pattern":[12,1,2,1,2,11,12,12,13,2,11,12,3,4,4,11,12,11,4,11,31,2,3,4,3,4,3,4,4,13,12,13,12,13,12,4,3,2,31,4,30,12,2,13,12,13,4,11,2],"multiplier_info":{"layouts":[{}]},"is_win_capped":false},"player_cent":"700000","next_module":"BFS2","cur_module_play_times":1,"cur_module_total_times":1}';
//       // registerFakeData('2金SC', fakeData2GSC, 1);
//       // let fakeData3GSC =
//       //   '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"5000","rng":[88,104,167,76,79,65,7],"win_line_group":[{"win_line_type":"kXTotalBetTrigger","line_no":255,"symbol_id":31,"pos":[3,23,61],"credit":5000,"multiplier":1,"credit_long":"5000"}],"win_bonus_group":[{"module_id":"BFS2","times":10}],"strip_index":0,"bonus_multiplier_list":[1],"external_multiplier":1,"full_symbol_pattern":[4,13,12,13,12,1,31,4,11,4,1,2,13,4,31,1,31,1,2,13,12,2,11,2,11,12,1,12,2,1,2,11,4,11,2,12,1,12,3,12,1,12,12,11,4,13,4,11,12],"multiplier_info":{"layouts":[{}]},"is_win_capped":false},"player_cent":"700000","next_module":"BFS2","cur_module_play_times":1,"cur_module_total_times":1}';
//       // registerFakeData('3金SC', fakeData3GSC, 1);
//       let fakeDataWin1 =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"25","rng":[89,8,1,79,114,61,34],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[12,22,23,24,25,35],"credit":10,"multiplier":1,"credit_long":"10"},{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[3,4,5,15,16,17],"credit":15,"multiplier":1,"credit_long":"15"}],"sub_result":[{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[2,2,30,2,12,1,12,2,4,4,2,1,13,1,3,11,4,3,12,1,11,3,11,4,3,12,11,1,3,3,4,4,1,11,12,4,3,12,12,2,1,3,4,3,12,12,2,13,3],"total_star_times":[{"times":[4,13,11,3,12,1,12,13,1,4,2,1,13,1,13,3,4,2,12,1,11,2,2,4,3,12,11,1,2,2,30,3,1,11,12,4,11,12,12,2,1,3,4,11,12,12,2,13,3]}],"multiplier_info":{"layouts":[{},{"positions":[8,9,14,16,21,23,28,29,30,31,36,43],"multiplier":[1,1,1,1,1,1,1,1,1,1,1,1]}]},"is_win_capped":false},"player_cent":"1075000","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('消1', fakeDataWin1);
//       let fakeDataWin2 =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"28","rng":[8,95,60,140,11,120,141],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[17,26,27,36,37],"credit":10,"multiplier":1,"credit_long":"10"}],"sub_result":[{"sub_game_id":0,"credit":"18","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[3,11,12,13,21],"credit":10,"multiplier":1,"credit_long":"10"},{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[31,41,42,43,52],"credit":8,"multiplier":1,"credit_long":"8"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[2,3,4,13,4,3,11,2,3,2,1,4,4,11,3,2,3,13,4,2,11,4,3,3,13,3,2,2,2,3,2,1,4,3,4,11,11,3,3,2,3,2,4,3,3,3,12,3,4],"total_star_times":[{"times":[2,3,3,4,4,3,11,2,3,2,3,4,4,11,3,3,4,13,4,2,11,4,2,2,1,3,2,2,2,3,3,13,4,3,4,11,3,3,13,2,3,2,4,11,2,1,12,3,4]},{"times":[2,3,12,1,12,11,11,2,3,2,3,2,3,11,2,11,4,13,12,2,11,4,2,2,1,3,2,2,2,3,3,13,4,3,4,11,3,3,13,2,3,2,4,11,2,1,12,3,4]}],"multiplier_info":{"layouts":[{},{"positions":[37,38,43,44,45],"multiplier":[1,1,1,1,1]},{"positions":[1,2,3,4,8,11,12,14,15,18,37,38,43,44,45],"multiplier":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}]},"is_win_capped":false},"player_cent":"1065400","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('消2', fakeDataWin2);
//       let fakeDataWin3 =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"58","rng":[107,72,26,94,121,142,125],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[3,4,6,7,14,15,16,24],"credit":20,"multiplier":1,"credit_long":"20"}],"sub_result":[{"sub_game_id":0,"credit":"8","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[13,23,31,32,33],"credit":8,"multiplier":1,"credit_long":"8"}]},{"sub_game_id":0,"credit":"30","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":2,"pos":[11,12,13,21,23,24,31,41],"credit":30,"multiplier":1,"credit_long":"30"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[2,12,2,4,2,4,11,2,12,4,4,3,4,1,4,3,2,4,2,3,13,4,4,4,3,13,3,1,2,4,3,3,13,1,3,4,4,2,2,4,12,3,4,3,2,1,4,12,2],"total_star_times":[{"times":[12,2,13,4,2,4,11,12,2,2,4,3,4,1,3,4,4,4,2,3,13,3,12,2,3,13,3,1,2,12,3,3,13,1,3,2,3,2,2,4,12,3,2,3,2,1,4,12,2]},{"times":[12,2,2,2,2,4,11,12,2,13,13,3,4,1,3,2,2,13,2,3,13,3,12,2,3,13,3,1,2,12,3,3,13,1,3,2,3,2,2,4,12,3,2,3,2,1,4,12,2]},{"times":[12,13,4,3,2,4,11,12,1,4,13,3,4,1,3,3,2,13,2,3,13,3,12,13,3,13,3,1,2,12,3,3,13,1,3,2,3,2,2,4,12,3,2,3,2,1,4,12,2]}],"multiplier_info":{"layouts":[{},{"positions":[14,21,22,23,29,35,36,42],"multiplier":[1,1,1,1,1,1,1,1]},{"positions":[3,10,14,15,16,17,21,22,23,29,35,36,42],"multiplier":[1,1,1,1,1,1,1,1,1,1,1,1,1]},{"positions":[1,2,3,4,8,10,14,15,16,17,21,22,23,29,35,36,42],"multiplier":[1,1,2,1,1,1,1,2,2,1,1,1,2,1,1,1,1]}]},"is_win_capped":false},"player_cent":"1061400","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('消3', fakeDataWin3);
//       let fakeDataWin4 =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"116","rng":[110,18,157,142,40,57,22],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":12,"pos":[42,43,53,54,63,64],"credit":6,"multiplier":1,"credit_long":"6"}],"sub_result":[{"sub_game_id":0,"credit":"20","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[32,33,41,42,52,53,54],"credit":20,"multiplier":1,"credit_long":"20"}]},{"sub_game_id":0,"credit":"50","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":2,"pos":[33,34,35,42,43,45,52],"credit":25,"multiplier":2,"credit_long":"50"}]},{"sub_game_id":0,"credit":"40","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[34,35,43,44,45,54],"credit":10,"multiplier":4,"credit_long":"40"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[4,1,13,2,2,3,12,2,13,1,3,12,3,1,4,1,12,3,12,12,12,4,13,1,2,4,12,12,2,13,11,2,2,1,1,11,1,1,1,11,13,12,1,12,11,13,2,1,1],"total_star_times":[{"times":[4,1,13,2,3,4,13,2,13,1,3,3,3,1,4,1,12,3,2,3,12,4,13,1,2,4,3,1,2,13,11,2,2,1,1,11,1,1,1,11,13,12,1,12,11,13,2,1,1]},{"times":[4,1,13,4,4,3,13,2,13,1,4,2,2,1,4,1,12,2,2,3,12,4,13,1,2,4,4,1,2,13,11,2,2,1,1,11,1,1,1,11,13,12,1,12,11,13,2,1,1]},{"times":[4,1,13,4,13,3,13,2,13,1,4,13,3,1,4,1,12,3,4,3,12,4,13,1,4,4,4,1,2,13,11,4,4,1,1,11,1,1,1,11,13,12,1,12,11,13,2,1,1]},{"times":[4,1,13,1,2,4,13,2,13,1,11,11,3,1,4,1,12,4,3,3,12,4,13,1,4,13,3,1,2,13,11,3,13,1,1,11,1,1,1,11,13,12,1,12,11,13,2,1,1]}],"multiplier_info":{"layouts":[{},{"positions":[11,18,19,20,26,27],"multiplier":[1,1,1,1,1,1]},{"positions":[4,10,11,12,17,18,19,20,26,27],"multiplier":[1,1,2,1,1,1,2,1,2,1]},{"positions":[4,10,11,12,17,18,19,20,24,26,27,31,32],"multiplier":[1,1,4,2,2,2,2,1,1,2,1,1,1]},{"positions":[4,10,11,12,17,18,19,20,24,25,26,27,31,32],"multiplier":[1,1,4,2,2,4,2,1,2,1,4,1,2,2]}]},"is_win_capped":false},"player_cent":"1069500","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('消4', fakeDataWin4);
//       let fakeDataWin5 =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"616","rng":[44,87,68,123,108,56,44],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[51,52,53,63,64],"credit":10,"multiplier":1,"credit_long":"10"},{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[23,24,25,33,34],"credit":10,"multiplier":1,"credit_long":"10"}],"sub_result":[{"sub_game_id":0,"credit":"16","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":13,"pos":[22,23,31,32,33,41,43,44],"credit":8,"multiplier":1,"credit_long":"8"},{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[15,16,24,25,26],"credit":8,"multiplier":1,"credit_long":"8"}]},{"sub_game_id":0,"credit":"40","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":1,"pos":[33,34,43,44,45],"credit":20,"multiplier":2,"credit_long":"40"}]},{"sub_game_id":0,"credit":"240","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":2,"pos":[22,23,24,31,32,41,42,43,51],"credit":40,"multiplier":6,"credit_long":"240"}]},{"sub_game_id":0,"credit":"300","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":3,"pos":[21,22,32,41,42,43,51,52],"credit":25,"multiplier":12,"credit_long":"300"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[4,3,4,13,13,3,4,2,11,4,1,1,3,4,11,11,3,3,13,3,3,1,11,3,3,13,12,3,11,4,3,2,1,12,12,1,4,4,2,12,1,2,11,3,3,3,12,13,2],"total_star_times":[{"times":[4,3,4,13,13,2,4,2,11,13,13,1,3,2,11,11,13,13,13,4,4,1,11,4,1,13,12,4,11,4,4,2,1,12,12,1,4,4,2,12,1,2,11,3,3,3,12,13,2]},{"times":[4,4,4,1,4,2,4,2,4,2,11,2,3,2,11,3,2,1,1,4,4,1,11,2,1,1,12,4,11,11,3,2,1,12,12,1,11,4,2,12,1,2,11,3,3,3,12,13,2]},{"times":[4,4,4,2,2,2,4,2,4,2,2,2,3,2,11,3,2,1,2,4,4,1,11,2,11,4,12,4,11,11,3,2,2,12,12,1,11,4,2,12,1,2,11,3,3,3,12,13,2]},{"times":[4,4,3,4,3,3,4,2,4,3,3,3,3,2,11,3,2,1,3,4,4,1,11,4,11,4,12,4,11,11,3,2,2,12,12,1,11,4,2,12,1,2,11,3,3,3,12,13,2]},{"times":[4,4,4,1,11,4,4,2,4,12,4,1,13,2,11,3,2,1,12,4,4,1,11,4,11,4,12,4,11,11,3,2,2,12,12,1,11,4,2,12,1,2,11,3,3,3,12,13,2]}],"multiplier_info":{"layouts":[{},{"positions":[5,12,16,17,19,20,23,24,27,30],"multiplier":[1,1,1,1,1,1,1,1,1,1]},{"positions":[3,4,5,9,10,12,16,17,18,19,20,23,24,25,27,29,30,36,37],"multiplier":[1,1,1,1,1,1,2,2,1,1,1,2,1,1,1,1,2,1,1]},{"positions":[3,4,5,9,10,12,16,17,18,19,20,23,24,25,27,29,30,32,36,37],"multiplier":[1,1,1,1,1,1,2,4,2,1,1,2,2,2,1,1,2,1,1,1]},{"positions":[3,4,5,9,10,11,12,16,17,18,19,20,23,24,25,27,29,30,32,36,37],"multiplier":[2,2,2,2,2,1,1,4,4,4,1,1,4,2,2,1,1,2,1,1,1]},{"positions":[2,3,4,5,9,10,11,12,16,17,18,19,20,23,24,25,27,29,30,32,36,37],"multiplier":[1,2,4,4,4,4,2,2,4,4,8,1,1,4,2,2,1,1,2,1,1,1]}]},"is_win_capped":false},"player_cent":"1020800","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('消5', fakeDataWin5);
//       let fakeDataMi =
//         '{"msgid":"eResultRecall","status_code":"kSuccess","result":{"module_id":"BS","credit":"80","rng":[142,70,164,52,140,14,164],"win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":4,"pos":[6,16,17,25,26,27,37,46,47,56,57],"credit":60,"multiplier":1,"credit_long":"60"}],"sub_result":[{"sub_game_id":0,"credit":"20","win_line_group":[{"win_line_type":"kCommon","line_no":255,"symbol_id":2,"pos":[1,2,3,11,12,13],"credit":20,"multiplier":1,"credit_long":"20"}]},{"sub_game_id":0,"credit":"0"}],"strip_index":0,"external_multiplier":1,"full_symbol_pattern":[2,2,4,3,12,2,13,2,4,4,2,3,3,3,3,12,4,2,4,4,30,4,12,30,2,12,2,4,2,3,4,11,2,3,4,4,4,4,11,4,4,3,2,4,4,4,4,4,3],"total_star_times":[{"times":[2,2,11,4,4,2,13,2,2,1,3,4,3,3,2,2,11,2,12,2,30,3,4,4,2,3,3,4,4,12,4,2,4,4,4,2,12,4,11,12,2,3,2,3,30,11,2,3,3]},{"times":[1,13,11,4,4,2,13,3,1,1,3,4,3,3,3,3,11,2,12,2,30,3,4,4,2,3,3,4,4,12,4,2,4,4,4,2,12,4,11,12,2,3,2,3,30,11,2,3,3]}],"multiplier_info":{"layouts":[{},{"positions":[30,35,36,37,39,40,43,44,45,46,47],"multiplier":[1,1,1,1,1,1,1,1,1,1,1]},{"positions":[0,1,7,8,14,15,30,35,36,37,39,40,43,44,45,46,47],"multiplier":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}]},"is_win_capped":false},"player_cent":"1080900","next_module":"BS","cur_module_play_times":1,"cur_module_total_times":1}';
//       registerFakeData('瞇牌掉', fakeDataMi);

//       //註冊RNG
//       registerRNGButton('3SC', [1, 48, 3, 113, 135, 30, 23, 176]);
//       registerRNGButton('1金SC', [1, 48, 3, 113, 135, 30, 23, 176, 1]);
//       registerRNGButton('2金SC', [1, 48, 3, 113, 135, 30, 23, 176, 2]);
//       registerRNGButton('3金SC', [1, 48, 3, 113, 135, 30, 23, 176, 3]);
//       registerRNGButton('頂倍1', [3, 131, 123, 136, 60, 14, 28, 117]);
//       registerRNGButton('頂倍2', [3, 101, 54, 1, 60, 120, 1, 17]);
//       registerRNGButton('x1000', [3, 92, 118, 143, 42, 124, 16, 83]);
//       registerRNGButton('x2000', [3, 51, 122, 34, 24, 79, 98, 101]);

//       let speedConfig = (
//         this.node.getChildByPath('gameMain/ReelsNode/ReelController').getComponent(SlotMachine2)[
//           'config'
//         ] as SlotReelConfig2
//       ).speedConfigList[0];
//       CheatUI.registerSlider.emit('節奏', 'Slot', '啟動間隔', [0, 1, speedConfig.spinInterval], (value) => {
//         speedConfig.spinInterval = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '啟動時間', [0, 1, speedConfig.beginCurveTime], (value) => {
//         speedConfig.beginCurveTime = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '循環時間', [0, 1, speedConfig.loopCurveTime], (value) => {
//         speedConfig.loopCurveTime = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '滾動時間', [0, 1, speedConfig.spinTime], (value) => {
//         speedConfig.spinTime = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '結束時間', [0, 1, speedConfig.endCurveTime], (value) => {
//         speedConfig.endCurveTime = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '掉落間隔', [0, 1, speedConfig.dropInterval], (value) => {
//         speedConfig.dropInterval = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '掉落時間', [0, 1, speedConfig.dropTime], (value) => {
//         speedConfig.dropTime = value;
//       });
//       CheatUI.registerSlider.emit('節奏', 'Slot', '瞇牌時間', [0, 3, speedConfig.slowMotionBeginTime], (value) => {
//         speedConfig.slowMotionBeginTime = value;
//       });
//     }
//   }

//   /**
//    * 註冊音效
//    * @param audioNode 音效節點
//    */
//   private registerAudio(audioNode: Node): void {
//     AudioManager.getInstance().initialize(audioNode);

//     AudioManager.getInstance().register(AudioKey.BtnClick, 'base_sfx/BtnClick');
//     AudioManager.getInstance().register(AudioKey.TurboClick, 'base_sfx/TurboClick');
//     AudioManager.getInstance().register(AudioKey.BetClick, 'base_sfx/BetClick');
//     AudioManager.getInstance().register(AudioKey.CheckClick, 'base_sfx/CheckClick');
//     AudioManager.getInstance().register(AudioKey.FestBet, 'base_sfx/FestBet');

//     //BGM
//     // AudioManager.getInstance().register(AudioKey.BsMusic, "game_bgm/bgm_main_game_loop");
//     AudioManager.getInstance().register(AudioKey.FsMusic, 'game_bgm/bgm_free_game_loop');
//     // AudioManager.getInstance().register(GameAudioKey.noBtn, "game_bgm/noBtn");
//     // AudioManager.getInstance().register(AudioKey.WinRolling, "game_bgm/cs");

//     //BigWin
//     AudioManager.getInstance().register(AudioKey.BigWin, 'game_sfx/sfx_big_win');
//     AudioManager.getInstance().register(AudioKey.MegaWin, 'game_sfx/sfx_mega_win');
//     AudioManager.getInstance().register(AudioKey.SuperWin, 'game_sfx/sfx_super_win');
//     // AudioManager.getInstance().register(AudioKey.UltraWin, "game_sfx/UW");
//     // AudioManager.getInstance().register(AudioKey.UltimateWin, "game_sfx/EW");
//     AudioManager.getInstance().register(AudioKey.SpinClick, 'game_sfx/sfx_spin_click');
//     // AudioManager.getInstance().register(AudioKey.ReelStop, "game_sfx/stop");
//     AudioManager.getInstance().register(AudioKey.WinEnd, 'game_sfx/sfx_big_win_end');

//     //滾輪
//     AudioManager.getInstance().register(GameAudioKey.board_waiting, 'game_sfx/sfx_board_waiting');
//     AudioManager.getInstance().register(GameAudioKey.board_spin, 'game_sfx/sfx_board_spin');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_1, 'game_sfx/sfx_reel_stop_1');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_2, 'game_sfx/sfx_reel_stop_2');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_3, 'game_sfx/sfx_reel_stop_3');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_4, 'game_sfx/sfx_reel_stop_4');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_5, 'game_sfx/sfx_reel_stop_5');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_6, 'game_sfx/sfx_reel_stop_6');
//     AudioManager.getInstance().register(GameAudioKey.reel_stop_7, 'game_sfx/sfx_reel_stop_7');
//     AudioManager.getInstance().register(GameAudioKey.board_fill, 'game_sfx/sfx_board_fill');

//     //倍率音效
//     AudioManager.getInstance().register(GameAudioKey.multiplier_combine, 'game_sfx/sfx_multiplier_combine');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_1_win, 'game_sfx/sfx_multiplier_up_1_win');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_2_win, 'game_sfx/sfx_multiplier_up_2_win');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_3_upto, 'game_sfx/sfx_multiplier_up_3_upto');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_3_loop, 'game_sfx/sfx_multiplier_up_3_loop');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_3_win, 'game_sfx/sfx_multiplier_up_3_win');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_4_upto, 'game_sfx/sfx_multiplier_up_4_upto');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_4_loop, 'game_sfx/sfx_multiplier_up_4_loop');
//     AudioManager.getInstance().register(GameAudioKey.multiplier_up_4_win, 'game_sfx/sfx_multiplier_up_4_win');

//     //連線消除
//     AudioManager.getInstance().register(GameAudioKey.payline_hit_1, 'game_sfx/sfx_payline_hit_1');
//     AudioManager.getInstance().register(GameAudioKey.payline_hit_2, 'game_sfx/sfx_payline_hit_2');
//     AudioManager.getInstance().register(GameAudioKey.payline_hit_3, 'game_sfx/sfx_payline_hit_3');
//     AudioManager.getInstance().register(GameAudioKey.symbol_explode, 'game_sfx/sfx_symbol_explode');

//     //symbol
//     AudioManager.getInstance().register(GameAudioKey.scatter_win, 'game_sfx/sfx_scatter_win');
//     AudioManager.getInstance().register(GameAudioKey.scatter_hit_1, 'game_sfx/sfx_scatter_hit_1');
//     AudioManager.getInstance().register(GameAudioKey.scatter_hit_2, 'game_sfx/sfx_scatter_hit_2');
//     AudioManager.getInstance().register(GameAudioKey.scatter_hit_3, 'game_sfx/sfx_scatter_hit_3');

//     //FS
//     AudioManager.getInstance().register(GameAudioKey.free_game_transition_1, 'game_sfx/sfx_free_game_transition_1');
//     AudioManager.getInstance().register(GameAudioKey.free_game_transition_2, 'game_sfx/sfx_free_game_transition_2');
//     AudioManager.getInstance().register(GameAudioKey.free_game_start, 'game_sfx/sfx_free_game_start');
//     AudioManager.getInstance().register(GameAudioKey.free_game_skip, 'game_sfx/sfx_free_game_skip');
//     AudioManager.getInstance().register(GameAudioKey.free_game_total_win, 'game_sfx/sfx_free_game_total_win');

//     //FeatureBuy
//     AudioManager.getInstance().register(GameAudioKey.buy_feature_click, 'game_sfx/sfx_buy_feature_click');
//     AudioManager.getInstance().register(GameAudioKey.buy_click, 'game_sfx/sfx_buy_click');

//     //其他
//     AudioManager.getInstance().register(GameAudioKey.score_count_loop, 'game_sfx/sfx_score_count_loop');
//     AudioManager.getInstance().register(GameAudioKey.retrigger, 'game_sfx/sfx_retrigger');
//     AudioManager.getInstance().register(GameAudioKey.win_bar, 'game_sfx/sfx_win_bar');
//   }
// }
