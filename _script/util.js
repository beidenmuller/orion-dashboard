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
                //tarEl.toggle("highlight", { color: "#FFFFF0" }, 800);
                tarEl.fadeIn();

                //tarEl.animate(
                //    { opacity: 0.7 },
                //    200,
                //    function () { tarEl.animate({ opacity: 1 }, 200); }
                //);
            }
        }
    );

    return el;
}

jQuery.fn.removeTelephoneFormatting = function () {
    var els = $(this);

    els.each(function (index, item) {
        var el = $(item);
        var val = el.val();

        val = val.replace("(", "");
        val = val.replace(")", "");
        val = val.replace("-", "");
        val = val.replace("+", "");
        val = val.replace(" ", "");

        el.val(val);
    });

    return els;
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

//var indexOf = function (needle) {
//    if (typeof Array.prototype.indexOf === 'function') {
//        indexOf = Array.prototype.indexOf;
//    } else {
//        indexOf = function (needle) {
//            var i = -1;
//            var index = -1;

//            for (i = 0; i < this.length; i++) {

//                if (this[i] == needle) {
//                    index = i;
//                    break;
//                }
//            }

//            return index;
//        };
//    }

//    return indexOf.call(this, needle);
//};

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

jQuery.fn.currencyMask = function (options) {
    var baseEl = $(this);

    //disable key up validation while the mask is applied
    baseEl.addClass("validation-ignore-onkeyup");

    options = (options) ? options : {};

    options["currencySymbol"] = options.currencySymbol || "$";
    options["maskPlaceHolder"] = options.maskPlaceHolder || "_";
    options["defaultMask"] = options.defaultMask || "___.__";
    options["allowedDecPlaces"] = options.allowedDecimalPlaces || 2;
    options["trimLeadingZero"] = options.trimLeadingZero || true;

    applyMaskFocusOut();

    baseEl.keydown(function (e, args) {
        var code = (e.keyCode ? e.keyCode : e.which);
        var el = $(e.currentTarget);

        var prevVal = removeMask(el.val());
        var decIndex = prevVal.indexOf(".");

        //check to be sure there is only one decimal in value
        if (code == 110 || code == 190) {
            setTimeout(function () {
                var newVal = removeMask(el.val());
                var decCnt = (newVal.match(/\./g) || []).length;

                if (decCnt > 1) {
                    el.val(prevVal);
                    applyCurrencyMask(el)
                } else {
                    var decIndex = newVal.indexOf(".");
                    var decPlaces = decIndex == -1 ? 0 : newVal.length - (decIndex + 1);

                    //console.log("decimal places: " + String(newVal.length - (decIndex + 1)));
                    if (decPlaces > options.allowedDecPlaces) {
                        el.val(prevVal);
                    }
                    applyCurrencyMask(el);
                }
            }, 1);
        } else if (code == 9 || code == 13 || code == 37 || code == 39) {
            return;
        } else if (isNumericKey(code)) {
            setTimeout(function () {
                var newVal = removeMask(el.val());
                var decIndex = newVal.indexOf(".");
                var decPlaces = decIndex == -1 ? 0 : newVal.length - (decIndex + 1);

                //console.log("decimal places: " + decPlaces);
                if (decPlaces > options.allowedDecPlaces) {
                    el.val(prevVal);
                }

                applyCurrencyMask(el);
            }, 1);
        } else {
            setTimeout(function () {
                var newVal = removeMask(el.val());
                //console.log("new: " + newVal);
                //console.log("prev: " + prevVal);
                if (newVal != "." && isNaN(newVal)) {
                    el.val(prevVal);
                }

                applyCurrencyMask(el);
            }, 1);
        }

        //console.log(prevVal);
    });

    baseEl.focusin(function (e) {
        //console.log(e);
        applyCurrencyMask(e.target);
    });

    baseEl.on("mask:focusout", function (e) {
        var el = $(e.target);
        var val = removeMask(el.val());

        if (options["trimLeadingZero"] == true && val.length > 0) {
            //console.log(val.charAt(0));

            while (val.charAt(0) == "0") {
                val = val.slice(1);
            }
        }

        val = fillEmptyDecimalPlaces(val);

        el.val(val);

        el.off("focusout").trigger("change").trigger("focusout");

        applyMaskFocusOut();
    });

    function applyMaskFocusOut() {
        baseEl.on("focusout", function (e) {
            var el = $(e.target);

            el.trigger("mask:focusout");
        });
    }

    function applyCurrencyMask(el) {
        var el = $(el);
        var currCursorPos = getCaretPosition(el);

        var mask = "";

        if (el.length) {
            var val = removeMask(el.val());

            if (val.length == 0) {
                mask = options.defaultMask;
            } else {
                var decIndex = val.indexOf(".");
                var currDecPlaces = decIndex == -1 ? 0 : val.length - (decIndex + 1);

                if (decIndex == -1) {
                    mask = options.maskPlaceHolder;
                } else {
                    for (var p = 0; p < options.allowedDecPlaces - currDecPlaces; p++) {
                        mask += options.maskPlaceHolder;
                    }
                }
            }

            var currSymbolLength = (options["currencySymbol"]) ? options["currencySymbol"].length : 0;

            if (currCursorPos < currSymbolLength) {
                currCursorPos = currSymbolLength;
            } else if (currCursorPos >= val.length) {
                currCursorPos = currSymbolLength + val.length;
            }

            el.val(options["currencySymbol"] + val + mask);

            if (el[0].setSelectionRange) { el[0].setSelectionRange(currCursorPos, currCursorPos); }

            //if (el[0].setSelectionRange) { el[0].setSelectionRange(val.length + options.currencySymbol.length, val.length + options.currencySymbol.length); }
        }
    }

    function fillEmptyDecimalPlaces(value) {
        if (value != null && value.length > 0) {
            var decIndex = value.indexOf(".");
            var currDecPlaces = decIndex == -1 ? 0 : value.length - (decIndex + 1);

            if (decIndex == -1) { value += "."; }

            for (var p = 0; p < options.allowedDecPlaces - currDecPlaces; p++) {
                value += "0";
            }
        }
        
        return value;
    }

    function removeMask(value) {
        var escapeChar = (options.currencySymbol == "$") ? "\\" : "";

        var symbolRegex = new RegExp(escapeChar + options.currencySymbol, "g");
        var placeHolderRegex = new RegExp(options.maskPlaceHolder, "g");
        var defaultRegex = new RegExp(options.defaultMask, "g");

        value = value.replace(defaultRegex, "");
        value = value.replace(symbolRegex, "");
        value = value.replace(placeHolderRegex, "");

        //console.log(options.currencySymbol);
        //console.log(value);

        return value;
    }

    function isNumericKey(keyCode) {
        return !isNaN(String.fromCharCode((96 <= keyCode && keyCode <= 105) ? keyCode - 48 : keyCode));
    }

    function getCaretPosition(el) {
        var el = $(el);

        // Initialize
        var caretPos = 0;

        // IE Support
        if (el.length && document.selection) {
            // Set focus on the element
            el.focus();

            // To get cursor position, get empty selection range
            var selection = document.selection.createRange();

            // Move selection start to 0 position
            selection.moveStart('character', -el.val().length);

            // The caret position is selection length
            caretPos = selection.text.length;
        }
            // Firefox support
        else if (el[0].selectionStart || el[0].selectionStart == '0')
            caretPos = el[0].selectionStart;

        return (caretPos);
    }
}

jQuery.expr[':'].parents = function (a, i, m) {
    return jQuery(a).parents(m[3]).length < 1;
};


(function ($) {
    $.each(['show', 'hide'], function (i, ev) {
        //var trigEvt = "";

        //switch (ev.toLowerCase()) {
        //    case "show":
        //    case "fadein":
        //    case "slidedown":
        //        trigEvt = "show";
        //        break;
        //    case "hide":
        //    case "fadeout":
        //    case "slideup":
        //        trigEvt = "hide";
        //        break;
        //}

        var el = $.fn[ev];

        $.fn[ev] = function () {
            this.trigger(ev);
            return el.apply(this, arguments);
        };
    });
})(jQuery);

(function ($) {
    $.each(['global:show', 'global:hide'], function (i, ev) {
        var trigEvt = "";

        switch (ev.toLowerCase()) {
            case "show":
            case "fadein":
            case "slidedown":
                trigEvt = "global:show";
                break;
            case "hide":
            case "fadeout":
            case "slideup":
                trigEvt = "global:hide";
                break;
        }

        var el = $.fn[ev];

        $.fn[ev] = function () {
            this.trigger(trigEvt);
            return el.apply(this, arguments);
        };
    });
})(jQuery);

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

jQuery.fn.shrinkToNothing = function (duration, callback) {

    callback = (typeof callback == "function") ? callback : function () { };
    
    $(this).children(":visible").hide("scale", duration);
    $(this).animate({ opacity: "0" }, { queue: false, duration: duration }).hide("scale", duration, callback);

    return this;
}

jQuery.fn.draggableShrinkOnDrop = function (revertDuration, dragFunction, stopFunction, options) {
    var dragOptions = {
        start: function (event, ui) {
            ui.helper.data("origZindex", $(this).css("z-index"));
            ui.helper.data("dropped", false);
            $(this).css("z-index", "100000");
        },
        revert: function () {
            var obj = $(this);

            if (obj.data("dropped") == true) {
                var curPos = obj.position();
                var clone = obj.clone(false);

                clone.appendTo(obj.parent());
                clone.css({ "display": "block", "position": "absolute", "top": curPos.top, "left": curPos.left });
                clone.show(1, function () {
                    obj.css("visibility", "hidden");
                    $(this).shrinkToNothing(revertDuration, function () { obj.hide().css("visibility", "visible").fadeIn(); });
                });
            }

            obj.css("z-index", obj.data("origZindex"));

            return true;
        },
        revertDuration: revertDuration
    }

    jQuery.extend(dragOptions, options);

    $(this).draggable(dragOptions);

    if (typeof dragFunction == 'function') { $(this).on("drag", dragFunction); }

    if (typeof stopFunction == 'function') { $(this).on("dragstop", stopFunction); }

    return this;
}

jQuery.fn.highlightedDroppable = function (acceptableElements, hoverClass, dropFunction) {
    $(this).droppable({
        accept: acceptableElements,
        greedy: true,
        over: function (event, ui) { },
        out: function (event, ui) { },
        drop: function (event, ui) { ui.draggable.data("dropped", true); },
        addClasses: false,
        hoverClass: hoverClass
    });

    if (typeof dropFunction == 'function') { $(this).on("drop", dropFunction); }

    return this;
}

jQuery.fn.populateOptions = function (data, currVal, includeEmptyOption) {
    var el = $(this);

    includeEmptyOption = includeEmptyOption || true;

    el.html("");

    if (includeEmptyOption != false) {
        //add empty value so that the dropdown does not default selection
        var opt = $("<option/>");
        opt.attr("value", "");
        opt.html("");
        opt.appendTo(el);
    }

    data = data || [];

    if (data.length == 0) {
        data[0] = { "Display": "No Records Found", "Value": "" }
    }

    for (var r = 0; r < data.length; r++) {
        opt = $("<option/>");
        opt.attr("value", data[r].Value);
        opt.html(data[r].Display);

        opt.appendTo(el);

        if (currVal && currVal.constructor && currVal.constructor == Array) {
            if (index = indexOf(currVal, data[r].Value) > -1) {
                opt.attr("selected", true);
            }
        } else {
            if (currVal == data[r].Value) {
                opt.attr("selected", true);
            }
        }
    }

    el.trigger("chosen:updated");

    return el;
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

jQuery.fn.selectText = function () {
    var doc = document
        , element = this[0]
        , range, selection
    ;
    if (doc.body.createTextRange) {
        range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        selection = window.getSelection();
        range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

$.fn.combobox = function (userConfig) {
    var el = $(this);

    var defaultConfig = {
        inputId: "combobox",
        inputTooltip: "",
        inputName: "combobox",
        autoCompleteDelay: 300,
        isRequired: false
    };
    
    var config = $.extend(defaultConfig, userConfig);

    var wrapper = $("<div>").addClass("custom-combobox form-control");

    var input = $("<input/>").attr({
        "type": "text",
        "value": "",
        "id": config.inputId,
        "name": config.inputName,
        //"title": config.inputTooltip,
        "placeholder": el.attr("placeholder"),
        "data-placeholder": el.attr("data-placeholder")
    }).addClass("combobox-input").addClass(config.css);

    var resultsBtn = $("<a/>").attr({ "href": "#", "tabIndex": "-1" }).addClass("combobox-toggle-results").html("&#9660;");

    var clearBtn = $("<a/>").attr({ "href": "#", "tabIndex": "-1" }).addClass("combobox-clear-val").html("&times;").hide();

    var _create = function () {
        el.addClass("combobox").chosen("destroy").hide();

        input.appendTo(wrapper);
        clearBtn.appendTo(wrapper);
        resultsBtn.appendTo(wrapper);

        wrapper.insertAfter(el);

        _createAutocomplete();
        _createButtons();

        if (el.hasClass("dynamic-lookup")) {
            el.trigger("chosen:dynamicLoad");
        }

        if (config.isRequired == true) {
            input.attr({
                "data-val": "true",
                "data-val-required": "The field is required."
            }).rules("add", "required");
        }
    }

    var _createAutocomplete = function () {
        var selected = el.children(":selected");
        var value = selected.val() ? selected.text() : "";

        input.val(value).autocomplete({
            minLength: 0,
            delay: config.autoCompleteDelay,
            source: function (request, response) {
                response(el.children("option").map(function () {
                    var text = $(this).text();

                    var testString = $(this).text().toLowerCase().indexOf(request.term);

                    if (testString !== -1) {
                        return {
                            label: text,
                            value: text,
                            option: this
                        };
                    }
                }));

                el.removeClass("loading-progress");
            },
            open: function () {
                //var position = $("#results").position();
                var position = wrapper.offset();

                var left = position.left;
                var top = position.top + wrapper.outerHeight();

                var width = wrapper.outerWidth();

                $(".ui-autocomplete").css({
                    left: left + "px",
                    top: top + "px",
                    width: width + "px"
                });
                
            },
            select: function (e, ui) { return _toggleInputRelatedControls(e, ui); },
            change: function (e, ui) { return _toggleInputRelatedControls(e, ui); }
        }).keyup(function (e, ui) { _toggleInputRelatedControls(e, ui); })
        .closest("form").on("reset", function (e, ui) { setTimeout(function () { _toggleInputRelatedControls(e, ui); }, 2); });
    }
    
    var _createButtons = function () {
        var wasOpen = false;

        resultsBtn
          .on("mousedown", function (e,ui) {
              e.preventDefault();
              wasOpen = input.autocomplete("widget").is(":visible");
          })
          .on("click", function (e, ui) {
              e.preventDefault();

              input.trigger("focus");

              // Close if already visible
              if (wasOpen == true) {
                  return;
              }

              // Pass empty string as value to search for, displaying all results
              input.autocomplete("search", "");
          });

        clearBtn.on("click", function (e, ui) {
            e.preventDefault();
            
            input.trigger("focus").val(null);

            _toggleInputRelatedControls(e, ui);
        });
    }

    var _toggleInputRelatedControls = function (e, ui) {
        var tooltip = "";

        if (input.val().length > 0) {
            clearBtn.fadeIn();
            tooltip = input.val();
        } else {
            clearBtn.fadeOut();

            if (config.isRequired !== true) {
                tooltip = config.inputTooltip;
            }
        }

        var lbl = el.data("plugin_floatlabel");

        if (lbl) {
            el.data("flout", "1");

            if (input.val().length > 0) {
                lbl.showLabel();
            } else {
                lbl.hideLabel();
            }
        }

        el.attr("title", tooltip);
        input.attr("title", tooltip);
        
        return;
    }

    _create();
}

function addOrdinalSuffix(number)
{
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