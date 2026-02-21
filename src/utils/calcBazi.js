import {YangGan, YangZhi, Gan, Zhi, JiShen, JiShenTrans, XiongShaTrans, XiongSha, JiShenInterpretation, XiongShaInterpretation} from './constants/shensha';
function getDaYun(gender, YueGanZhi, RiGanZhi) {
    // 阳男阴女顺排、阴男阳女逆排
    const RiGan = RiGanZhi.slice(0, 1);
    const result = [];
    let newGan, newZhi;
    if ((gender == 'male' && YangGan.includes(RiGan)) || (gender == 'female' && !YangGan.includes(RiGan))) {
        const ganIndex = Gan.indexOf(YueGanZhi.slice(0, 1));
        const zhiIndex = Zhi.indexOf(YueGanZhi.slice(1, 2));
        newGan = Gan.slice(ganIndex + 1).concat(Gan.slice(0, ganIndex + 1));
        newZhi = Zhi.slice(zhiIndex + 1).concat(Zhi.slice(0, zhiIndex + 1));
    } else {
        const ganIndex = Gan.reverse().indexOf(YueGanZhi.slice(0, 1));
        const zhiIndex = Zhi.reverse().indexOf(YueGanZhi.slice(1, 2));
        newGan = Gan.slice(ganIndex + 1).concat(Gan.slice(0, ganIndex + 1));
        newZhi = Zhi.slice(zhiIndex + 1).concat(Zhi.slice(0, zhiIndex + 1));
    }
    for (let i = 0; i < 11; i++) {
        result.push(`${newGan[i % 10]}${newZhi[i % 12]}`);
    }
    return result;
}
function getShenSha(ob, gender) {
    const {bz_jn, bz_jy, bz_jr, bz_js} = ob;
    let result = {
        year: {
            jishen: [],
            xiongsha: []
        },
        month: {
            jishen: [],
            xiongsha: []
        },
        day: {
            jishen: [],
            xiongsha: []
        },
        time: {
            jishen: [],
            xiongsha: []
        }
    };
    const riGan = bz_jr.slice(0, 1);
    const riZhi = bz_jr.slice(1, 2);
    const yueZhi = bz_jy.slice(1, 2);
    const nianZhi = bz_jn.slice(1, 2);

    // 天乙贵人 tianyiguiren
    findJiShen(ob, JiShenTrans['tianyiguiren'][riGan], result, '天乙贵人');
    // 天德 tiande
    findJiShen(ob, JiShenTrans['tiande'][yueZhi], result, '天德');
    // 月德 yuede
    findJiShen(ob, JiShenTrans['yuede'][yueZhi], result, '月德');
    // 学堂 xuetang
    findJiShen(ob, JiShenTrans['xuetang'][riGan], result, '学堂');
    result.year.jishen.splice(result.year.jishen.indexOf('学堂'), 1);
    // 华盖 huagai
    findJiShen(ob, JiShenTrans['huagai'][riZhi], result, '华盖');
    findJiShen(ob, JiShenTrans['huagai'][nianZhi], result, '华盖');
    // 将星 jiangxing
    findJiShen(ob, JiShenTrans['jiangxing'][riZhi], result, '将星');
    // 驿马 yima
    findJiShen(ob, JiShenTrans['yima'][riZhi], result, '驿马');
    // 丧门 sangmen
    findXiongSha(ob, XiongShaTrans['sangmen'][riZhi], result, '丧门');
    // 勾神 goushen
    if ((gender === 'male' && YangZhi.includes(riZhi)) || (gender === 'female' && !YangZhi.includes(riZhi))) {
        findXiongSha(ob, XiongShaTrans['goushenyang'][riZhi], result, '勾神');
    } else {
        findXiongSha(ob, XiongShaTrans['goushenyin'][riZhi], result, '勾神');
    }
    // 绞神 jiaoshenyang jiaoshenyin
    if ((gender === 'male' && YangZhi.includes(riZhi)) || (gender === 'female' && !YangZhi.includes(riZhi))) {
        findXiongSha(ob, XiongShaTrans['jiaoshenyang'][riZhi], result, '绞神');
    } else {
        findXiongSha(ob, XiongShaTrans['jiaoshenyin'][riZhi], result, '绞神');
    }
    // 孤神 gushen
    findXiongSha(ob, XiongShaTrans['gushen'][nianZhi], result, '孤神');
    // 寡宿 guaxiu
    findXiongSha(ob, XiongShaTrans['guaxiu'][nianZhi], result, '寡宿');
    // 咸池 xianchi
    findXiongSha(ob, XiongShaTrans['xianchi'][nianZhi], result, '咸池');
    findXiongSha(ob, XiongShaTrans['xianchi'][riZhi], result, '咸池');
    // 元辰 yuanchenyang yuanchenyin
    if ((gender === 'male' && YangZhi.includes(riZhi)) || (gender === 'female' && !YangZhi.includes(riZhi))) {
        findXiongSha(ob, XiongShaTrans['yuanchenyang'][nianZhi], result, '元辰');
    } else {
        findXiongSha(ob, XiongShaTrans['yuanchenyin'][nianZhi], result, '元辰');
    }
    // 劫杀 jiesha
    findXiongSha(ob, XiongShaTrans['jiesha'][nianZhi], result, '劫杀');
    // 流霞 liuxia
    findXiongSha(ob, XiongShaTrans['liuxia'][riGan], result, '流霞');
    // 红艳 hongyan
    findXiongSha(ob, XiongShaTrans['hongyan'][riGan], result, '红艳');
    return result;
}
function findJiShen(ob, hitArr, result, shenName) {
    const {bz_jn, bz_jy, bz_jr, bz_js} = ob;
    if (hitArr.includes(bz_jn.slice(1, 2)) || hitArr.includes(bz_jn.slice(0, 1))) {
        result.year.jishen.push({shenName, shenInterpretation: JiShenInterpretation[shenName]});
    }
    if (hitArr.includes(bz_jy.slice(1, 2)) || hitArr.includes(bz_jy.slice(0, 1))) {
        result.month.jishen.push({shenName, shenInterpretation: JiShenInterpretation[shenName]});
    }
    if (hitArr.includes(bz_jr.slice(1, 2)) || hitArr.includes(bz_jr.slice(0, 1))) {
        result.day.jishen.push({shenName, shenInterpretation: JiShenInterpretation[shenName]});
    }
    if (hitArr.includes(bz_js.slice(1, 2)) || hitArr.includes(bz_js.slice(0, 1))) {
        result.time.jishen.push({shenName, shenInterpretation: JiShenInterpretation[shenName]});
    }
}
function findXiongSha(ob, hitArr, result, shenName) {
    const {bz_jn, bz_jy, bz_jr, bz_js} = ob;
    if (hitArr.includes(bz_jn.slice(1, 2)) || hitArr.includes(bz_jn.slice(0, 1))) {
        result.year.xiongsha.push({shenName, shenInterpretation: XiongShaInterpretation[shenName]});
    }
    if (hitArr.includes(bz_jy.slice(1, 2)) || hitArr.includes(bz_jy.slice(0, 1))) {
        result.month.xiongsha.push({shenName, shenInterpretation: XiongShaInterpretation[shenName]});
    }
    if (hitArr.includes(bz_jr.slice(1, 2)) || hitArr.includes(bz_jr.slice(0, 1))) {
        result.day.xiongsha.push({shenName, shenInterpretation: XiongShaInterpretation[shenName]});
    }
    if (hitArr.includes(bz_js.slice(1, 2)) || hitArr.includes(bz_js.slice(0, 1))) {
        result.time.xiongsha.push({shenName, shenInterpretation: XiongShaInterpretation[shenName]});
    }
}
export {getDaYun, getShenSha};
