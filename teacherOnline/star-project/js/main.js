/*jslint browser: true*/
/*global $, jQuery, unescape, alert, JSNativeBridge, devJudge*/

var common = (function () {
    function getReqPrm(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
            r = window.location.search.substr(1).match(reg);
        if (r !== null) {
            return unescape(r[2]);
        }
        return null;
    }

    return {getReqPrm: getReqPrm};
}());

(function () {
    var oldAlert = window.alert;
    window.alert = function (msg) {
        if (devJudge.isAndroid() || devJudge.isIOS()) {
            JSNativeBridge.send('js_msg_showTip', {"tip": msg});
        } else {
            oldAlert(msg);
        }
    };
    String.prototype.filterPhase = function (targetStr) {
        return this.replace('（小学）', '')
            .replace('（初中）', '')
            .replace('（高中）', '')
            .replace('(小学)', '')
            .replace('(初中)', '')
            .replace('(高中)', '')
            .replace('.0', '')
            .replace('<br/>', '');
    };
}());

var components = (function () {
    var domainName = 'http://192.168.0.231',
        userId = null,
        rotateI = 1,
        timePick = 50,
        rotateTrip = 0,
        scrollData = [],
        itemType = {
            CARD: 1,
            MONEY: 2,
            THANK: 3,
            IPHONE: 4,
            IWATCH: 5
        },

        rotating = false,
        rotatingCanStop = false,
        awardI = 0,
        lotteryAwardType = 0,
        timePickCanAdd = false,

        isOnline = true,

        freeCount = 0;

    console.log('当前domainName：' + domainName);

    function getUserIdFromUrl() {
        try {
            userId = common.getReqPrm('parameter') ? JSON.parse(decodeURIComponent(common.getReqPrm('parameter'))).user_id : null;
        } catch (e) {
            console.log(e);
        }
        if (userId === null) {
            userId = '15800031138@192.168.0.231';
        }
    }

    function maskShow(dialog) {
        $('.mask > div').addClass('none');
        $('.mask, .mask .' + dialog).removeClass('none');
        $('body,html').css('overflow', 'hidden');
    }

    function maskHide() {
        $('.mask, .mask > div').addClass('none');
        $('body,html').css('overflow', 'auto');
    }

    function dialContainerRotate() {
        if (timePick < 800) {
            if (rotateTrip > 40 && (rotateI === (awardI + 8) || rotateI === (awardI + 8 - 12))) {
                timePickCanAdd = true;
            }
            if (timePickCanAdd) {
                timePick += 250;
            }
            rotateTrip += 1;
        } else {
            rotatingCanStop = true;
        }
        if (rotateI === 13) {
            rotateI = 1;
        }
        $('.container .dialContainer  span').removeClass('active');
        $('.container .dialContainer  span.item' + rotateI).addClass('active');

        if (rotatingCanStop && rotateI === awardI) {
            setTimeout(function () {
                if (lotteryAwardType === 3 || awardI === 10) {
                    alert('oh,no~~没抽到~');
                } else {
                    maskShow('congratulationAlert');
                }
                setTimeout(function () {
                    $('.dialContainer span').removeClass('active');
                }, 300);
                rotating = false;
                rotatingCanStop = false;
                awardI = 0;
                lotteryAwardType = 0;
                timePick = 50;
                rotateTrip = 0;
                timePickCanAdd = false;
            }, 1800);
            return;
        }

        rotateI++;
        setTimeout(components.dialContainerRotate, timePick);
    }

    function refreshStarBar(week_signin_count) {
        var i = 0;
        try {
            for (i = 1; i <= 4; i++) {
                $('.star-bar > .star' + i)[0].src = './img/pic_Stars_' + i + '.png';
            }
            for (i = 1; i <= week_signin_count; i++) {
                $('.star-bar > .star' + i)[0].src = './img/pic_Stars_Bright.png';
            }
        } catch (e) {
            console.log(e);
        }
        if (week_signin_count > 4) {
            week_signin_count = 4;
        }
        $('.star-bar').attr('style', 'background:url(./img/pic_Five_line_Bright_' + week_signin_count + '.png) no-repeat;background-size:100% 100%;');
    }

    function initPage() {
        $.get(
            domainName + '/app/awardServlet?method=init&user_id=' + userId + '&callback=?',
            //'./test_json/init.json',
            function (data, status, xhr) {
                console.log('initPage');
                console.log(data);
                var i = 0,
                    resultCode = data._APP_RESULT_OPT_CODE,
                    resultData = data._APP_RESULT_OPT_DATA,
                    resultDescript = data._APP_RESULT_OPT_DESC;

                if (resultCode === 110) {
                    if (resultData.sigined) {
                        $('#checkInBtn').removeClass('uncheck').addClass('hover').addClass('check-in');
                    } else{
                        $('#checkInBtn').removeClass('uncheck').addClass('check-in');
                    }
                    $('.container .integral > span').text(resultData.total_point);
                    JSNativeBridge.send('js_msg_total_points', {"total_points": resultData.total_point});
                    refreshStarBar(resultData.week_signin_count);
                    $('.dialTitleDiv .buble')[0].src = './img/buble' + resultData.free_count + '.png';
                    if(resultData.today_free_count>0){
                        $.scrollTo({
                            endY: $('.dialTitle').offset().top,
                            duration: 1000,
                            callback: function () {
                                if (resultData.free_count === 3) {
                                    //$('.mask, .mask .freeChanceAlert').removeClass('none');
                                    JSNativeBridge.send('js_msg_showTip', {"tip": '哈哈~送你三次免费抽奖机会哦!'});
                                }
                            }
                        });
                    }
                    if (resultData.free_count) {
                        $('.dialTitleDiv .buble').css('opacity', 1);
                    }

                    for (i = 1; i <= 12; i++) {
                        if (!resultData.awards[i].discription) {
                            continue;
                        }
                        resultData.awards[i].discription = resultData.awards[i].discription.toString().replace(/[^0-9\.]/g, '');
                        if (resultData.awards[i].type === itemType.MONEY) {
                            if(resultData.awards[i].category===undefined) {
                                $('.dialContainer .item' + i + ' .type').text('现金券');
                            } else if (resultData.awards[i].category === 0){
                                $('.dialContainer .item' + i + ' .type').text('答疑券');
                            } else if (resultData.awards[i].category === 1){
                                $('.dialContainer .item' + i + ' .type').text('直播券');
                            } else if (resultData.awards[i].category === 2){
                                $('.dialContainer .item' + i + ' .type').text('约课券');
                            } else {
                                $('.dialContainer .item' + i + ' .type').text('通用券');
                            }
                            $('.dialContainer .item' + i).find('img').eq(0).attr('src', './img/pic_money.png');
                            $('.dialContainer .item' + i).find('img').eq(1).attr('src', './img/pic_money_dynamic.png');
                            $('.dialContainer .item' + i + ' .description').html('<em>' + resultData.awards[i].discription + '</em>' + '元');
                        }
                        if (resultData.awards[i].type === itemType.CARD) {
                            $('.dialContainer .item' + i + ' .type').text('学时卡');
                            $('.dialContainer .item' + i).find('img').eq(0).attr('src', './img/pic_Card.png');
                            $('.dialContainer .item' + i).find('img').eq(1).attr('src', './img/pic_Card_Dynamic.png');
                            $('.dialContainer .item' + i + ' .description').html('<em>' + resultData.awards[i].discription + '</em>' + '分钟');
                        }
                        if (resultData.awards[i].type === itemType.THANK) {
                            $('.dialContainer .item' + i + ' .type').text('谢谢参与');
                            $('.dialContainer .item' + i).find('img').eq(0).attr('src', './img/pic_thank.png');
                            $('.dialContainer .item' + i).find('img').eq(1).attr('src', './img/pic_thank_dynamic.png');
                            $('.dialContainer .item' + i + ' .description').html('<em></em>');
                        }
                    }
                } else if (resultCode === 92) {
                    maskShow('bindPhoneNumber');
                } else {
                    alert(resultDescript);
                }

            }
        );
    }

    function getScrollData() {
        $.get(
            domainName + '/app/awardServlet?method=showResult&user_id=' + userId + '&callback=?',
            //'./test_json/showResult.json',
            function (data, status, xhr) {
                scrollData = data._APP_RESULT_OPT_DATA.awards;
                setTimeout(function () {
                    components.getScrollData();
                }, 60000);
                console.log('getScrollData');
                console.log(scrollData);
                console.log(userId);
            }
        );
    }

    function scrollDivScrolling() {
        var item = scrollData.pop(),
            itemName = null;

        if (item && item.detail !== undefined && item.detail !== '谢谢参与') {
            itemName = item.username;
            if (itemName.length > 2) {
                itemName = itemName.substr(0, 2) + '...';
            }
            $('.scrollDiv').append('<p>恭喜&nbsp;&nbsp;<span class="name">' + itemName + '</span>&nbsp;&nbsp;抽中了&nbsp;&nbsp;<span class="award">' + item.detail.filterPhase() + '</span></p>');
            $('.scrollDiv').scrollTo({
                endY: $('.scrollDiv')[0].scrollHeight,
                duration: 1000
                //callback: function () {
                //    //console.log($('.scrollDiv')[0].scrollHeight);
                //}
            });
        }
        setTimeout(components.scrollDivScrolling, 1500);
    }

    function activityRulesBindEv() {
        $('.activity-rules').on('click', function () {
            maskShow('activityRulesAlert');
        });
    }

    function closeBtnBindEv() {
        $('.mask').on('click', '.closeBtn', function () {
            setTimeout(function () {
                maskHide();
            }, 0);
        });
    }

    function getAwardRecord() {
        $.get(
            domainName + '/app/awardServlet?method=showRecord&user_id=' + userId + '&callback=?',
            //'./test_json/signin.json',
            function (data, status, xhr) {
                console.log('getAwardRecord');
                var records = data._APP_RESULT_OPT_DATA.records,
                    resultCode = data._APP_RESULT_OPT_CODE,
                    resultDescript = data._APP_RESULT_OPT_DESC,
                    i,
                    date,
                    dateStr,
                    $target = $('.drawRecordDialog .tbodyContainer > table');
                $target.empty();
                console.log(records);
                if (resultCode === 110) {
                    for (i = 0; i < records.length; i++) {
                        if (records[i].detail !== undefined) {
                            $('.mask .drawRecordDialog .tbodyContainer .emptyTip').remove();
                            date = new Date(parseInt(records[i].insert_time, 10));
                            dateStr = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                            $target.append($('<tr><td class="divider" colspan="3"><img src="./img/pic_table_line.png" alt=""/></td></tr>'));
                            $target.append($('<tr><td>' + dateStr + '</td><td>' + records[i].cost.toString().replace('-', '') + '</td><td>' + records[i].detail.replace('谢谢参与', '未中奖').filterPhase() + '</td></tr>'));
                            dateStr = null;
                        }
                    }
                } else {
                    alert(resultDescript);
                }
            }
        );
    }

    function showAwardRecordBtnBindEv() {
        $('.showAwardRecord').on('touchend', function () {
            setTimeout(function () {
                maskShow('drawRecordDialog');
            }, 100);
        });
    }

    function bindPhoneNumberBtnBindEv() {
        $('.bindPhoneNumberBtn').on('click', function () {
            setTimeout(function () {
                JSNativeBridge.send('js_msg_bind_phonenumber');
            }, 100);
        });
    }

    function shareBtnBindEv() {
        $('.shareBtn').on('click', function () {
            JSNativeBridge.send('share', {
                "content": '呼叫老师免费送抽奖，iPhone6S，iWatch惊喜大礼任你抽~',
                "title": '快来玩星转盘，iPhone6S任你抽~!',
                "type": 0,
                "image_url": domainName + '/rtc/spread/point/star-project/shareicon.png',
                "target_url": domainName + '/rtc/spread/point/star-project/sharepage.html',
                "target_url_forQQ": domainName + '/rtc/spread/point/star-project/sharepage.html'
            });
        });
    }

    function jsNativeBridgeBindEv() {
        JSNativeBridge.init(function (id, content) {
            switch (id) {
                case 'client_msg_isOnline':
                    isOnline = content.is_online;
                    break;
                case 'client_msg_isBindDLShow':
                    if (!content.is_bind_DL_show || content.is_bind_DL_show === 'false') {
                        maskHide();
                    }
                    break;
                default:
                    break;
            }
        });
    }

    function checkInBtnBindEv() {
        $('#checkInBtn').on('click', function () {
            if ($(this).hasClass('hover')) {
                return false;
            }
            if (isOnline === false || isOnline === 'false') {
                alert('Oh,no,网络不好喔~稍后再试吧！');
            }
            $.get(
                domainName + '/app/awardServlet?method=signin&user_id=' + userId + '&callback=?',
                //'./test_json/signin.json',
                function (data, status, xhr) {
                    var resultData = data._APP_RESULT_OPT_DATA,
                        resultCode = data._APP_RESULT_OPT_CODE,
                        resultDescript = data._APP_RESULT_OPT_DESC;
                    console.log('checkInBtnBindEv');
                    console.log(data);
                    if (resultCode === 110) {
                        JSNativeBridge.send('js_msg_already_signin');
                        JSNativeBridge.send('js_msg_total_points', {"total_points": resultData.total_point});
                        $('#checkInBtn').addClass('hover').addClass('animate');
                        setTimeout(function () {
                            $('.container .integral > span').text(resultData.total_point);
                            refreshStarBar(resultData.week_signin_count);
                            if (resultData.award_point) {
                                $('.extraIntegralGetAlert .extraItegral').text('+' + resultData.award_point);
                                setTimeout(function () {
                                    maskShow('extraIntegralGetAlert');
                                }, 1000);
                            }
                        }, 2000);
                    } else if (resultCode === 92) {
                        maskShow('bindPhoneNumber');
                    } else {
                        alert(resultDescript.filterPhase());
                    }
                }
            );
        });
    }

    function lotteryBtnBindEv() {
        $('.lotteryBtn').on('click', function () {
            if (rotating) {
                return;
            }
            if (isOnline === false || isOnline === 'false') {
                alert('Oh,no,网络不好喔~稍后再试吧！');
            }
            $.get(
                domainName + '/app/awardServlet?method=myLottery&user_id=' + userId + '&callback=?',
                //'./test_json/myLottery.json',
                function (data, status, xhr) {
                    console.log('lotteryBtnBindEv');
                    console.log(data);
                    var resultCode = data._APP_RESULT_OPT_CODE,
                        resultData = data._APP_RESULT_OPT_DATA,
                        resultDescript = data._APP_RESULT_OPT_DESC,

                        bubleI = parseInt($('.dialTitleDiv .buble').attr('src').replace(/[^0-9]/g, ''));

                    if (resultCode === 110) {
                        rotating = true;
                        dialContainerRotate();
                        if (resultData.award.no === -1 || resultData.award.type === 3) {
                            awardI = 10;
                        } else {
                            awardI = resultData.award.no;
                        }
                        lotteryAwardType = resultData.award.type;
                        $('.container .integral > span').text(resultData.total_point);
                        JSNativeBridge.send('js_msg_total_points', {"total_points": resultData.total_point});
                        $('.mask .congratulationAlert .reward').text(resultData.award.description.filterPhase());
                        if (bubleI - 1 > 0) {
                            $('.dialTitleDiv .buble').attr('src', './img/buble' + (bubleI - 1) + '.png');
                        } else {
                            $('.dialTitleDiv .buble').css('opacity', '0');
                        }
                        getAwardRecord();
                    } else if (resultCode === 92) {
                        maskShow('bindPhoneNumber');
                    } else {
                        if (resultDescript === '积分不够!') {
                            alert('小主，积分不够了...');
                        } else {
                            alert(resultDescript.filterPhase());
                        }
                    }
                }
            );
        });
    }

    function init() {
        getUserIdFromUrl();
        activityRulesBindEv();
        bindPhoneNumberBtnBindEv();
        jsNativeBridgeBindEv();
        getAwardRecord();
        showAwardRecordBtnBindEv();
        checkInBtnBindEv();
        lotteryBtnBindEv();
        shareBtnBindEv();
        setTimeout(function () {
            initPage();
            getScrollData();
            scrollDivScrolling();
            closeBtnBindEv();
        }, 0);
    }

    return {
        init: init,
        dialContainerRotate: dialContainerRotate,
        getScrollData: getScrollData,
        scrollDivScrolling: scrollDivScrolling,
        maskHide: maskHide
    };
}());

window.onload = function () {
    components.init();
};