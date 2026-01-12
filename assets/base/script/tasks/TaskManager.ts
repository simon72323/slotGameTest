import { XEvent1 } from 'db://assets/base/script/event/XEvent';
import { GameTask } from 'db://assets/base/script/tasks/GameTask';

/**
 * 任務管理
 */
export class TaskManager {
    private static instance: TaskManager;
    public static getInstance(): TaskManager {
        if (!TaskManager.instance) {
            TaskManager.instance = new TaskManager();
        }
        return TaskManager.instance;
    }

    /**任務完成事件 */
    public finishEvent: XEvent1<GameTask> = new XEvent1<GameTask>();

    /**目前待處理任務 */
    private tasks: GameTask[] = [];

    /**當前任務 */
    private curTask: GameTask;

    public constructor() {
        /**接收任務完成事件 */
        this.finishEvent.on(this.onFinishTask, this);
    }

    /**
     * 添加任務
     * @param task 任務
     */
    public addTask(task: GameTask) {
        this.tasks.push(task);
        if (!this.curTask) {
            //先儲存, 等update再執行, 確保執行順序
            this.curTask = this.tasks.shift();
        }
    }

    /**
     * 更新任務
     * @param deltaTime 增量時間
     */
    public update(deltaTime: number): void {
        if (this.curTask) {
            //第一次進入該任務才執行baseExecute
            if (this.curTask.executed === false) {
                // console.log('TaskManager 执行任務 ' + this.curTask.getName());
                this.curTask.baseExecute();
            }
            else {
                this.curTask.update(deltaTime);
            }
        }
    }

    /**
     * 完成任務
     * @param task 
     */
    private onFinishTask(task: GameTask) {
        if (task != this.curTask) {
            // console.log('TaskManager 不是當前任務');
            return;
        }

        this.doNextTask();
    }

    /**
     * 換新任務
     */
    private doNextTask(): void {
        this.curTask = this.tasks.shift();
        if (!this.curTask) {
            // console.log('TaskManager 所有任務完成');
            return;
        }
        // console.log('TaskManager 执行任務 ' + this.curTask.getName());
        this.curTask.baseExecute();
    }
}

export const taskManager = (): TaskManager => TaskManager.getInstance();