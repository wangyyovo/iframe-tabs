var rf = {
    key: {
        navmin: "c_navmin",/*导航最小化*/
        navtype: "c_navtype",/*导航浮动*/
        navskin: "c_navskin",/*导航皮肤*/
        fontsize: "c_fontsize",/*字体大小*/
        fontfamily: "c_fontfamily",/*字体*/
        btntype: "c_btntype"/*按钮皮肤*/
    },
    //localStorage
    ls: function (k, v) {
        if (arguments.length == 2) {
            localStorage[k] = v;
        } else {
            return localStorage[k] || null;
        }
    },
   
    //Mobile
    isPC: function () { return !navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i) },
    //DOM集合某一项是否包含节点
    contains: function (arr, target) {
        var item = null;
        $(arr).each(function () {
            if (this.contains(target)) {
                item = this;
                return false;
            }
        })
        return item;
    },
    //选项卡定位
    PositionTab: function () {
        var mm = $('#mtab-main'), vw = mm.parent().width(), sw = mm[0].scrollWidth;
        if (sw > vw) {
            var max = 0, min = -1 * (sw - vw), ml = 3, left = parseFloat(mm.css('left')), ca;
            mm.children().each(function () {
                ml += $(this).outerWidth() + 3;
                if (this.className.indexOf("active") >= 0) {
                    ca = this;
                    return false;
                }
            });
            if (ml + left > vw) {
                ml = -1 * ml + (vw / 2);
                ml = Math.max(min, ml);
                mm.css('left', ml);
            } else if (ml - $(ca).outerWidth() + left < 0) {
                ml = -1 * ml + (vw / 2);
                ml = Math.min(0, ml);
                mm.css('left', ml);
            }
        }
    },
    //打开选项卡 链接、含图标的标题，false不显示关闭按钮(可选)
    OpenPage: function (url, title, close) {
        var isopen = false, mmc = $('#mtab-main').children(), mb = $('#mtabox');
        mmc.removeClass('active');
        mb.children().removeClass('active');
        mb.find('iframe').each(function () {
            var shorturl = (this.src.split(location.host)[1] || "").toLowerCase();
            shorturl = shorturl.split('?')[0];
            if (shorturl != "" && url.toLowerCase().indexOf(shorturl) > -1) {
                //取消注释，点击导航会刷新页面
                //this.src = url;
                var pageid = $(this).parent().addClass('active')[0].id;
                mmc.each(function () {
                    if (this.hash == "#" + pageid) {
                        $(this).addClass('active');
                        return false;
                    }
                });
                isopen = true;
                return false;
            }
        });
        if (!isopen) {
            var pageid = "page_" + new Date().valueOf(), close = close == false ? '' : '<em class="fa fa-close"></em>';
            mmc.end().append('<a href="#' + pageid + '" class="active">' + title + close + '</a></li>');
            mb.append('<div class="tab-pane active" id="' + pageid + '"><iframe frameborder="0" src="about:blank"></iframe></div>');
            $('#' + pageid).find('iframe')[0].src = url;
        }

        //定位、调整
        rf.PositionTab();
        rf.IframeAuto();

        //Mobile 打开时隐藏菜单导航
        if (!rf.isPC()) {
            var mt = $('#menu-toggler');
            mt.hasClass('display') && $('#menu-toggler')[0].click();
        }
    },
    //Iframe自适应、延迟响应
    IframeAuto: function () {
        clearTimeout(window.deferIA);
        window.deferIA = setTimeout(function () {
            var box = $('#mtabox'), sh = $(window).height() - box.offset().top;
            box.children('div').css("height", sh);
        }, 100);
    }
};

//点击选项卡
$('#mtab').click(function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    if (target.nodeName == "EM" && target.className.indexOf('fa-close') >= 0) {
        //关闭
        var ta = $(target).parent();
        if (ta.hasClass('active')) {
            ta.prev().addClass('active');
            $(ta[0].hash).prev().addClass('active');
        }
        $(ta[0].hash).remove();
        ta.remove();
        rf.PositionTab();
        return false;
    } else if ($(this).children('a')[0].contains(target)) {
        //左滑
        var mm = $('#mtab-main'), vw = mm.parent().width(),
            left = parseFloat(mm.css('left')) + (vw / 2);
        mm.css('left', Math.min(0, left));
    } else if ($(this).children('a').last()[0].contains(target)) {
        //右滑
        var mm = $('#mtab-main'), vw = mm.parent().width(),
            min = -1 * (mm[0].scrollWidth - mm.parent().width()),
            left = parseFloat(mm.css('left')) - (vw / 2);
        mm.css('left', Math.max(min, left));
    } else {
        var item = rf.contains($('#mtab-menu').children(), target);
        if (item) {
            
        } else {
            var mmc = $('#mtab-main').children();
            item = rf.contains(mmc, target);
            if (item) {
                if (item.className.indexOf('active') == -1) {
                    //选项卡标签
                    mmc.removeClass('active');
                    $(item).addClass("active");
                    $('#mtabox').children().removeClass('active');
                    $(item.hash).addClass('active');
                    rf.PositionTab();
                }

                if($('.dropdown').hasClass('open'))
                    $('.dropdown-toggle').dropdown('toggle');
                return false;
            }
        }
    }
});


$('.tabShowActive').click(function (e) {
    rf.PositionTab();
});

$('.tabCloseOther').click(function (e) {
    //关闭其他
    var mmc = $('#mtab-main').children();
    mmc.each(function (i) {
        if (i && this.className.indexOf("active") == -1) {
            $(this.hash).remove();
            $(this).remove();
        }
    }).end().css('left', 0);
});

$('.tabCloseAll').click(function (e) {
    //关闭全部
    var mmc = $('#mtab-main').children();
    if (mmc.length) {
        mmc.each(function (i) {
            if (i) {
                $(this.hash).remove();
                $(this).remove();
            }
         }).first().addClass('active');
         $(mmc.first()[0].hash).addClass('active');
         mmc.end().css('left', 0);
    }
});

$('.tabReFresh').click(function (e) {
     //刷新
    var currt = $('#mtabox').children('div.active').children();
    if (currt.length) {
        currt[0].contentWindow.location.reload(false);
    }
});

$(window).resize(rf.IframeAuto);
