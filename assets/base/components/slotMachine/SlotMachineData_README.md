# SlotMachineData 使用说明

## 概述

`SlotMachineData` 类用于存储老虎机的所有配置、运行时数据和状态，供其他脚本使用。

## 访问方式

### 方式一：通过静态方法（推荐）

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

// 获取数据实例
const data = SlotMachine.getData();

// 访问数据
const reelCol = data.reelCol;  // 横轴列数
const reelRow = data.reelRow;  // 每轴纵轴列数
const allSymbols = data.allMainSymbols;  // 所有主层symbol节点
```

### 方式二：通过实例

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

// 获取实例
const slotMachine = SlotMachine.getInstance();

// 访问数据
const data = slotMachine.data;
const reelCol = data.reelCol;
```

## 可用数据

### 配置数据
- `reelCol`: 横轴列数
- `reelRow`: 每轴纵轴列数数组
- `reelList`: 转动轴节点数组
- `scatterLayer`: scatter层节点
- `winLayer`: 胜利层节点
- `skipUI`: 急停节点
- `symbolPrefab`: symbol预制体
- `symbolWidth`: symbol宽度
- `symbolHeight`: symbol高度
- `miNodeCount`: 每轴新增的瞇牌数量

### Symbol数据
- `reelMainSymbol`: 各轴主层symbol节点(顺序)
- `reelTopSymbol`: 各轴上层symbol节点(顺序)
- `reelBottomSymbol`: 各轴下层symbol节点(顺序)
- `reelSymbols`: 各轴symbol节点
- `allMainSymbols`: 所有主层symbol节点(Node)
- `allMainSymbolPos`: 所有主层symbol位置(以画面中心点为基准)

### 状态数据
- `isRunMi`: 是否执行瞇牌
- `resultPattern`: 结果符号
- `mipieList`: 各轴瞇牌状态
- `reelStopping`: 各轴是否停止中
- `reelStopped`: 各轴完全停止

## 使用示例

### 示例1：获取所有主层symbol

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

const data = SlotMachine.getData();
const allSymbols = data.allMainSymbols;

allSymbols.forEach((symbolNode, index) => {
    console.log(`Symbol ${index}:`, symbolNode);
});
```

### 示例2：检查转轴状态

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

const data = SlotMachine.getData();

// 检查所有转轴是否都已停止
const allStopped = data.reelStopped.every(stopped => stopped === true);

// 检查是否有转轴正在停止
const anyStopping = data.reelStopping.some(stopping => stopping === true);
```

### 示例3：获取转轴配置

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

const data = SlotMachine.getData();

console.log(`转轴数量: ${data.reelCol}`);
console.log(`每轴行数:`, data.reelRow);
console.log(`Symbol尺寸: ${data.symbolWidth} x ${data.symbolHeight}`);
```

### 示例4：访问特定转轴的symbol

```typescript
import { SlotMachine } from 'db://assets/base/components/slotMachine/SlotMachine';

const data = SlotMachine.getData();
const reelIndex = 0; // 第一轴

const mainSymbols = data.reelMainSymbol[reelIndex];
const topSymbols = data.reelTopSymbol[reelIndex];
const bottomSymbols = data.reelBottomSymbol[reelIndex];
```

## 注意事项

1. 确保在 `SlotMachine` 初始化完成后再访问数据
2. 不要直接修改数据，除非你明确知道自己在做什么
3. 状态数据（如 `reelStopping`、`reelStopped`）会在游戏运行时自动更新
4. 使用 `resetState()` 方法可以重置所有状态数据



