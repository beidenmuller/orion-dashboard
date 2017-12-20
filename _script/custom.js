
jQuery(document).on(
    "pageshow", 
    "[data-role='page']", 
    function(e,ui){				
        //.ui-page-active

        jQuery(document).one("dialogcreate", setupDialog);

        function dlgClickOffClose(e,ui){ jQuery(e.target).dialog("close"); }

        function stopPropagation(e,ui){ e.stopPropagation(); }
	
    	function setupDialog(e,ui){
		enableCloseOnFocusOut(e,ui);
		
		//initialize tiles
		var d = jQuery(e.target);
            	var det = d.find(".ui-dialog-contain .device-detail");
		
		if(det.length){
			initDashboard(det);
		}
	}
	    
        function enableCloseOnFocusOut(e,ui){
            var d = jQuery(e.target);
            var c = d.find(".ui-dialog-contain");

            if(c.length){ c.off("click", stopPropagation).on("click", stopPropagation); }

            d.off("click", dlgClickOffClose).on("click", dlgClickOffClose);
        }
		
	refreshWall();
    }
);

var wall = null;

jQuery(document).on(
    "pagecreate", 
    "[data-role='page']", 
    function(e,ui){ 
	var editMode = getUrlParameter("editMode");
		    
	initDashboard($(this));	
	    
    	if(editMode == "true") {
		jQuery(".tile").off("vmouseup vmousedown click");		
	} else {
		var ath = addToHomescreen({ autostart: false });
		ath.clearSession(); 
		ath.show(); 
	}
	    
	wall = new freewall($(this).find(".tiles"));
	refreshWall((editMode == "true"));
    }
);

jQuery(document).on("pageshow","[data-role='page']", function(e,ui){
  refreshWall();
});

function refreshWall(isDraggable){
	if(wall == null){
		wall = new freewall(".tiles");
	} 
		
	wall.fitWidth();

	wall.reset({
		draggable: (isDraggable || false),
		selector: ".tile",
		animate: true,
		gutterX:cellGutter,
		gutterY:cellGutter,
		cellW:cellSize,
		cellH:cellSize,
		fixSize:null,
		onResize: function() {
			wall.fitWidth();
			wall.refresh();
		},
		onBlockDrop: function(e,ui) {
			setTimeout(function(){ updateOrderByDisplay(".tiles .tile"); }, 2);
		}, 
		onComplete: function(){
			
		}
	}).fitWidth();
	
	// for scroll bar appear;
	jQuery(window).trigger("resize");
}

//$(document).ready(function () {
    //bindDynamicTabs();
    
    //initDynamicLinks();
//});

//function initDynamicContent(container) {
    //initDynamicForm(container);

    //bindDynamicTabs(container);

    //initDynamicLinks(container);
//}
