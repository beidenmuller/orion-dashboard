
jQuery(document).on(
    "pageshow", 
    "[data-role='page']", 
    function(e,ui){				
        //.ui-page-active

        jQuery(document).one("dialogcreate", enableCloseOnFocusOut);

        function dlgClickOffClose(e,ui){ jQuery(e.target).dialog("close"); }

        function stopPropagation(e,ui){ e.stopPropagation(); }

        function enableCloseOnFocusOut(e,ui){
            var d = jQuery(e.target);
            var c = d.find(".ui-dialog-contain");

            if(c.length){ c.off("click", stopPropagation).on("click", stopPropagation); }

            d.off("click", dlgClickOffClose).on("click", dlgClickOffClose);
        }
    }
);

jQuery(document).on(
    "pagecreate", 
    "[data-role='page']", 
    function(e,ui){				
        initDashboard($(this));
    }
);




//$(document).ready(function () {
    //bindDynamicTabs();
    
    //initDynamicLinks();
//});

//function initDynamicContent(container) {
    //initDynamicForm(container);

    //bindDynamicTabs(container);

    //initDynamicLinks(container);
//}
