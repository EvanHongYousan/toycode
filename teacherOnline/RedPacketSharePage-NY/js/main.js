/**
 * Created by yantianyu on 15/8/12.
 */
compoments = (function () {
    function shareDivBindEv() {
        $('#shareBtn').click(function () {
            JSNativeBridge.send('share', {
                "content": spreadData.shareWording[Math.floor(Math.random()*3)],
                "title": spreadData.name[Math.floor(Math.random()*3)],
                "type": 0,
                "image_url": spreadData.pic,
                "target_url": spreadData.shareURL,
                "target_url_forQQ":spreadData.shareURL_forQQ
            });
        });
    }

    function JSNativeInit() {
        JSNativeBridge.init(function (id, content) {
            switch (id) {
                case 'get_share_content' :
                    //JSNativeBridge.send('send_share_content', {
                    //    "content": null,
                    //    "title": "呼叫老师红包活动test",
                    //    "type": 0,
                    //    "image_url": "http://192.168.0.233/ztmomo/activity/a6uttgTd5/images/CZSXKD1008.jpg",
                    //    "target_url": "http://192.168.0.233/ztmomo/activity/a6uttgTd5/hd.html"
                    //});
                    break;
                case 'get_available_operation_of_current_page' :
                    //JSNativeBridge.send('send_available_operation_of_current_page', {
                    //    "share": true,					//true表示此页面展示分享按钮
                    //    "scratch_paper": false				//false表示此页面不展示草稿纸按钮
                    //});
                    break;
            }
        });
    }

    function init() {
        shareDivBindEv();
        JSNativeInit();
    }

    return {
        init: init
    }
})();

compoments.init();
$('title').text(spreadData.name[Math.floor(Math.random()*3)]);
$('.none').text(spreadData.shareWording[Math.floor(Math.random()*3)]);

(function(){
    //图片预加载
    var images = new Array(),i;
    function preload() {
        for (i = 0; i < preload.arguments.length; i++) {
            images[i] = new Image()
            images[i].src = preload.arguments[i]
        }
    }
    preload(
        "./images/btn-share-h.png"
    )
})();