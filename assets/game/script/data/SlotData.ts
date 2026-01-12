import { BetData } from 'db://assets/base/script/data/BetData';
import { Utils } from 'db://assets/base/script/utils/Utils';

import { SymbolID } from 'db://assets/game/script/data/GameConst';

export class SlotData {
    /**紀錄免費遊戲 wild倍率 */
    public static fsWildMultiply: number = 0;

    /**賠率資料 */
    private static payloadTemplate = {
        symbolPoints: {
            H1: [
                { count: 5, point: 200 },
                { count: 4, point: 20 },
                { count: 3, point: 5 },
                { count: 2, point: 0.5 }
            ],
            H2: [
                { count: 5, point: 100 },
                { count: 4, point: 15 },
                { count: 3, point: 3 }
            ],
            H3: [
                { count: 5, point: 50 },
                { count: 4, point: 10 },
                { count: 3, point: 2 }
            ],
            H4: [
                { count: 5, point: 50 },
                { count: 4, point: 10 },
                { count: 3, point: 2 }
            ],
            FishAll: [
                { count: 5, point: 20 },
                { count: 4, point: 5 },
                { count: 3, point: 1 }
            ],
            LA: [
                { count: 5, point: 10 },
                { count: 4, point: 2.5 },
                { count: 3, point: 0.2 }
            ],
            LK: [
                { count: 5, point: 10 },
                { count: 4, point: 2.5 },
                { count: 3, point: 0.2 }
            ],
            LQ: [
                { count: 5, point: 5 },
                { count: 4, point: 1 },
                { count: 3, point: 0.2 }
            ],
            LJ: [
                { count: 5, point: 5 },
                { count: 4, point: 1 },
                { count: 3, point: 0.2 }
            ],
            LT: [
                { count: 5, point: 5 },
                { count: 4, point: 1 },
                { count: 3, point: 0.2 }
            ]
        }
    };

    /**
     * 取得符號ID對應的賠率資料
     * @param symbolID 符號ID
     * @returns 賠率資料
     */
    public static getPayBySymbolID(symbolID: number): { count: number, cent: string }[] {
        /**symbolID對應的賠率資料key */
        const symbolIDPayloadMap = new Map<number, string>([
            [SymbolID.H1, 'H1'],
            [SymbolID.H2, 'H2'],
            [SymbolID.H3, 'H3'],
            [SymbolID.H4, 'H4'],
            [SymbolID.F1, 'FishAll'],
            [SymbolID.LA, 'LA'],
            [SymbolID.LK, 'LK'],
            [SymbolID.LQ, 'LQ'],
            [SymbolID.LJ, 'LJ'],
            [SymbolID.LT, 'LT']
        ]);
        let result = [];
        const payData = this.payloadTemplate.symbolPoints[symbolIDPayloadMap.get(symbolID)];
        if (payData) {
            payData.forEach((data: { count: number, point: number }) => {
                result.push({ count: data.count, cent: Utils.numberFormatKMBCurrency(data.point * BetData.getBetTotal()) });
            }, this);
        }
        return result;
    }
}