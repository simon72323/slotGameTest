/**
 * 音效名稱
 */
export enum AudioKey {
    //背景音
    bgmMg = 'mu_main_background',//一般遊戲背景音樂
    bgmFg = 'mu_background',//免費遊戲背景音樂

    btnClick = 'btnClick',//公版按鈕音效

    //購買免費遊戲相關
    btnBuyConfirm = 'se_confirm',//購買免費遊戲確認
    btnBuyCancle = 'se_cancel',//購買免費遊戲取消
    btnBuyClick = 'se_choice_fs',//點擊購買按鈕音效
    showBuyWindow = 'se_buy_window',//顯示購買頁面

    spinClick = 'se_start',//開始spin音效
    reelStop = 'se_stop',//停止spin音效
    teasing = 'se_near',//聽牌音效
    win = 'se_getwin',//獲得分數音效


    hook = 'se_hook',//釣竿釣靴子音效
    scatterShow = 'se_scatter',//scatter出現時
    scatterWin = 'se_fg_scatter',//scatter獲得時


    //免費遊戲相關
    bgTrans = 'mu_trans',//轉場背景音樂
    trans = 'se_fg_trans',//遊戲轉場(獲得免費遊戲介面)
    wildShow = 'se_wild_show',//wild出現時
    wildFishMove = 'se_fg_cheer',//wild釣魚時
    wildCash = 'se_cash',//wild蒐集到魚的音效
    wildCount = 'se_wild_count',//wild蒐集次數音效
    wildMultWin = 'se_mult_win',//wild成功蒐集增加次數

    //大獎與免費遊戲總贏得
    afterMusic = 'mu_aftermusic',//報獎背景音樂
    bigWin = 'se_bigwin',//bigWin
    superWin = 'se_superwin',//superWin
    megaWin = 'se_megawin',//megaWin
    winEnd = 'se_win_end',//大獎結束
    totalWin = 'se_mul_settle',//免費遊戲結算
}