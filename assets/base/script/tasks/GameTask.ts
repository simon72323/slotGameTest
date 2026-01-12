import { taskManager } from 'db://assets/base/script/tasks/TaskManager';

/**
 * 遊戲任務
 */
export abstract class GameTask {

    /**任務名稱 */
    protected name: string;

    /**是否已執行 */
    public executed: boolean = false;

    /**取得任務名稱 */
    public getName(): string {
        return this.name;
    }

    /**基礎執行 */
    public baseExecute(): void {
        this.executed = true;
        this.execute();
    }

    /**執行 */
    abstract execute(): void;

    /**持續更新 */
    abstract update(deltaTime: number): void;

    /**完成 */
    protected finish(): void {
        taskManager().finishEvent.emit(this);
    }
}