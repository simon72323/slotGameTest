import { sys } from 'cc';

/** 針對IOS14以下版本，禁用WEBP */
const ua = navigator.userAgent;//獲取瀏覽器userAgent
const iosMatch = ua.match(/OS (\d+)_/i);//匹配IOS版本號
const iosVersion = iosMatch ? parseInt(iosMatch[1], 10) : null;//獲取版本號
const isIOS = /iP(hone|od|ad)/.test(ua);//判斷是否為IOS設備
if (isIOS && iosVersion && iosVersion < 14 && sys.hasFeature) {
    const oldHasFeature = sys.hasFeature;//備份原始hasFeature
    //重寫hasFeature
    sys.hasFeature = function (feature) {
        return feature === 'WEBP' ? false : oldHasFeature(feature);
    };
}