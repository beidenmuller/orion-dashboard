var loadContentFromHtml = function (el, result) {
    $(el).fadeOut(function (e) {
        var el = $(this);

        el.clearDOMElement().html(result).fadeIn(function (e) {
            hideLoadingModal();

            initDynamicContent(el);
        });
    });
}

function loadContentFromUrl(el, url, srcElement, beforeLoad, afterLoad) {
    var el = $(el);

    el.clearDOMElement().addClass("loading-progress").children().css("visibility", "hidden");

    ajaxSubmitData(
        "GET",
        url,
        "application/json",
        "html",
        {},
        function (data, status, xhr) {
            el.html(data).css("opacity", 0).removeClass("loading-progress").animate({ opacity: 1 }, function (e) {
                initDynamicContent(el);
                //window.location.hash = url;

                if (typeof afterLoad === 'function') { afterLoad.call(this); }
            });
        },
        function (xhr, ajaxOptions, thrownError) { }, //error
        function () { }, //complete
        function () { if (typeof beforeLoad === 'function') { beforeLoad.call(this); } } //before send
    );
}

var displayLoadingContent = function (el) {
    dialog = $("<div/>");

    dialog.addClass("loading-progress ajax-link-progress");

    $(el).append(dialog);
}

var hideLoadingPage = function (el) {
    //find and destroy the loading dialog
    $(el).find(".ajax-link-progress").destroyDOMElement();
}

var loadModalPageFromElement = function (el, target, modalSize, container, enableDynamicContent) {
    el = $(el);

    if (container) {
        container = $(container);
    } else {
        container = el.parent();
    }

    container = (container.length) ? container : $("body");

    //el.dialog({
    //    autoOpen: true,
    //    modal: true,
    //    appendTo: container,
    //    position: { my: 'top', at: 'top+1%' },
    //    show: { effect: "fadeIn", duration: 500 },
    //    hide: { effect: "fadeOut", duration: 500 },
    //    close: function (event, ui) {
    //        el.dialog("destroy");
    //        execOnTargetElement(target);
    //        //modalDialog.html('');
    //        //modalDialog.destroyDOMElement(); //destroying element causes error when trying to add centering
    //    },
    //    open: function () { enableModalCentering(el); }
    //});

    modalSize = (modalSize && modalSize != null) ? "modal-" + modalSize : null;

    modalDialog = buildBsModal(container, null, "", true, false, modalSize);

    setBsModalContent(modalDialog, el.html());
    
    modalDialog.data('bs.modal').options.backdrop = "static";

    modalDialog.on("hidden.bs.modal", function () {
        execOnTargetElement(target);
        modalDialog.html('');
        modalDialog.destroyDOMElement();
    });

    modalDialog.modal("show");

    hideLoadingModal();

    enableDynamicContent = (enableDynamicContent == null || enableDynamicContent == undefined);

    if (enableDynamicContent) {
        initDynamicContent(modalDialog);
    } 

    $(window).trigger("resize");
}

var loadModalPageFromHtml = function (result, target, modalSize) {
    modalSize = (modalSize && modalSize != null) ? "modal-" + modalSize : null;

    modalDialog = buildBsModal("body", null, "", true, false, modalSize);

    setBsModalContent(modalDialog, result);
    
    modalDialog.data('bs.modal').options.backdrop = "static";

    modalDialog.on("hidden.bs.modal", function () {
        execOnTargetElement(target);
        modalDialog.html('');
        modalDialog.destroyDOMElement();
    });

    modalDialog.modal("show");


    //modalDialog = $("<div/>");

    //modalDialog.dialog({
    //    autoOpen: true,
    //    modal: true,
    //    appendTo: $("body"),
    //    position: { my: 'top', at: 'top+1%' },
    //    show: { effect: "fadeIn", duration: 500 },
    //    hide: { effect: "fadeOut", duration: 500 },
    //    close: function (event, ui) {
    //        execOnTargetElement(target);
    //        modalDialog.html('');
    //        //modalDialog.destroyDOMElement(); //destroying element causes error when trying to add centering
    //    },
    //    open: function () { enableModalCentering(modalDialog); }
    //}).html(result);

    hideLoadingModal();

    initDynamicContent(modalDialog);

    $(window).trigger("resize");

    return modalDialog;
}

var loadPageFromHtml = function (result) {
    $(".page-content").fadeOut(function (e) {
        var el = $(this);

        el.clearDOMElement().html(result).fadeIn(function (e) {
            hideLoadingModal();

            initDynamicContent(".page-content");
        });
    });
}

function loadPageFromUrl(url, srcElement, suppressTitle, appendBackNav, skipInitDynamicContent) {
    var el;

    if ($(srcElement).closest(".ui-dialog-content").length) {
        el = $(".ui-dialog-content");
    } else if ($(srcElement).closest(".modal-body").length) {
        el = $(".modal-body");
    } else {
        el = $(".page-content");
    }

    if (appendBackNav == true) {
        var curLoc = window.location.href;

        var backLink = $("<a/>");

        backLink
            .attr({
                "href": curLoc,
                "title": "Return to previous page"
            })
            .html("< Return to previous page")
            .click(function (e, ui) {
                e.preventDefault();

                var lnkEl = $(this);

                loadPageFromUrl(curLoc, lnkEl, true, false, false);
            });
    }

    el.clearDOMElement().addClass("loading-progress").children().css("visibility", "hidden");

    ajaxSubmitData(
        "GET",
        url,
        "application/json",
        "html",
        {},
        function (data, status, xhr) {
            el.html(data).css("opacity", 0);
            
            if (appendBackNav == true) { el.prepend(backLink); }

            if (suppressTitle == true) {
                var pageHeader = el.find(".page-content-header");
                pageHeader.hide().remove();
            }

            el.removeClass("loading-progress").animate({ opacity: 1 }, function (e) {
                if (skipInitDynamicContent !== true) { initDynamicContent(el); el.find("form").off("submit", dynamicFormSubmitHandler); }
                //window.location.hash = url;
            });
        },
        function (xhr, ajaxOptions, thrownError) { }, //error
        function () { }, //complete
        function () { } //before send
    );

    //el.load(url, function (response, status, xhr) {
    //    /* TODO: add check of response status */
    //    el.css("opacity", 0).removeClass("loading-progress").animate({opacity: 1}, function (e) {
    //        initDynamicContent(el);

    //        //window.location.hash = url;
    //    });
    //});
}

var displayLoadingPage = function () {
    dialog = $("<div/>");

    dialog.addClass("loading-progress ajax-link-progress");

    $(".page-content").append(dialog);
}

var hideLoadingPage = function () {
    //find and destroy the loading dialog
    $(".page-content").find(".ajax-link-progress").destroyDOMElement();
}

function loadModalPageFromUrl(url, target, srcElement, modalSize) {
    modalSize = (modalSize && modalSize != null) ? "modal-" + modalSize : null;

    modalDialog = buildBsModal("body", null, "", true, false, modalSize);

    var modalBody = modalDialog.find(".modal-body");

    modalBody.addClass("loading-progress");

    modalDialog.data("bs.modal").options.backdrop = "static";

    modalDialog.on("hidden.bs.modal", function () {
        execOnTargetElement(target);
        modalDialog.html('');
        modalDialog.destroyDOMElement();

        modalDialog = null;
    });

    ajaxSubmitData(
        "GET",
        url,
        "application/json",
        "html",
        {},
        function (data, status, xhr) {
            //$(modalDialog).html(data);

            setBsModalContent(modalDialog, data);
            
            /* TODO: add check of response status */
            modalBody.removeClass("loading-progress");
            initDynamicContent(modalDialog);
            $(window).trigger("resize");
        },
        function (xhr, ajaxOptions, thrownError) { }, //error
        function () { }, //complete
        function () { } //before send
    );

    return modalDialog;
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
    loadModalPageFromElement: function (el, target, container, enableDynamicContent, autoOpen, modalSize) {
        el = $(el);

        container = (container) ? $(container) : el.parent();

        container = (container.length) ? container : $("body");
        
        modalDialog = el.dialog({
            autoOpen: autoOpen || true,
            modal: true,
            width: getModalWidthFromArg(modalSize),
            appendTo: container,
            position: { my: 'top', at: 'top+1%' },
            show: { effect: "fadeIn", duration: 500 },
            hide: { effect: "drop", direction: "up", duration: 500 },
            close: function (event, ui) {
                el.dialog("destroy");
                execOnTargetElement(target);
                //modalDialog.html('');
                //modalDialog.destroyDOMElement(); //destroying element causes error when trying to add centering
            },
            open: function () { enableModalCentering(el); }
        });
        
        hideLoadingModal();

        enableDynamicContent = (enableDynamicContent == null || enableDynamicContent == undefined);

        if (enableDynamicContent) {
            initDynamicContent(modalDialog);
        } 

        $(window).trigger("resize");

        return el;
    }
});

jQuery.extend({
    loadModalPageFromUrl: function (url, target, container, enableDynamicContent, autoOpen, modalSize) {
        var el = $("<div/>");

        container = (container) ? $(container) : el.parent();

        container = (container.length) ? container : $("body");
        
        modalSize = modalSize || "md";

        ajaxSubmitData(
            "GET",
            url,
            "application/json",
            "html",
            {},
            function (data, status, xhr) {
                //$(modalDialog).html(data);

                el.html(data);

                modalDialog = el.dialog({
                    autoOpen: autoOpen || true,
                    modal: true,
                    width: getModalWidthFromArg(modalSize),
                    appendTo: container,
                    position: { my: 'top', at: 'top+1%' },
                    show: { effect: "fadeIn", duration: 500 },
                    hide: { effect: "drop", direction: "up", duration: 500 },
                    close: function (event, ui) {
                        el.dialog("destroy");
                        execOnTargetElement(target);
                        //modalDialog.html('');
                        //modalDialog.destroyDOMElement(); //destroying element causes error when trying to add centering
                    },
                    open: function () { enableModalCentering(el); }
                });
                
                hideLoadingModal();

                enableDynamicContent = (enableDynamicContent == null || enableDynamicContent == undefined);

                if (enableDynamicContent) {
                    initDynamicContent(modalDialog);
                }

                $(window).trigger("resize");
            },
            function (xhr, ajaxOptions, thrownError) { }, //error
            function () { }, //complete
            function () { } //before send
        );

        return el;
    }
});

jQuery.extend({
    loadModalPageFromHtml: function (html, target, container, enableDynamicContent, autoOpen) {
        var el = $("<div/>");

        el.html(html);

        container = (container) ? $(container) : el.parent();

        container = (container.length) ? container : $("body");

        modalDialog = el.dialog({
            autoOpen: autoOpen || true,
            modal: true,
            appendTo: container,
            position: { my: 'top', at: 'top+1%' },
            show: { effect: "fadeIn", duration: 500 },
            hide: { effect: "drop", direction: "up", duration: 500 },
            close: function (event, ui) {
                el.dialog("destroy");
                execOnTargetElement(target);
                //modalDialog.html('');
                //modalDialog.destroyDOMElement(); //destroying element causes error when trying to add centering
            },
            open: function () { enableModalCentering(el); }
        });
        
        hideLoadingModal();

        enableDynamicContent = (enableDynamicContent == null || enableDynamicContent == undefined);

        if (enableDynamicContent) {
            initDynamicContent(modalDialog);
        }

        $(window).trigger("resize");

        return el;
    }
});

function getModalWidthFromArg(size) {
    var width = "900px";

    size = size || "md";

    switch (size.toLowerCase()){
        case "lg":
            width = "1100px";
            break;
        case "md":
            width = "900px";
            break;
        case "sm":
            width = "300px";
            break;
        default:
            width = "300px";
            break;
    }

    return width;
}

function enableModalCentering(modal) {
    var modalPos = { my: "center center", at: "center center", of: window, collision: "fit" };

    $(window).resize(function () {
        if (modal.hasClass("ui-dialog-content")) {
            modal.dialog("option", { "position": modalPos });
        }
    });

}

var displayLoadingModal = function (srcEl) {
    var relatedGrid = (srcEl) ? $(srcEl).data("target-grid") : "";

    modalDialog = $("<div/>");

    modalDialog.data("related-grid", relatedGrid).dialog({
        autoOpen: true,
        modal: true,
        appendTo: $("body"),
        position: { my: 'top', at: 'top+1%' },
        show: { effect: "fadeIn", duration: 500 },
        hide: { effect: "fadeOut", duration: 500 },
        close: function (event, ui) { modalDialog.html(''); /*modalDialog.destroyDOMElement();*/ }, //destroying element causes error when trying to add centering
        open: function () { enableModalCentering(modalDialog); }
    }).addClass("loading-progress ajax-link-progress");

    $(window).trigger("resize");
}

var hideLoadingModal = function () {
    //find and destroy the loading dialog
    $("body").find(".ajax-link-progress").destroyDOMElement();
}

var confirmDelete = function (result) {
    alert(JSON.stringify(result));
    return false;

    /*return loadModalConfirm(
        'Delete?',
        'Are you sure you want to delete this?',
        function () { return true; },
        function () { return false; }
    );*/
}

var loadModalTabFromHtml = function (result) {
    modalTabContent = $("<div/>");
    modalTabContent.addClass("tab-pane fade"); //bootstrap classes
    modalTabContent.html(result);
    modalTabContent.appendTo($("body"));

    //TODO: figure out if it is best to initilize dynamic content here or in the tab change event
    initDynamicContent();
}

function bindDynamicTabs(container) {
    container = (container) ? $(container) : $('body');
    
    var win = $(window);

    var respWidth = 768;

    var navTabs = container.find(".nav.nav-tabs");

    var dynaTab = container.find(".nav.nav-tabs .dynamic-tab");

    //setup responsive tabs
    var removeOpenClass = function (event, ui) {
        $(event.currentTarget).find("ul").removeClass("open");
    }

    var toggleOpenClass = function (event, ui) {
        event.preventDefault();
        event.stopPropagation();

        $(this).closest(".nav.nav-tabs").toggleClass("open");
    }

    container.off("click", removeOpenClass).on("click", removeOpenClass);
    container.off("click", ".nav.nav-tabs li.active a", toggleOpenClass).on("click", ".nav.nav-tabs li.active a", toggleOpenClass);

    dynaTab.unbind("shown.bs.tab");
    dynaTab.unbind("show.bs.tab");

    dynaTab.on("show.bs.tab", function (e) {
        var currTab = $(e.target);
        var tarContainer = currTab.attr("href");

        if (win.width() > respWidth || !currTab.closest("li").hasClass("active")) {
            $(tarContainer).html("").addClass("loading-progress");

            $(this).trigger("dynamicTab:loadContent");
        }
    });

    dynaTab.on("shown.bs.tab", function (e) {
        //var currTab = $(e.target);
        //console.log(currTab);
        //if (win.width() > respWidth || !currTab.closest("li").hasClass("active")) {
        //$(this).trigger("dynamicTab:loadContent");
        //}
    }).on("dynamicTab:loadContent", function (e) {
        var currTab = $(e.target);
        var url = currTab.data("ajax-url");
        
        //var tarContainer = currTab.attr("href");

        var tarContainer = (currTab.hasAttr("data-target")) ? currTab.attr("data-target") : currTab.attr("href");

        var tabContainer = currTab.closest(".nav-tabs").siblings(".tab-content");

        modalTabContent = tabContainer.find(tarContainer);
        
        ajaxSubmitData(
            "GET",
            url,
            "text/plain",
            "HTML",
            {},
            function (data) {
                modalTabContent.html(data);

                if ($(e.currentTarget).attr("data-enable-dynamic-content") != "false") {
                    initDynamicContent(modalTabContent);
                } else {
                    setupFormInputMasking(modalTabContent);
                }

                modalTabContent.find(".page-content-header").hide();
            },
            function (response, status, xhr) { modalTabContent.html("<h4>An error occurred while loading the content</h4>"); },
            function () { modalTabContent.removeClass("loading-progress"); },
            function () {
                modalTabContent.clearDOMElement();
                modalTabContent.addClass("loading-progress");
            },
            true);
    });
}

function initDynamicLinks(container) {
    container = (container) ? $(container) : $('body');

    var modalLinksSel = "[data-modal-link='true']";
    
    container.find(modalLinksSel)
        .off("click", modalLinkClick)
        .on("click", modalLinkClick);

    function modalLinkClick(event, ui) {
        event.preventDefault();
        
        var el = $(this);

        var tar = el.data("target-element");

        var size = el.data("modal-size");

        loadModalPageFromUrl(el.attr("href"), tar, el, size);
    };
}