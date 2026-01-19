// import { AudioKey } from 'db://assets/base/script/audio/AudioKey';
// import { AudioManager } from 'db://assets/base/script/audio/AudioManager';
// import { BaseConst } from 'db://assets/base/script/constant/BaseConst';
// import { BaseIdleTask } from 'db://assets/base/script/tasks/BaseIdleTask';
// import { TimeoutManager } from 'db://assets/base/script/utils/TimeoutManager';
// import { TaskManager } from '../../../base/script/tasks/TaskManager';
// import { SpinTask } from './SpinTask';
// import { BaseDataManager } from 'db://assets/base/script/main/BaseDataManager';

// /**
//  * 待機
//  */
// export class IdleTask extends BaseIdleTask {
//   public static firstIn: boolean = true;

//   protected childExecute(): void {
//     //待機過久淡出音樂
//     TimeoutManager.getInstance().remove(BaseConst.TIMEOUT_IDLE_MUTE.key);
//     TimeoutManager.getInstance().register(BaseConst.TIMEOUT_IDLE_MUTE.key, BaseConst.TIMEOUT_IDLE_MUTE.seconds, () => {
//       AudioManager.getInstance().edit(AudioKey.BsMusic, 0.5, 1);
//     });

//     //第一次進入遊戲的設置
//     if (IdleTask.firstIn) {
//       IdleTask.firstIn = false;
//       // BaseDataManager.getInstance().setState(s5g.game.proto.ESTATEID.K_WAIT);
//       BaseDataManager.getInstance().setState(s5g.game.proto.ESTATEID.K_IDLE);
//       AudioManager.getInstance().play(AudioKey.BsMusic, 1, 0.5);
//     }
//   }
//   protected childFinish(): void {
//     let task = new SpinTask();
//     TaskManager.getInstance().addTask(task);
//   }
// }
