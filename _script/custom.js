
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
	    
    	initDynamicForm(".auth-form form");
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
			setTimeout(function(){ updateOrderByDisplay(".tiles .tile:not(.blank)"); }, 2);
		}, 
		onComplete: function(){
			
		}
	}).fitWidth();
	
	// for scroll bar appear;
	jQuery(window).trigger("resize");
}

function initDynamicForm(frm){
	frm = $(frm);
	
	if(frm.length){ 		
		$(frm).on("submit", function(event,ui){
			event.preventDefault();

			var frmData = $(frm).serialize();

			ajaxSubmitData(
			    frm.method,
			    frm.action,
			    "application/x-www-form-urlencoded",
			    "JSON",
			    frmData,
			    function (data, status, xhr) {
				console.log(data);
				console.log(data.status);
				if(data.status == "ok"){
					console.log("enable edit mode");
				} else {
					console.log("error validating pin");	
				}

				$(frm).trigger("dynamicFormSubmit:success", data);
			    },
			    function (xhr, ajaxOptions, thrownError) {
				if (xhr.statusCode != 200) {
				    alert("error: " + xhr.responseText);

				    $(frm).trigger("dynamicFormSubmit:error");
				}
			    },
			    function () { enableButtonsForProcessing(frm); },
			    function () { disableButtonsForProcessing(frm); }
			);
		});
	}
}

function disableButtonsForProcessing(frm, displayText) {
    var frm = $(frm);
    
    var displayText = displayText || "Processing...";

    frm.find("button[type='submit'],input[type='submit']").each(function (index, item) {
        disableButton($(item), displayText);
    })

    return;
}

function enableButtonsForProcessing(frm) {
    var frm = $(frm);
    
    frm.find("button[type='submit'],input[type='submit']").each(function (index, item) {
        setTimeout(function(){ enableButton($(item)) }, 2);
    });

    return;
}

function disableButton(btn, displayText) {
    var displayText = displayText || "Processing...";

    var btn = $(btn);

    var txtAttrName = "data-orig-text";

    var btnOrigTxt = btn.attr(txtAttrName);

    if (!btn.hasAttr(txtAttrName) || !btnOrigTxt.length) {
        btn.attr("data-orig-text", (btn.val() || btn.text()))
            .prop("disabled", "disabled")
            .text(displayText)
            .val(displayText);
    }

    return;
}

function enableButton(btn) {
    var btn = $(btn);
    
    if (btn.is(":disabled")) {
        btn.removeAttr("disabled");

        var txtAttrName = "data-orig-text";
        
        if (btn.hasAttr(txtAttrName) && btn.attr(txtAttrName).length) {
            var btnOrigTxt = btn.attr(txtAttrName);

            btn.text(btnOrigTxt).val(btnOrigTxt).removeAttr(txtAttrName);
        }
    }

    return;
}
