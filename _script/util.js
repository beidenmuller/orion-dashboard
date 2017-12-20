function ajaxSubmitData(requestType, url, contentType, dataType, postData, successFunction, failFunction, completeFunction, beforeSendFunction, async, cache) {

    async = (async == false) ? false : true;

    cache = (cache == null || cache == undefined) ? false : cache;

    $.ajax({
        type: requestType,
        url: url,
        data: postData,
        async: async,
        contentType: contentType,
        dataType: dataType,
        cache: cache, 
        beforeSend: beforeSendFunction,
        success: successFunction,
        error: failFunction,
        complete: completeFunction
    });
}

function scrubAspNetJsonDate(json) {
    if (json) {
        var data = (typeof json == 'object') ? JSON.stringify(json) : json;

        //parsing for both regexs since for some reason the data comes back differently 
        //depending on whether or not the data has been "stringified" in javascript
        //data = data.replace(/"\/Date\((-?[0-9]+)\)\/"/ig, "new Date($1)");
        //data = data.replace(/"\\\/Date\((-?\d+)\)\\\/"/ig, "new Date($1)");

        //switched to moment formatting because date that is generated from new Date evaluates to invalid date in knockout...weird
        data = data.replace(/"\/Date\((-?[0-9]+)\)\/"/ig, function (match, capture) {
            return '"' + moment(new Date(Number(capture))).format('MM/DD/YYYY hh:mm:ss A') + '"';
        });

        data = data.replace(/"\\\/Date\((-?\d+)\)\\\/"/ig, function (match, capture) {
            return '"' + moment(new Date(Number(capture))).format('MM/DD/YYYY hh:mm:ss A') + '"';
        });

        //data = data.replace(/"\/Date\((-?[0-9]+)\)\/"/ig, "moment(new Date($1)).format('MM/DD/YYYY hh:mm:ss A')");
        //data = data.replace(/"\\\/Date\((-?\d+)\)\\\/"/ig, "moment(new Date($1)).format('MM/DD/YYYY hh:mm:ss A')");

        data = JSON.parse(data);
    }
    
    return data;
}

function parseJsonObject(json) {
    if (json) {
        var json = (json && (typeof json == 'object')) ? json : JSON.parse(json);
    }

    return json;
}

//NOTE: created this function to help fix a jquery memory leak bug when repeatedly setting html in the DOM using .html()
jQuery.fn.destroyDOMElement = function () {
    var el = $(this);

    if (el) {
        el.clearDOMElement();
        el.remove();
    }

    return el;
}

//NOTE: created this function to help fix a jquery memory leak bug when repeatedly setting html in the DOM using .html()
jQuery.fn.clearDOMElement = function () {
    var el = $(this);

    if (el) { el.innerHTML = ""; }

    return el;
}

jQuery.fn.scrollToElement = function (target, highlight) {
    var el = $(this);
    var tarEl = $(target);
    var navBar = $(".navbar-collapse");

    //account for fixed navbar position
    var pos = tarEl.offset().top - navBar.outerHeight(true);

    el.animate(
        { scrollTop: pos },
        1000,
        "swing",
        function (e) {
            if (highlight == true) {
                tarEl.fadeIn();
            }
        }
    );

    return el;
}

var indexOf = function (haystack, needle) {
    var i = -1;
    var index = -1;

    for (i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) {
            index = i;
            break;
        }
    }

    return index;
};

jQuery.fn.fixedOnScroll = function (container, scrollableEl, minViewPortWidth) {
    var fn = this;
    var el = $(this);

    var elOrigTop;
    var elOrigCssTop;
    var elOrigCssPos;
    var elHeight;
    var absBottom;

    var elContainer = $(scrollableEl || window);

    var triggerResize = function (e) { $(elContainer).trigger("fixedOnScroll:resize"); }

    var triggerScroll = function (e) { $(elContainer).trigger("fixedOnScroll:scroll"); }

    var elScroll = function (e) {
        var vpWidth = $(window).width();
        var vptHeight = $(window).height();

        if (!minViewPortWidth || vpWidth >= minViewPortWidth) {
            var winScrollTop = $(this).scrollTop();
            
            if (!absBottom || winScrollTop <= absBottom) {
                if (winScrollTop > elOrigTop) {
                    el.css({
                        "top": winScrollTop - elOrigTop + "px",
                        "position": "relative"
                    });
                } else {
                    el.css({
                        "top": ((elOrigCssTop.length) ? elOrigCssTop : "0px"),
                        "position": ((elOrigCssPos.length) ? elOrigCssPos : "static")
                    });
                }
            }
        }
    }

    var elResize = function (e) {
        el.css({
            "top": ((elOrigCssTop.length) ? elOrigCssTop : "0px"),
            "position": ((elOrigCssPos.length) ? elOrigCssPos : "static")
        });

        elOrigTop = (elContainer.get(0) == window) ? el.offset().top : el.offset().top - elContainer.offset().top;
        elOrigCssTop = el.css("top");
        elOrigCssPos = el.css("position");
        elHeight = el.height();

        if (container) {
            container = $(container);

            absBottom = (container.length) ? container.position().top + elContainer.scrollHeight : $(window).height();
        }

        if (absBottom && absBottom >= elHeight) {
            absBottom = absBottom - elHeight;
        }

        $(elContainer).trigger("fixedOnScroll:scroll");
    }

    fn.destroy = function () {
        $(elContainer).off("fixedOnScroll:resize", elResize);

        $(elContainer).off("resize", triggerResize);

        $(elContainer).off("scroll", triggerScroll);

        $(elContainer).off("fixedOnScroll:scroll", elScroll);
    }

    fn.init = function () {
        if (el.length) {
            elOrigTop = el.position().top;
            elOrigCssTop = el.css("top");
            elOrigCssPos = el.css("position");
            elHeight = el.height();
            absBottom = 0;

            elContainer = $(scrollableEl || window);

            $(elContainer).on("fixedOnScroll:resize", elResize);

            $(elContainer).on("resize", triggerResize);

            $(elContainer).on("scroll", triggerScroll);

            $(elContainer).on("fixedOnScroll:scroll", elScroll);

            triggerResize();
        }
    }

    if (container == "destroy") {
        fn.destroy();
    }
    else {
        fn.init();
    }

    return el;
}

function formatTime(time, format, utc) {
    var timeFormat = "";

    var hr = "";
    var min = "";
    var sec = "";
    var amPm = "";

    var timeParts = time.split(":");

    //if there is an am/pm designation switch time to 24 hour
    if (timeParts[timeParts.length - 1].toLowerCase().indexOf("m") > -1) {
        if (timeParts[timeParts.length - 1].toLowerCase().indexOf("pm") > -1) {
            timeParts[0] = Number(timeParts[0]) + ((timeParts[0] == "12") ? 0 : 12);
        } else {
            timeParts[0] = (timeParts[0] == "12") ? "0" : timeParts[0];
        }

        timeParts[timeParts.length - 1] = parseInt(timeParts[timeParts.length - 1]);
    }

    switch (timeParts.length) {
        case 3:
            hr = Number(timeParts[0]);
            min = Number(timeParts[1]);
            sec = Number(timeParts[2]);
            break;
        case 2:
            hr = Number(timeParts[0]);
            min = Number(timeParts[1]);
            sec = 0;
            break;
        case 1:
            hr = Number(timeParts[0]);
            min = 0;
            sec = 0;
            break;
    }

    var tmpDt = new Date('1/1/2000');

    tmpDt.setTime(tmpDt.getTime() + hr * 3600000);
    tmpDt.setTime(tmpDt.getTime() + min * 60000);
    tmpDt.setTime(tmpDt.getTime() + sec * 1000);
    
    return formatDate(tmpDt, format, utc);
}

function formatDate(dt, format, utc) {
    if (dt instanceof String) {
        dt = (dt) ? dt.replace(/^\s+|\s+$/gm, '') : null;
    }

    if (dt) {

        var date = (dt instanceof Date) ? dt : new Date(Date.parse(dt));

        var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        function ii(i, len) { var s = i + ""; len = len || 2; while (s.length < len) s = "0" + s; return s; }

        var y = utc ? date.getUTCFullYear() : date.getFullYear();
        format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
        format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
        format = format.replace(/(^|[^\\])y/g, "$1" + y);

        var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
        format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
        format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
        format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
        format = format.replace(/(^|[^\\])M/g, "$1" + M);

        var d = utc ? date.getUTCDate() : date.getDate();
        format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
        format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
        format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
        format = format.replace(/(^|[^\\])d/g, "$1" + d);

        var H = utc ? date.getUTCHours() : date.getHours();
        format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
        format = format.replace(/(^|[^\\])H/g, "$1" + H);

        var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
        format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
        format = format.replace(/(^|[^\\])h/g, "$1" + h);

        var m = utc ? date.getUTCMinutes() : date.getMinutes();
        format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
        format = format.replace(/(^|[^\\])m/g, "$1" + m);

        var s = utc ? date.getUTCSeconds() : date.getSeconds();
        format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
        format = format.replace(/(^|[^\\])s/g, "$1" + s);

        var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
        format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])f/g, "$1" + f);

        var T = H < 12 ? "AM" : "PM";
        format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
        format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

        var t = T.toLowerCase();
        format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
        format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

        var tz = -date.getTimezoneOffset();
        var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
        if (!utc) {
            tz = Math.abs(tz);
            var tzHrs = Math.floor(tz / 60);
            var tzMin = tz % 60;
            K += ii(tzHrs) + ":" + ii(tzMin);
        }
        format = format.replace(/(^|[^\\])K/g, "$1" + K);

        var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
        format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
        format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

        format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
        format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

        format = format.replace(/\\(.)/g, "$1");
    } else {
        format = "";
    }

    return format;
};

jQuery.expr[':'].parents = function (a, i, m) {
    return jQuery(a).parents(m[3]).length < 1;
};

function getBaseHref() {
    var el = $("base");
    var baseHref = "/";

    if (el.length) {
        var tmp = el.attr("href");

        if (tmp && tmp.length > 0) {
            baseHref = tmp;
        }
    }

    var lastChar = baseHref.slice(-1);

    if (lastChar != "/") {
        baseHref += "/";
    }

    return baseHref;
}

jQuery.fn.hasAttr = function (name) {
    var attr = $(this).attr(name);
    
    return (typeof attr !== typeof undefined && attr !== null && attr !== false);
}

function getMonthName(monthIndex) {
    var monthNames = new Array();

    monthNames[0] = "January";
    monthNames[1] = "February";
    monthNames[2] = "March";
    monthNames[3] = "April";
    monthNames[4] = "May";
    monthNames[5] = "June";
    monthNames[6] = "July";
    monthNames[7] = "August";
    monthNames[8] = "September";
    monthNames[9] = "October";
    monthNames[10] = "November";
    monthNames[11] = "December";

    var tarMonth = (monthIndex >= 0 && monthIndex <= 11) ? monthNames[monthIndex] : "N/A";

    return tarMonth;
}

function addOrdinalSuffix(number){
    var suffix = "th";

    var ones = number % 10;
    var tens = Math.floor((number / 10)) % 10;

    if (tens == 1) {
        suffix = "th";
    } else {
        switch (ones) {
            case 1: 
                suffix = "st"; 
                break;
            case 2: 
                suffix = "nd"; 
                break;
            case 3: 
                suffix = "rd"; 
                break;
        }
    }

    return String(number) + suffix;
}

jQuery.fn.clickAndHold = function(options) {		
	var options = options || {};
	
	var holdThreshold = options.holdThreshold || 750;
	var onClick = options.onClick || null;
	var onHold = options.onHold || null;
	
	var tapTimer;
	
	var mDown = function(event, data){
		//console.log(event.type);
		//console.log(event);
		if (event.type.indexOf("mousedown") > -1) {
			var el = jQuery(event.currentTarget);
      
			el.data("tap-down", true);
      
			tapTimer = setTimeout(function () { 
				el.data("tap-hold", true);
				if (typeof onHold == "function") { onHold.call(el); }
			}, holdThreshold);
		} 
	}
  
	var mUp = function(event, data){
		event.stopPropagation();
		//console.log(event.type);
		//console.log(event);
		if (event.type.indexOf("mouseup") > -1) {
			clearTimeout(tapTimer); 
			var el = jQuery(event.currentTarget);
        
			var hasTapDown = cBool(el.data("tap-down") || false);
			var hasTapHold = cBool(el.data("tap-hold") || false);
      
			if (hasTapHold == false && hasTapDown == true) {           
				if (typeof onClick == "function") { onClick.call(this); }
			}

			el.data("tap-hold", false);
			el.data("tap-down", false);
		}
	}
  
	var gUp = function(event, data){
		//console.log(event.type);
		//console.log(event);
		els.each(function (index, item) {
			var el = jQuery(item);

			clearTimeout(tapTimer);

			el.data("tap-hold", false);
			el.data("tap-down", false);
		});
	}
	
	var cBool = function(val){
		val = String(val).toLowerCase();
		
		return val == "true";
	}
  
	var els = $(this);
	els.each(function (index, item) {
		var el = $(item);    
		var isTapHold = false;
  
		el.on("vmousedown", mDown);
		el.on("vmouseup", mUp);
	});
  
	jQuery(document).off("vmouseup", gUp).on("vmouseup", gUp);
  
	return els;
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
	var sParameterName = sURLVariables[i].split('=');
	if (sParameterName[0] == sParam) 
	{
	    return sParameterName[1];
	}
    }
}

function changeOrder() {
    var l = "";
    $( ".list li" ).each(function(index) {
	l = l + $(this).data("type") + "-" + $(this).data("device") + "|~|";
    });
	
    var access_token = getUrlParameter("access_token");
    var request = {list: l};
    if (access_token) request["access_token"] = access_token;

    $.get("position", request).done(function(data) {
	if (data.status == "ok") {}
    }).fail(function() {alert("error, please refresh")});
}

function updateOrderByDisplay(){
	var ebp = [];

	var el;

	$("#freewall .cell").each(function(index,item){
		el = $(item);

		ebp.push({ "Element": el, "Top": el.offset().top, "Left": el.offset().left });
	});

	ebp.sort(function(a,b){
		if(a.Top > b.Top){
			return 1;
		} else if (a.Top < b.Top) {
			return -1;
		} else {
			return (a.Left > b.Left) ? 1 : -1;
		}
	});
	
	var l = "";
	var orderChanged = false;
	for(var e = 0; e < ebp.length; e++){
		el = ebp[e].Element;

		var currPos = Number(el.data("display-index") || 0);
		var newPos = e;
		
		l = l + el.data("type") + "-" + el.data("device") + "|~|";
		
		el.data("display-index", e);
		
		if(currPos != newPos){
			orderChanged = true;
		}
	}

	if(orderChanged){
		var access_token = getUrlParameter("access_token");
		var request = {list: l};
		if (access_token) { request["access_token"] = access_token; }

		$.get("position", request)
			.done(function(data) { if (data.status == "ok") {} })
			.fail(function() {alert("error, please refresh")});
	}
}
