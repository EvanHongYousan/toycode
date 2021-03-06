var cfg, common, ev, main, data, rightScore=0,//rightSelectedIndex, userSelectedIndex
    isAnalyse = false;
cfg = {
    style : {
        // 正确错误的样式
        wrong : 'selectWrong',// 'color:#fff;background:#f05836;box-shadow:inset
        // 1px 1px 1px #cc6633',
        right : 'selectRight',// 'color:#fff;background:#4cae68;box-shadow:inset
        // 1px 1px 1px #339966',
        iptWrong : {
            'borderColor' : '#323232',
            'color' : '#f05836'
        },
        iptRight : {
            'borderColor' : '#4cae68',
            'color' : '#1d4b2a'
        },
        active : 'active'
    }
};

common = {
    // 激活当前一个的class共用方法
    activeOne : function(one, all, active) {
        for (var i = 0; i < all.length; i++) {
            all[i].className = '';
        }
        one.addClass(active);
        $(".underline > span").eq($(".swipe > .swipe-wrap > div >section").index(one.parents('.content').parent())).attr("class","finished activeMark");
    },
    getUserAgent: function() {
        function isIOS() {
            return /iphone/i.test(userAgent) || /ipod/i.test(userAgent) || /ipad/i.test(userAgent);
        }
        var userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('micromessenger') > 0) {
            return 'weixin' + (isIOS() ? '_ios' : '');
        } else if (userAgent.indexOf('android') > 0) {
            return 'android';
        } else if (isIOS()) {
            return 'ios';
        }
        return 'pc';
    }
};
ev = {
    init : function() {
        ev.liClick();
        ev.buttonClick();
        ev.spanClick();
        ev.questionSwitch();
        ev.accordion();
        ev.initDownload();
        JSNativeBridge.init(ev.onNativeMessage);
    },

    initDownload : function() {
        if(!tools.isMomoClient()){
            $(".download_info").show();
            var downloadUrl = 'http://dl.ztmomo.com/app/ztmomo/android/028/ztmomo.apk';
            if (common.getUserAgent() == 'weixin_ios') {
                downloadUrl = "http://a.app.qq.com/o/simple.jsp?pkgname=com.mainbo.uplus";
            } else if (common.getUserAgent() == 'ios') {
                downloadUrl = 'https://itunes.apple.com/cn/app/zhen-ti-mo-mo/id899192770?l=zh&ls=1&mt=8';
            } else if (common.getUserAgent() == 'weixin') {
                $(".download_info").before('<p style="text-align: center;color:#2ac99a;">请在【浏览器中打开】下载</p>');
            }
            $(".download").bind("click", function() {
                window.location.href = downloadUrl;
            });
        }
    },
    // 返回图片结果
    initImg : function() {
        $('body').delegate('img', 'click', function() {
            var _this = this;
            var imgFile = this.src;
            if (!this.show) {
                if (imgFile.indexOf('file://') == 0) {
                    imgFile = imgFile.substr('file://'.length);
                }
                ;

                if (imgFile.indexOf('?')) {
                    imgFile = imgFile.split('?')[0]
                }
                ;
                // 防止快速重复点击img
                this.show = 1;
                main.opt&&main.opt.zoomImg&&main.opt.zoomImg(imgFile);
                setTimeout(function() {
                    _this.show = 0;
                }, 2000)
            }
        })
    },
    // 手风琴
    accordion : function() {
        $('.accordion h4 p').bind('click', function() {
            // this.classList.toggle('p_hover');
            var _this = $(this);
            _this.toggleClass('p_hover');
            $(this.parentNode.nextElementSibling).toggle();
        });
        // 用户点击最后一个选项卡的时候要展示其选项卡下所有内容，否则用户不知道下面有东西;
        // TODO这个因为一个元素绑定了两事件，所以在FF内核中可能存在执行顺序问题
        $(".accordion").last().find("h4 p").bind(
            "click",
            function() {
                !$(this).hasClass("p_hover")
                && (document.body.scrollTop = 10000000000000);
            })
    },
    liClick : function(arg) {
        function fn(ev) {
            var _this=this;
            if (isAnalyse) {
                return;
            }
            ;
            main.makeResult($(this), ev);

            var userLog = sessionStorage.getItem("userLog") ? JSON.parse(sessionStorage.getItem("userLog")) : [] ;
            if(!userLog[globaldata.curNum]){
                userLog[globaldata.curNum] = {};
            }
            var userIndex = $(this).parent().find("li").index(this);
            var pageIndex = $(".swipe > .swipe-wrap > div >section").index($(this).parents("section.content").parent());
            if(!userLog[globaldata.curNum].selectLog){
                userLog[globaldata.curNum].selectLog = [];
            }
            userLog[globaldata.curNum].selectLog[pageIndex] = userIndex;
            sessionStorage.setItem("userLog",JSON.stringify(userLog));

            setTimeout(function(){
                mySwipe.next();
            },500);
            //main.analysis();
        }
        ;
        if (arg) {
            $('.answer li').unbind('click', fn);
        } else {
            $('.answer li').bind('click', fn);
        }
    },
    buttonClick:function(){
        $("#submit").click(function(){
            main.analysis();
            //$("article.page, .questions.page").hide();
            //$(".submitDiv").remove();
            //$(".serialNumStrip").hide();
            //$(".cheerDiv").show();
            $(".submitDiv p").html("你答对了"+rightScore+"道题");
            $("#submit").text("查看解析").unbind("click").click(function(){
                mySwipe.slide(0);
                $(".submitDiv p").remove();
                $("#submit").text("下一题").unbind("click").click(function(){
                    location.href = globaldata.nextQueURL || "end.html";
                });
            });
        });
        $("#showAnalysis").click(function(){
            $("article.page, .questions.page").show();
            //$("section.submitDiv").addClass("none");
            $(".serialNumStrip").show();
            $(".questions.page section").eq(0).removeClass("none");
            //$(".cheerDiv").addClass("none");
            main.focusBlank(0);
            mySwipe.slide(0);
            $("#submit").unbind("click").html("下一题").click(function(){
                $(".navbar .nextQue").click();
            }).prev().remove();
        });
    },

    spanClick:function(){
        $("#reload").click(function(){
            window.location.reload();
        });
        $(".underline > span").click(function(){
            main.focusBlank($(".underline > span").index(this));
            mySwipe.slide($(".underline > span").index(this),300);
        });
    },
    questionSwitch:function(){
        var elem = document.getElementById('mySwipe');
        window.mySwipe = Swipe(elem, {
            // startSlide: 4,
            // auto: 3000,
            // continuous: true,
            // disableScroll: true,
            // stopPropagation: true,
            callback: function(index, element) {
                main.focusBlank(index);
                $(".questions").scrollTo({
                    endY: 0,
                    duration: 0,
                    callback: function() {
                    }
                });
            },
            transitionEnd: function(index, element) {}
        });
    },

    onNativeMessage : function(id, content){
        switch(id){
            case "get_available_operation_of_current_page":
                JSNativeBridge.send("send_available_operation_of_current_page",{
                    "share":true,
                    "scratch_paper": true
                });
                break;
            default :
                break;
        }
    }

};
main = {
    // 美化Dom
    rangeDom : function() {
        var a = $('#topic_header'), b = a.next();
        b && a.prependTo(b);
        $('input').before('<div class="height0"></div>');

        if (main.is_analysis) {
            // 清除在答题解析里面头部和尾部的多余P标签
            var aDiv = $('.contentInfo .accordion div');
            aDiv.forEach(function(e) {
                try {
                    var text = $(e).text().trim();
                    if (text === "null" || text == "")
                        $(e).closest(".accordion").hide();
                } catch (e) {
                }
                var aP = $(e).find('p');
                for (var i = aP.length - 1; i >= 0; i--) {
                    if (aP[i].innerHTML === ''
                        || aP[i].innerHTML === '&nbsp;') {
                        aP[i].style.display = 'none'
                    } else {
                        break;
                    }
                }
            });
            aDiv
                .forEach(function(e) {
                    var aP = $(e).find('p');
                    for (var i = 0; i < aP.length; i++) {
                        if (aP[i].innerHTML === ''
                            || aP[i].innerHTML === '&nbsp;') {
                            aP[i].style.display = 'none'
                        } else {
                            break;
                        }
                    }
                });
        }

    },
    // 调整图片大小
    resizeImg : function() {
        function Img(aObj, callback) {
            this.obj = aObj;
            this.callback = callback;
        }
        Img.prototype = {
            loadImg : function() {
                var _this = this;
                $.each(_this.obj, function(i, e) {
                    if (i == 0) {
                        return
                    }
                    //console.log(e.complete)
                    if(e.complete)return _this.callback(e);
                    e.onload = function() {
                        _this.callback(e);
                    };
                });
            }
        };

        (new Img($('img'), function(e) {
            var h = parseInt(window.getComputedStyle(e, null).height);
            e.style.position = 'static';
            e.style.height = (h / 2 + 4) + "px";
            e.style.width = "auto";
        })).loadImg();
    },
    // 获取用户选择
    makeResult : function(target, ev) {
        var rightJson = '', index, right;
        common.activeOne(target.find('a'), target.parent().find('a'), 'active');
    },

    analysis : function() {
        isAnalyse=true;
        var ansLog = [];
        $(".swipe > .swipe-wrap > div >section").each(function(){
            var index = $(".swipe > .swipe-wrap > div >section").index(this);
            var rightSelectedIndex=$(this).find('.answer ul li.right').index();
            var userSelectedIndex=$(this).find('.active').parents('li').index();
            ansLog[index] = userSelectedIndex;

            var right = null;

            if(userSelectedIndex == rightSelectedIndex && rightSelectedIndex != -1){
                right = true;
                rightScore++;
                $(".underline > span").eq($(".swipe > .swipe-wrap > div >section").index(this)).attr("class","SelectRight")
            }else {
                right = false;
                $(".underline > span").eq($(".swipe > .swipe-wrap > div >section").index(this)).attr("class","SelectWrong")
            }

            $(this).find(".answer li a").each(function(i, e) {
                if (i == rightSelectedIndex) {
                    $(e)[0].className = cfg.style.right;
                }
                if (!right && i == userSelectedIndex) {
                    $(e)[0].className = cfg.style.wrong;
                }
            });

            $(this).find('.accordion > article > div').each(function(i, e) {
                if (e.innerHTML == '') {
                    $(e).closest('.accordion').remove();
                }
            });

            $(this).find(".none").removeClass("none");

        });
        $('.answer li').unbind();

        $(".serialCard span").eq(globaldata.curNum-1).attr('class','selectright r_hover');
        var userLog = sessionStorage.getItem("userLog") ? JSON.parse(sessionStorage.getItem("userLog")) : [] ;

        userLog[globaldata.curNum] = {
            "right" : true,
            "rightScore" : rightScore,
            "type":"cloze_read",
            "ansLog":ansLog
        };

        sessionStorage.setItem("userLog",JSON.stringify(userLog));
    },

    focusBlank:function(index){
        if($(".questionType").attr("type")=="4" || index >= $(".underline > span").length){ //questionType为4表明这是阅读理解题,则文章部分没有必要滑动
            return;
        }
        $(".underline > span").removeClass("Active").removeClass("activeMark");
        if(!isAnalyse && !$(".underline > span").eq(index).hasClass("finished")){
            $(".underline > span").eq(index).attr("class","Active");
        }else{
            $(".underline > span").eq(index).addClass("activeMark");
        }

        if(index < $(".underline > span").length) {
            $(".serialNumStrip span.curQueNum").text(index + 1);
        }

        var pageOffset=$("article.page section.content").offset().top;
        var spanOffset=$(".underline > span").eq(index).offset().top;
        $("article.page").scrollTo({
            endY: spanOffset-pageOffset-15-$(".download_info").height(),        //15 是 .question 带的 15px margin
            duration: 250,
            callback: function() {
            }
        });
    },
    loadCache:function(){
        if(sessionStorage.getItem("userLog")){

            /*给答题卡里的序号上色 start*/
            var userLog = JSON.parse(sessionStorage.getItem("userLog"));
            for(var i = 1 ; i <= userLog.length ; i++){
                if(userLog[i] && userLog[i].right!=undefined){
                    if(userLog[i].right){
                        $(".serialCard span").eq(i-1).addClass("selectright");
                    }
                    if(userLog[i].right == false){
                        $(".serialCard span").eq(i-1).addClass("selectwrong");
                    }
                }
            }
            /*给答题卡里的序号上色 end*/

            if(userLog[globaldata.curNum] && userLog[globaldata.curNum].selectLog){
                for(var k = 0; k<userLog[globaldata.curNum].selectLog.length; k++){
                    if(userLog[globaldata.curNum].selectLog[0] == -1){
                        continue;
                    }
                    $(".swipe > .swipe-wrap > div >section").eq(k).find('.answer ul li').eq(userLog[globaldata.curNum].selectLog[k]).find('a').attr("class","active");
                    $(".underline > span").eq(k).attr("class","finished activeMark");
                }
            }


            if(userLog[globaldata.curNum] && userLog[globaldata.curNum].right && userLog[globaldata.curNum].ansLog){
                $(".active").removeClass(".active");
                for(var j = 0; j<userLog[globaldata.curNum].ansLog.length; j++ ){
                    $(".swipe > .swipe-wrap > div >section").eq(j).find('.answer ul li').eq(userLog[globaldata.curNum].ansLog[j]).find('a').attr("class","active");
                }
                $("#submit").click();
                $("#submit").click();
            }
        }

        switch($(".serialCard span").eq(globaldata.curNum-1)[0].className){
            case "":
                $(".serialCard span").eq(globaldata.curNum-1).addClass("g_hover");
                break;
            case "selectright":
                $(".serialCard span").eq(globaldata.curNum-1).addClass("r_hover");
                break;
            case "selectwrong":
                $(".serialCard span").eq(globaldata.curNum-1).addClass("w_hover");
                break;
            default :break;
        }
    },

    // 入口
    load : function() {
        main.rangeDom();
        //main.showQuestion();

        main.focusBlank(0);
        if($(".questionType").attr("type")=="4"){ //questionType为4表明这是阅读理解题,去除序号
            $(".serialNumStrip span").css("opacity","0");
        }else {
            $(".serialNumStrip .queLen").text($(".underline > span").length);
        }

        ev.init();
        navbar.init();
        //main.resizeImg();
        ev.initImg();
        main.loadCache();
    }
};

$(function(){
    main.load();
});