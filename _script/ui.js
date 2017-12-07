function setupSiteNavigation() {
    $(".icon-menu").on("click", function () {
        var el = $(this);

        var menu = el.find('.dropdown-menu');

        if (menu.length) {
            var menuLeft = el.offset().left;

            var isEntirelyVisible = ((menuLeft + menu.width()) <= $("body").width())

            if (!isEntirelyVisible) {
                menu.addClass('pull-right'); var feedbackLink = '<a class="feedback-link" data-modal-link="true" href="/Feedback/Index" title="Submit Feedback" tabindex="-1">Feedback</a>';

                if (modalBody.length) {
                    modalBody.html(content + feedbackLink);
                }
            } else {
                menu.removeClass('pull-right');
            }
        }
    });
}

var msgDisposeTimer;

function hideActiveServerMessages(msgBox) {
    var disposeTimer = 2500;

    msgBox = (msgBox != null) ? $(msgBox) : $(".page-body .dialog.alert.alert-dismissable");

    var serverMessageDispose = function () {
        msgBox.each(function (index, item) {
            var el = $(item);

            if (el.is(":hover")) {
                msgDisposeTimer = setTimeout(serverMessageDispose, disposeTimer);
            } else {
                el.slideUp('slow', function () { el.remove(); });
            }
        });
    }

    msgDisposeTimer = setTimeout(serverMessageDispose, disposeTimer);
}

function setupLoginForm() {
    $("form.login-form")
        .off("dynamicFormSubmit:success", dismissLoginModal)
        .on("dynamicFormSubmit:success", dismissLoginModal)
        .find('#Password')
        .bind("cut copy paste", function (e) {
            e.preventDefault();
        })
        .keyup(function () {
            var pwdVal = $(this).val() || '';
            var keyCntFld = $("#KSC");

            var keyCntVal = keyCntFld.val();

            if (pwdVal.length > 0) {
                keyCntVal = (keyCntVal.length > 0) ? parseInt(keyCntVal) : 0;

                keyCntVal++;

                keyCntFld.val(keyCntVal);
            } else {
                keyCntFld.val(0);
            }
        });
}

function dismissLoginModal(e, data) {
    var frm = $(this);

    var data = (typeof data == 'object') ? data : JSON.parse(data);

    if (data != null && data.AccountInUse != null && data.AccountInUse == true) {
        $.confirm(
            "",
            "Your session was terminated and this account is now in use by another device/web browser<br /><br />You must be redirected to the login page<br /><br />Would you like to be redirected now?",
            function () { location.href = getBaseHref() + "Home/Login/"; },
            function () { }
        );
    }

    var mdl = frm.closest(".modal");

    if (mdl.length) {
        setTimeout(function () { mdl.modal("hide"); }, 1500);
    }
}

function setupUserShortcuts() {
    $(".main-nav .dropdown-menu a").draggableShrinkOnDrop(400, null, null, {
        containment: ".page",
        handle: "img.drag-handle",
        start: function (event, ui) {
            ui.helper.bind("click.prevent",
                function (e) { e.preventDefault(); });
        },
        stop: function (e, ui) {
            setTimeout(function () { ui.helper.unbind("click.prevent"); }, 300);
        }
    });

    $(".user-nav").droppable({
        greedy: true,
        accept: ".main-nav .dropdown-menu a",
        hoverClass: "drop-hover",
        activate: function (e, ui) {
            e.preventDefault();
            var el = $(this);
            var textEl = el.find(".dropdown a .collapsed:first");

            if (textEl.length) {
                var cloneEl = textEl.clone(false, false).addClass("tempDropText").text("Add Shortcut");

                textEl.hide();

                cloneEl.insertBefore(textEl);
            }
        },
        deactivate: function (e, ui) {
            var el = $(this);

            el.find(".dropdown a .tempDropText").remove()

            var textEl = el.find(".dropdown a .collapsed");

            if (textEl.length) {
                textEl.show();
            }
        },
        drop: function (e, ui) {
            ui.draggable.data("dropped", true);

            var routeHref = ui.draggable.attr("href");
            var routeText = ui.draggable.text();
            var routeTitle = ui.draggable.attr("title");

            var url = getBaseHref() + "User/AddShortcut/";
            var postData = {}

            postData["systemNavigationRouteId"] = ui.draggable.data("route-id");

            ajaxSubmitData(
                "POST",
                url,
                "application/json;charset=utf-8",
                "json",
                JSON.stringify(postData),
                function (data) {
                    var shortcutMenu = $(".user-shortcuts .dropdown-menu");

                    var existing = $(".user-shortcuts .dropdown-menu li a[data-route-id='" + postData["systemNavigationRouteId"] + "']");

                    if (!existing.length) {
                        var li = $("<li />");

                        var lnk = $("<a />")
                            .attr({ "data-route-id": postData["systemNavigationRouteId"], "href": routeHref, "title": routeTitle })
                            .text(routeText);

                        var delLnk = $("<span />")
                            .attr({ "data-route-id": postData["systemNavigationRouteId"], "title": "Remove " + routeText.toLowerCase() + " from shortcuts" })
                            .addClass("glyphicon glyphicon-remove remove");

                        //apply remove click handler to new element
                        delLnk.click(removeUserShortcut);

                        li.append(lnk);
                        li.append(delLnk)

                        shortcutMenu.append(li);

                        var shortcutItems = $(".user-shortcuts .dropdown-menu li");

                        shortcutItems.sort(function (a, b) {
                            a = $(a).find("a").text();
                            b = $(b).find("a").text();

                            // compare
                            if (a > b) {
                                return 1;
                            } else if (a < b) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });

                        shortcutMenu.append(shortcutItems);
                    }

                    $(".empty-shortcut-item").remove();

                    renderServerMessages("error", ".page-body");
                }, //successFunction
                function () {
                    renderServerMessages("error", ".page-body");
                }, //failFunction
                function () { }, //completeFunction
                function () { } //beforeSendFunction
            );
        }
    });

    $(".dropdown.submenu > a").click(function (e, ui) {
        e.preventDefault();

        $(this).closest(".dropdown").toggleClass("open");

        return false;
    });

    $(".user-nav .user-shortcuts .dropdown-menu li .remove").click(removeUserShortcut);
}

function removeUserShortcut(event, ui) {
    var el = $(this);
    var li = el.closest("li");

    var url = getBaseHref() + "User/RemoveShortcut/";
    var postData = {}

    postData["systemNavigationRouteId"] = el.data("route-id");

    var confirm = jQuery.confirm(
        "Remove Shortcut",
        "Are you sure you want to remove this shortcut?",
        function () {
            ajaxSubmitData(
                "POST",
                url,
                "application/json;charset=utf-8",
                "json",
                JSON.stringify(postData),
                function (data) {
                    li.remove();

                    renderServerMessages("error", ".page-body");
                }, //successFunction
                function () {
                    renderServerMessages("error", ".page-body");
                }, //failFunction
                function () { }, //completeFunction
                function () { } //beforeSendFunction
            );
        }, //yes
        function () { return false; } //no
    );

    $(".user-nav, .user-nav .user-shortcuts").on("hide.bs.dropdown", function (e) {
        $(this).off(e);

        return false;
    });

    return false;
}

function checkSystemMessages(callback) {
    var modalLoginCss = "xrqx1-modal-login"

    var loginModalDialog = $("." + modalLoginCss);

    //if the modal login form is currently being displayed don't even bother checking for messages
    if (!loginModalDialog.length) {
        ajaxSubmitData(
            "POST",
            getBaseHref() + "UserNotification/New/",
            "application/json; charset=utf-8",
            "json",
            JSON.stringify({ maxAgeInMinutes: 1 }),
            function (msgs) {
                var priorityLevel;

                if (msgs != null && msgs.Data != null && msgs.Data.length > 0) {

                    data = msgs.Data;

                    for (var i = 0; i < data.length; i++) {
                        var elId = data[i].Id;

                        toastr.options = {
                            "closeButton": true,
                            "debug": false,
                            "positionClass": "toast-bottom-right",
                            "onclick": function (data) { loadModalPageFromUrl(getBaseHref() + "UserNotification/" + elId + "/Detail/"); /*loadModalPageFromUrl(getBaseHref() + "UserNotification/Detail/" + elId + "/", 900, 600, false);*/ },
                            "showDuration": "300",
                            "hideDuration": "1000",
                            "timeOut": "5000",
                            "extendedTimeOut": "1000",
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        }

                        if(data[i].SystemPriorityLevelId == 3) { 
                            priorityLevel = "error";

                            $(".high-priority-message-alert").css("display", "block");

                            //var sidebarHandle = $(".page-header.sidebar .main-nav-handle");

                            //var priorityMsg = "You have a high priority message";

                            //sidebarHandle.addClass("high-priority")
                            //    .attr("title", priorityMsg)
                            //    .find("img").attr({ "alt": priorityMsg, "title": priorityMsg });
                        } else {
                            priorityLevel = "info";
                        }

                        toastr[priorityLevel](data[i].Content.substring(0, 25) + "...", data[i].Subject);
                    };

                    //update total unread count
                    ajaxSubmitData(
                        "POST",
                        getBaseHref() + "UserNotification/UnreadCount/",
                        "application/json; charset=utf-8",
                        "json",
                        {},
                        function (data) { $(".unread-notification-count").html(msgs.TotalRecords); },
                        function (xhr, status, error) { },
                        function () { },
                        function () { }
                    );
                }
            },
            function (xhr, status, error) {
                if (xhr.status == 401) {
                    if (!loginModalDialog.length) {
                        var currPath = window.location.pathname.toLowerCase();
                        var loginPath = (getBaseHref() + "home/login/").toLowerCase();

                        currPath += (currPath.slice(-1) != "/") ? "/" : "";

                        if (currPath != loginPath) {
                            loadModalPageFromUrl(loginPath).addClass(modalLoginCss);

                            setTimeout(function () { setupLoginForm(); }, 1000);
                        }
                    }
                }
            },
            function () { },
            function () { }
        );
    }

    if (typeof callback == "function") { callback.call(this); }
}

function checkUnreadSystemMessages(callback) {
    ajaxSubmitData(
        "POST",
        getBaseHref() + "UserNotification/Unread/",
        "application/json; charset=utf-8",
        "json",
        JSON.stringify({}),
        function (data) {
            if (data.Data && data.Data.length > 0) {
                toastr.options = {
                    "closeButton": true,
                    "debug": false,
                    "positionClass": "toast-bottom-right",
                    "onclick": function (data) { window.location.href = getBaseHref() + "UserNotification/Index/"; },
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "5000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                }

                toastr["info"]("View messages now", "You have unread messages");
            }
        },
        function () { },
        function () { },
        function () { }
    );

    if (typeof callback == "function") { callback.call(this); }
}

function buildBsModal(container, title, content, showHeaderClose, showFooterClose, size) {

    container = container || "body";

    var modalContainer = $("<div/>").addClass("modal fade").attr("role", "dialog");

    var modalDialog = $("<div/>").addClass("modal-dialog");

    var modalContent = $("<div/>").addClass("modal-content");

    var modalHeader = $("<div/>").addClass("modal-header");

    var modalBody = $("<div/>").addClass("modal-body");

    var modalFooter = $("<div/>").addClass("modal-footer");

    if (size && size != null) {
        modalDialog.addClass(size);
    }

    if (showHeaderClose === true) {
        var btnHeaderClose = $("<button />");
        btnHeaderClose.attr("data-dismiss", "modal");
        btnHeaderClose.addClass("close");
        btnHeaderClose.attr("aria-hidden", "true");
        btnHeaderClose.html("&times;");

        modalHeader.append(btnHeaderClose);
    }

    if (title && title != null) {
        var modalTitle = $("<h3 />").addClass("modal-title").html(title);
        modalHeader.append(modalTitle);
    }

    if (showFooterClose === true) {
        var btnFooterClose = $("<a />");
        btnFooterClose.addClass("btn");
        btnFooterClose.attr("data-dismiss", "modal");
        btnFooterClose.attr("aria-hidden", "true");
        btnFooterClose.html("Close");

        modalFooter.append(btnFooterClose);
    }

    modalBody.html(content);

    modalContent.append(modalHeader);
    modalContent.append(modalBody);
    modalContent.append(modalFooter);
    modalDialog.append(modalContent);
    modalContainer.append(modalDialog);

    $(container).append(modalContainer);

    modalContainer.modal();

    return modalContainer;
}

function setBsModalContent(bsModal, content) {
    var el = $(bsModal);

    var modalBody = el.find(".modal-content .modal-body");

    if (modalBody.length) {
        modalBody.html(content);
    }

    return;
}

function setBsModalTitle(bsModal, title) {
    var el = $(bsModal);

    var modalTitle = el.find(".modal-header .modal-title");

    if (modalTitle.length) {
        modalTitle.html(title);
    }

    return;
}

function appendModalFeedbackLink(bsModal, url) {
    var el = $(bsModal);

    if (el.length) {
        var modalFooter = el.find(".modal-content .modal-footer");

        var feedbackUrl = getBaseHref() + "Feedback/Index";

        if (url == null || url.length == 0 || url.toLowerCase() != feedbackUrl.toLowerCase()) {
            var feedbackLink = '<a class="feedback-link" data-modal-link="true" href="' + feedbackUrl + '" title="Submit Feedback">Feedback</a>';

            if (modalFooter.length) {
                modalFooter.append(feedbackLink);
            }
        }
    }

    return;
}

function setupDataChangeNotification() {
    $('form').find('input,select,textarea,.chosen-container a').filter(':not([readonly],[data-suppress-change-event]):enabled').on('change', function () {
        $(window).bind('beforeunload', function () {
            return "There are currently unsaved changes on this page!";
        });

        //make sure fields that rely on this field because of a custom lookup method/parameter definition in view model are reset so values do not get out of sync
        var fld = $(this);

        //look for fields with data-related-property == the changed field's name
        var dependentFlds = $("[data-related-property~='" + fld.attr("name") + "']");

        dependentFlds.each(function (index) {
            var el = $(this);

            //TODO: find way to check if value has actually changed to avoid validation being launched unnecessarily on related fields
            el.val("").trigger("change");

            if (el.is("select")) {
                try { el.trigger("chosen:updated"); }
                catch (ex) { }
            }
        });

        $("label[for='" + fld.attr("id") + "']").addClass(Input_Pending_Change_Class);

        var lblData = fld.data("plugin_floatlabel");

        if (lblData != null && lblData.$label) {
            lblData.$label.addClass(Input_Pending_Change_Class);
        }

        var fldData = fld.data();

        if (fldData != null && fldData.chosen != null) {
            fld = fldData.chosen.container;
        }

        fld.addClass(Input_Pending_Change_Class);

        toggleTabPendingChangeDisplay(fld);
    });

    $('form').on('reset', function () {
        $(window).unbind("beforeunload");

        $(this).find('input,select,textarea,.chosen-container a').filter(':not([readonly],[data-suppress-change-event]):enabled').each(function(index, item){
            var fld = $(item);

            $("label[for='" + fld.attr("id") + "']").removeClass(Input_Pending_Change_Class);

            var lblData = fld.data("plugin_floatlabel");

            if (lblData != null && lblData.$label) {
                lblData.$label.removeClass(Input_Pending_Change_Class);
            }

            var fldData = fld.data();

            if (fldData != null && fldData.chosen != null) {
                fld = fldData.chosen.container;
            }

            fld.removeClass(Input_Pending_Change_Class);

            toggleTabPendingChangeDisplay(fld, true);
        });
    });

    $('form').on('submit', function () {
        $(window).unbind("beforeunload");

        $(this).find('input,select,textarea,.chosen-container a').filter(':not([readonly],[data-suppress-change-event]):enabled').each(function (index, item) {
            var fld = $(item);

            $("label[for='" + fld.attr("id") + "']").removeClass(Input_Pending_Change_Class);

            var lblData = fld.data("plugin_floatlabel");

            if (lblData != null && lblData.$label) {
                lblData.$label.removeClass(Input_Pending_Change_Class);
            }

            var fldData = fld.data();

            if (fldData != null && fldData.chosen != null) {
                fld = fldData.chosen.container;
            }

            fld.removeClass(Input_Pending_Change_Class);

            toggleTabPendingChangeDisplay(fld, true);
        });
    });
}

function setupDefaultFormToolbar() {
    //$("form").each(function(index, el){
    //    var frm = $(this);

    //    //do not fix toolbar when contained in a modal window
    //    if (!frm.closest("modal").length) {
    //        frm.find(".action-toolbar").fixedOnScroll(frm);
    //    }
    //});
}

function execOnTargetElement(target) {
    if (target) {
        try {
            tarInfo = String(target).split(":");

            var el;
            
            switch (tarInfo[0].toUpperCase()) {
                case "GRID":
                    el = $(tarInfo[1]);
                    el.jqxGrid("updatebounddata", "data");
                    break;
                case "KOGRID":
                    el = $(tarInfo[1]);
                    var cntrlr = ko.dataFor(el[0]);
                    
                    if (cntrlr != null) { cntrlr.loadRecords(); }
                    break;
                case "BULKSCHED":
                    //el = $(tarInfo[1]);
                    populateSchedule(formatDate($("#ViewDate").val(), "MM-dd-yyyy"));
                    break;
                case "DYNATAB":
                    el = $(tarInfo[1]);
                    el.trigger("dynamicTab:loadContent")
                case "DYNALOOKUP":
                    //if the dropdown has already been populated then repopulate the list
                    el = $(tarInfo[1]);
                    el.trigger(
                        "chosen:dynamicLoad",
                        [{
                            afterLoad: function () {
                                //set the selected value to the recently added option ???? - multi vs single value
                                //assume the last option added has the highest value (i.e. id)
                                var maxValue = null;

                                $("option", el).each(function () {
                                    var val = $(this).attr("value");
                                    val = parseInt(val, 10);

                                    if (!isNaN(val) && (maxValue == null || maxValue < val)) {
                                        maxValue = val;
                                    }
                                });

                                if (maxValue != null) {
                                    el.find("option[value=" + maxValue + "]").attr("selected", true);
                                }

                                el.trigger("chosen:updated").trigger("change");

                                var lbl = el.data("plugin_floatlabel");

                                if (lbl) {
                                    el.data("flout", "1");

                                    lbl.showLabel();
                                }
                            }
                        }]
                    );

                    break;
                case "CAL":
                    var cal = $(tarInfo[1]);
                    //cal = cal.calendar();
                    cal.view();
                    break;
            }
        } catch (x) { }
    }
}

function setupSubNavigation() {
    //var lnks = $(".subnav .dropdown-menu a");

    //lnks.off("click");

    //lnks.click(function (event) {
    //    event.preventDefault();

    //    var el = $(this);

    //    loadPageFromUrl(el.attr("href"), el);
    //});

    //$(".breadcrumb").find('.subnav.icon-menu').off("click").on("click", function (e, ui) {
    //    e.preventDefault();

    //    loadModalPageFromElement($(this).find(".subnav-menu-container"), null, "md", "body");
    //});
}

function setupHeaderCollapse() {
    $(".page-header .page-header-collapse").click(function (e, ui) {
        e.preventDefault();

        var el = $(this);

        var removeClass = "";
        var addClass = "";
        var status = "";

        var pageHeader = $(".page-header");

        if (pageHeader.hasClass("collapsed")) {
            $(".page-header").removeClass("collapsed");

            removeClass = "glyphicon-chevron-down";
            addClass = "glyphicon-chevron-up";

            status = "";
        } else {
            $(".page-header").addClass("collapsed");

            removeClass = "glyphicon-chevron-up";
            addClass = "glyphicon-chevron-down";

            status = "collapsed";
        }

        var expireDate = new Date();
        //525600 minutes in 365 days
        expireDate.setTime(expireDate.getTime() + (525600 * 60 * 1000));

        $.cookie("pageHeaderStatus", status, { expires: expireDate, path: '/' });

        el.find(".glyphicon").removeClass(removeClass).addClass(addClass);
    });
}

jQuery.extend({
    confirm: function (title, content, onYes, onNo) {
        modalconfirmDialog = $("<div/>");

        modalconfirmDialog.dialog({
            autoOpen: true,
            modal: true,
            title: title,
            dialogClass: "modal-confirm",
            appendTo: $("body"),
            show: { effect: "fadeIn", duration: 500 },
            hide: { effect: "fadeOut", duration: 500 },
            buttons: [
                {
                    text: "Yes",
                    "class": "btn btn-default",
                    click: function () {
                        if (typeof onYes == "function") { onYes.call(this); }
                        $(this).dialog("close");
                    }
                },
                {
                    text: "No",
                    "class": "btn btn-default",
                    click: function () {
                        if (typeof onNo == "function") { onNo.call(this); }
                        $(this).dialog("close");
                    }
                }
            ],
            close: function (event, ui) { modalconfirmDialog.html(''); /*modalconfirmDialog.destroyDOMElement();*/ }, //destroying element causes error when trying to add centering
            open: function () { enableModalCentering(modalconfirmDialog); }
        }).html(content);

        $(window).trigger("resize");

        //modalconfirmDialog.css({ zIndex: 100101 });

        return modalconfirmDialog;
    }
});

jQuery.extend({
    alert: function (title, content, onOk) {
        modalconfirmDialog = $("<div/>");

        modalconfirmDialog.dialog({
            autoOpen: true,
            modal: true,
            title: title,
            dialogClass: "modal-confirm",
            appendTo: $("body"),
            show: { effect: "fadeIn", duration: 500 },
            hide: { effect: "fadeOut", duration: 500 },
            buttons: [
                {
                    text: "Ok",
                    "class": "btn btn-default",
                    click: function () {
                        if (typeof onOk == "function") { onOk.call(this); }
                        $(this).dialog("close");
                    }
                }
            ],
            close: function (event, ui) { modalconfirmDialog.html(''); /*modalconfirmDialog.destroyDOMElement();*/ }, //destroying element causes error when trying to add centering
            open: function () { enableModalCentering(modalconfirmDialog); }
        }).html(content);

        $(window).trigger("resize");

        //modalconfirmDialog.css({ zIndex: 100101 });

        return modalconfirmDialog;
    }
});

function renderServerMessages(msgType, targetEl, autoHide) {
    var url = "";
    var classNames = "";
    var el = $(targetEl);

    autoHide = autoHide || false;

    switch (msgType) {
        case "error":
            url = getBaseHref() + "Home/GetSerializedErrorMessages/";
            classNames = "dialog error alert alert-danger alert-dismissable";
            break;
        case "warning":
            url = getBaseHref() + "Home/GetSerializedWarningMessages/";
            classNames = "dialog warning alert alert-warning alert-dismissable";
            break;
        case "success":
        case "confirmation":
            url = getBaseHref() + "Home/GetSerializedconfirmationMessages/";
            classNames = "dialog success alert alert-success alert-dismissable";
            break;
    }

    var prevMsgs = $("." + classNames.replace(" ", "."));

    if (prevMsgs.length) { prevMsgs.remove(); }

    ajaxSubmitData(
        "GET",
        url,
        "application/json;charset=utf-8",
        "json",
        {},
        function (data, status, xhr) {
            //alert(msgType + " messages: " + JSON.stringify(data));

            if (data != null && data.length > 0) {
                var container = $("html").find("." + classNames.replace(/ /g, "."));

                if (container != undefined && container != null && container.length != 0) {
                    container.html("");
                } else {
                    container = $("<div/>");
                    container.addClass(classNames);
                }

                var message;
                for (var m = 0; m < data.length; m++) {
                    message = $("<div/>");
                    message.addClass("message");
                    message.html(data[m]);

                    container.append(message);
                }

                var closeBtn = ('<button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="$(\'alert\').alert(\'close\')"><span aria-hidden="true">&times;</span></button>');

                container.prepend(closeBtn);

                el.prepend(container);

                if (!isElementInVisiblePane(container)) {
                    $("html, body, .modal").scrollToElement(container, true);
                }

                if (autoHide !== false) {
                    hideActiveServerMessages(el.find(".dialog.alert"));
                }
            }
        },
        function (xhr, ajaxOptions, thrownError) {
            //alert("msg error: " + xhr.responseText);
        },
        function () {
            //alert("msg complete");
        },
        function () {
            //alert("msg getting ready to send");
        }
    );
}

function renderMessage(msg, msgType, targetEl, cssClass, autoHide) {
    var url = "";
    var classNames = "";
    var el = $(targetEl);

    autoHide = autoHide || false;

    switch (msgType) {
        case "error":
            classNames = "dialog error alert alert-danger alert-dismissable";
            break;
        case "warning":
            classNames = "dialog warning alert alert-warning alert-dismissable";
            break;
        case "info":
            classNames = "dialog warning alert alert-info alert-dismissable";
            break;
        case "success":
        case "confirmation":
            classNames = "dialog success alert alert-success alert-dismissable";
            break;
    }

    var container = $("html").find("." + classNames.replace(/ /g, "."));

    if (cssClass != null && cssClass.length > 0) {
        classNames += " " + cssClass;
    }

    if (container.length) {
        container.html("");
    } else {
        container = $("<div/>");
        container.addClass(classNames);
    }

    var message;
    message = $("<div/>");
    message.addClass("message");
    message.html(msg);

    container.append(message);

    var closeBtn = ('<button type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="$(\'alert\').alert(\'close\')"><span aria-hidden="true">&times;</span></button>');

    container.prepend(closeBtn);

    el.prepend(container);

    $("html, body").scrollToElement(container, true);

    if (autoHide !== false) {
        setTimeout(
            function () { el.find(".dialog.alert").slideUp('slow', function () { $(this).remove(); }); }
            , 2500
        );
    }
}

function isElementInVisiblePane(el) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elTop = $(el).offset().top;
    var elBottom = elTop + $(el).height();

    return ((elBottom <= docViewBottom) && (elTop >= docViewTop));
}

function setupKoEditableGrid(controller, viewModel, configuration, dataUrl, containerEl, formEl, afterBindingFunc) {

    var el = $(containerEl);
    var frm = $(formEl);

    controller.dataUrl(dataUrl);

    ajaxSubmitData(
        "POST",
        dataUrl,
        "application/json;charset=utf-8",
        "JSON",
        {},
        function (data, status, xhr) {
            data = scrubAspNetJsonDate(data);
            
            var tmpData = [];
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    tmpData.push(new viewModel(data[i]));
                }
            }
            
            controller.records(tmpData);
            controller.setConfiguration(configuration);
            controller.dataUrl(dataUrl);

            //NOTE: need to disable select plugin here since the unapply bindings will remove the link between the actual form field and the plugin
            disableJQuerySelectFields(el);

            ko.unapplyBindings(
                el,
                false,
                function () {
                    enableKoForm(formEl, new viewModel());

                    ko.applyBindings(controller, el[0]);

                    $.validator.unobtrusive.parseDynamicContent($(formEl));

                    if (typeof afterBindingFunc == 'function') { afterBindingFunc.call(this); }

                    //setupDateTimeFields(el);

                    setupFormInputMasking(el);

                    setupJQuerySelectFields(el);

                    forceJQuerySelectDynamicLoad(formEl, false);

                    setValidationDefaults(formEl);

                    focusFirstInput(formEl);
                });

        }, //success function
        function (xhr, ajaxOptions, thrownError) { }, //error function
        function () {
            el.removeClass("loading-progress", {
                complete: function () {
                    frm.animate({ "opacity": 1 }, "fast")

                    //frm.css("visibility", "initial");
                }
            });
        }, //complete function
        function () {
            frm.css("opacity", "0");
            el.addClass("loading-progress");
        } //before send function
    );
}

function displayTransactionCount(url, elSelector) {
    ajaxSubmitData(
        "POST",
        url,
        "application/json",
        "JSON",
        { "pagenumber": 0, "pagesize": 0 },
        function (data, status, xhr) {
            if (data && data.TotalRecords != null) {
                var el = $(elSelector);

                if (el.length) {
                    var badge = el.find(".badge.record-count");

                    if (badge.length) {
                        badge.html(data.TotalRecords);
                    } else {
                        el.append("&nbsp;<span class='badge record-count'>" + data.TotalRecords + "</span>").fadeIn();
                    }
                }
            }
        },
        function (xhr, ajaxOptions, thrownError) { }, //error
        function () { }, //complete
        function () { } //before send
    );
}

function toggleTabPendingChangeDisplay(element, removeStatus) {
    var element = $(element);
    
    //check if item is inside a hidden tab-pane
    var parentTabPane = element.closest(".tab-pane");
    
    var parentResponsiveTabPane = element.closest(".panel");

    if (parentTabPane.length) {
        var tabPaneId = parentTabPane.attr("id");

        if (tabPaneId.length > 0) {
            var tabs = $("body").find(".nav-tabs");

            if (tabs.length) {
                var changeTabs = tabs.find("li a[href='#" + tabPaneId + "']");
                
                if (changeTabs.length) {
                    if (removeStatus) {                        
                        var otherChanges = parentTabPane.find(Input_Pending_Change_Class).filter("input,select,textarea,.chosen-container a");
                        
                        if (otherChanges.length == 0) {
                            changeTabs.removeClass(Input_Pending_Change_Class);
                        }
                    } else {
                        changeTabs.addClass(Input_Pending_Change_Class);
                    }
                }
            }
        }
    }

    if (parentResponsiveTabPane.length) {
        var changeTabs = parentResponsiveTabPane.find(".panel-heading>.panel-title>a");
        
        if (changeTabs.length) {
            if (removeError) {
                var otherChanges = parentResponsiveTabPane.find(changeTabs);

                if (otherChanges.length == 0) {
                    changeTabs.removeClass(changeTabs);
                }
            } else {
                changeTabs.addClass(changeTabs);
            }
        }
    }
}

var mainMenuShowDelay;

function setupMainMenuSidebar() {
    $(window)
        .on("mainmenu:resize", initMainMenuSidebar)
        .on("resize", function () {
            $(this).trigger("mainmenu:resize")
        }).trigger("mainmenu:resize");
}

initMainMenuSidebar = function (e, ui) {
    var mainMenu = $(".page-header.sidebar");

    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    //if menu slide menu is active and viewport >= 2025, make static
    //if menu slide menu is not active and viewport < 2025, make dynamic

    var menuHandle = $(".page-header.sidebar .main-nav-handle");

    //if (w < 1690) {
    if (w < 2025) {
        if (!mainMenu.hasAttr("data-menu-action")) {

            //menuHandle.on("mouseenter", setMainMenuShowDelay);
            //menuHandle.on("mouseleave", clearMainMenuShowDelay);
            menuHandle.on("click", toggleMainMenu);

            //use the timeout if you want the menu to be visible for a little while right when the page loads
            //setTimeout(function () { toggleMainMenu(); }, 1000);

            toggleMainMenu();
        }

        mainMenu.attr("data-menu-action", "slide");
    } else {
        if (mainMenu.hasAttr("data-menu-action")) {
            showMainMenu(mainMenu);

            //menuHandle.off("mouseenter", setMainMenuShowDelay);
            //menuHandle.off("mouseleave", clearMainMenuShowDelay);
            menuHandle.off("click", toggleMainMenu);
        }

        mainMenu.removeAttr("data-menu-action").removeClass("open");
    }

    mainMenu.show();

    mainMenu.find(".dropdown").on("shown.bs.dropdown", function (e, ui) {
        var menu = $(e.currentTarget).find(".dropdown-menu");

        if (menu.length) {
            var winBot = $("body").height();
            var menuBot = menu.offset().top + menu.outerHeight()

            if (menuBot > winBot) {
                menu.addClass("shifted").css("top", String(((menu.outerHeight() - $(this).outerHeight()) * -1)) + "px");

                var testTop = function (e, ui) {
                    var menuTop = menu.offset().top;

                    if (menuTop < 0) { menu.css("top", menu.position().top + Math.abs(menuTop)); }
                }

                testTop();

                menu.one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", testTop);

                menu.one("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", testTop);
            }
        }
    }).on("hidden.bs.dropdown", function (e,ui) {
        var menu = $(e.currentTarget).find(".dropdown-menu");

        if (menu.length) { menu.removeClass("shifted").removeAttr("style"); }
    });
}

setMainMenuShowDelay = function (e, ui) {
    var el = $(".page-header.sidebar");

    var hdnAttr = "data-hidden";

    if (el.hasAttr(hdnAttr) && (el.attr(hdnAttr) || "false") == "true") { 
        mainMenuShowDelay = setTimeout(function () { showMainMenu(el); }, 500);
    }
}

clearMainMenuShowDelay = function (e, ui) {
    if (mainMenuShowDelay != null) {
        clearTimeout(mainMenuShowDelay);
    }
}

toggleMainMenu = function (e, ui) {
    var el = $(".page-header.sidebar");

    var handle = $(this);

    var hdnAttr = "data-hidden";

    if (el.hasAttr(hdnAttr) && (el.attr(hdnAttr) || "false") == "true") {
        showMainMenu(el);
    } else {
        hideMainMenu(el);
    }
}

hideMainMenu = function (el) {
    var el = $(el);
    
    var hdnAttr = "data-hidden";

    if (!el.hasAttr(hdnAttr) || (el.attr(hdnAttr) || "false") == "false") {
        var width = el.outerWidth();

        el.attr("data-orig-width", width)
            .attr("data-hidden", "true")
            .css({ 'left': String((width * -1)) + 'px' })
            .removeClass("open")
            .removeClass("active");
    }
}

showMainMenu = function (el) {
    var el = $(el);

    clearMainMenuShowDelay();

    var hdnAttr = "data-hidden";

    if (el.hasAttr(hdnAttr) && (el.attr(hdnAttr) || "false") == "true") {
        var origWidth = el.attr("data-orig-width");

        var homeLink = el.find(".navbar > a.logo");

        homeLink.on("click", disableHomeLink);

        el.removeAttr("data-orig-width")
            .attr("data-hidden", "false")
            .css({ 'left': '0px' })
            .addClass("active");

        setTimeout(function () { homeLink.off("click", disableHomeLink); }, 500);
        setTimeout(function () { el.addClass("open"); }, 600);
    }
}

disableHomeLink = function(e,ui){ e.preventDefault(); }