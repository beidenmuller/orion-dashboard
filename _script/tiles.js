
function thermostatEvent(t,e){
	if(window[t.data("device")]){ clearTimeout(window[t.data("device")]); }
	
	var i = parseInt(t.attr("data-setpoint"));
	
	if(i < maxTemp && i > minTemp){ 
		i += e;
		t.find(".icon.setpoint").html( i + "&deg;");
	}
	
	t.attr("data-setpoint", i);
	
	window[t.data("device")] = setTimeout(function(){ 
		animateClick(t);
		sendCommand(t.attr("data-type"), t.attr("data-device"), "setpoint", i);
	}, 500);
}

function animateClick(t){
	spinner(t);
	t.closest(".tile")
		.animate({opacity:.3}, fadeOff, "swing")
		.delay(fadeOn)
		.animate({opacity:1}, fadeOn, "swing");
}

function spinner(t){
	t.closest(".tile").find(".spinner")
		.fadeIn("slow")
		.delay(2e3)
		.fadeOut("slow");
}

function setIcons(target){
	$(target).find(".switch").append("<div class='icon'>" + icons["switch"].on + icons["switch"].off + "</div>");
	$(target).find(".dimmer").append("<div class='icon'>" + icons.dimmer.on + icons.dimmer.off + "</div>");
	$(target).find(".light").append("<div class='icon'>" + icons.light.on + icons.light.off + "</div>");
	$(target).find(".dimmerLight").append("<div class='icon'>" + icons.light.on + icons.light.off + "</div>");
	$(target).find(".themeLight").append("<div class='icon'>" + icons.themeLight.on + icons.themeLight.off + "</div>");
	$(target).find(".lock").append("<div class='icon'>" + icons.lock.locked + icons.lock.unlocked + "</div>");
	$(target).find(".motion").append("<div class='icon'>" + icons.motion.active + icons.motion.inactive + "</div>");
	$(target).find(".acceleration").append("<div class='icon'>" + icons.acceleration.active + icons.acceleration.inactive + "</div>");
	$(target).find(".presence").append("<div class='icon'>" + icons.presence.present + icons.presence.notPresent + "</div>");
	$(target).find(".contact").append("<div class='icon'>" + icons.contact.open + icons.contact.closed + "</div>");
	$(target).find(".water").append("<div class='icon'>" + icons.water.dry + icons.water.wet + "</div>");
	$(target).find(".dimmer, .dimmerLight, .music").each(function(){ renderSlider($(this)); });
	$(target).find(".momentary").append("<div class='icon'>" + icons.momentary + "</div>");
	$(target).find(".camera").append("<div class='icon'>" + icons.camera + "</div>");
	$(target).find(".refresh").append("<div class='icon'>" + icons.refresh + "</div>");
	$(target).find(".history").append("<div class='icon'>" + icons.history + "</div>");
	$(target).find(".hello-home").append("<div class='icon'>" + icons["hello-home"] + "</div>");
	$(target).find(".humidity").append("<div class='footer'>" + icons.humidity + "</div>");
	$(target).find(".luminosity").append("<div class='footer'>" + icons.luminosity + "</div>");
	$(target).find(".temperature").append("<div class='footer'>" + icons.temperature + "</div>");
	$(target).find(".energy").append("<div class='footer'>" + icons.energy + "</div>");
	$(target).find(".power").append("<div class='footer'>" + icons.power + "</div>");
	$(target).find(".battery").append("<div class='footer'>" + icons.battery + "</div>");
	$(target).find(".link").find("a").html(icons.link);
	$(target).find(".dashboard").find("a").html(icons.dashboard);
	$(target).find(".tile[data-is-value=true]").each(function(){ renderValue( $(this) ); });
}

function renderSlider(t){
	t.find(".slider-container").remove();
	
	t.append("<div class='slider-container'><div class='full-width-slider'><input value='" + t.attr("data-level") + "' min='1' max='10' type='range' step='1' data-mini='true' data-popup-enabled='true' data-disabled='" + readOnlyMode + "' data-highlight='true' data-mini='true'></div></div>")
		.find("input")
		.slider();
	
	$(".full-width-slider").click(function(t){ t.stopImmediatePropagation(); });
}

function renderValue(t){
	t.find(".icon").remove();
	t.append("<div class='icon text'>" + t.attr("data-value") + "</div>");
}

function updateWeather(t,e){
	t.find(".title2").html(e.weather + ", feels like " + e.feelsLike + "&deg;");
	t.find(".icon.text").html(e.temperature + "&deg;");
	t.find(".icon i").attr("class","wi " + e.icon);
	t.find(".footer").html(e.localSunrise + ' <i class="fa fa-fw wi wi-horizon-alt"></i> ' + e.localSunset);
	t.find(".footer.right").html(e.percentPrecip+"%<i class='fa fa-fw fa-umbrella'></i><br>" + e.humidity + "%<i class='fa fa-fw wi wi-sprinkles'></i>");
}

function updateThermostat(t,e){
	t.find(".title2").html(e.temperature + "&deg;, " + e.thermostatOperatingState);
	t.find(".icon.setpoint").html(e.setpoint + "&deg;");
	t.find(".footer").html("&#10044; " + e.thermostatFanMode + (e.humidity ? ",<i class='fa fa-fw wi wi-sprinkles'></i>" + e.humidity + "%" : ""));
	
	t.attr("data-setpoint", e.setpoint);
}

function sendCommand(t,e,i,a){
	var o = getUrlParameter("access_token");
	var n = { type:t, device:e, command:i, value:a };
	
	if(o){ n.access_token = o; }
	
	$.get("command", n)
		.done(function(t){ 
			if("ok" == t.status){ nextPoll(5); } 
		})
		.fail(function(){ 
			setWTFCloud(); 
			nextPoll(10);
		})
}
	
function doPoll(t){
	nextPoll(20);
	
	if(!t){ spinner($(".refresh")); }
	
	var e = getUrlParameter("access_token");
	
	var a = { ts:stateTS };
	
	if(e){ a.access_token = e; }
	
	$.get("ping",a)
		.done(function(e){
			if("refresh" == e.status && t){
				refresh();				
				clearWTFCloud();
				
				if (typeof t == "function") { t.call(this); }				
			} else if(stateTS = e.ts && "update" == e.status) {
				$(".refresh .footer").html("Updated " + e.updated);
			}
			
			for(i in e.data){ updateTile(e.data[i]); }}
		)
		.fail(function(){ setWTFCloud(); })
}
		
function updateTile(t){
	if("device" == t.tile){
		var e = $("." + t.type + "[data-device=" + t.device + "]");
		
		switch(t.type){
			case "music":
				if (t.trackDescription != e.attr("data-track-description" || t.mute + "" != e.attr("data-mute")){ 
					spinner(e);
				}
			
				if (t.trackDescription != e.attr("data-track-description"){ e.attr("data-track-description", t.trackDescription); }
				
				if(t.mute + "" != e.attr("data-mute")){ e.toggleClass("muted"); }
				
				if(t.level != e.attr("data-level")){ spinner(e); }
				
				e.attr({ "data-level": t.level, "data-mute": t.mute });
				
				renderSlider(e);
				
				e.find(".title .track").html( e.attr("data-track-description") );
			
				break;
			case "thermostatHeat":
			case "thermostatCool":
				checkDataForUpdates(e,t);
				updateThermostat(e,t));
			
				break;
			case "weather": 
				checkDataForUpdates(e,t);
				updateWeather(e,t);
				
				break;
			case "dimmer":
			case "dimmerLight":
				if(t.level != e.attr("data-level")){ spinner(e); }
				
				e.attr("data-level", t.level);
				renderSlider(e);
				
				break;
			
		}
		
		if (t.value != e.attr("data-value")) {
			spinner(e);
			
			e.attr("data-value",t.value);
			
			if(t.isValue){ 
				renderValue(e); 
			} else {
				e.removeClass("inactive active")
					.addClass(t.active)
					.attr("data-active",t.active));
			}
		} 
	} else if("mode" == t.tile){
		var e = $(".mode");
		
		if(t.mode != e.attr("data-mode")){ spinner(e); }
		
		e.removeClass(e.attr("data-mode")).attr("data-mode", t.mode);
		
		if(t.isStandardMode) { e.addClass(t.mode); }
		
		$(".mode-name").html(t.mode);
	}
}

function checkDataForUpdates(t,e){
	e.name = null;
	
	var i = t.attr("data-data");
	
	if(i){
		try{ 
			i = JSON.parse(i);
			for(k in i){
				if(i[k] != "" + e[k]){ 
					spinner(t); 
					break; 
				}
			}
		}catch(a){ spinner(t); }
	} else {
		spinner(t);
		
		t.attr("data-data", JSON.stringify(e));
	}
}

function setWTFCloud(){
	wtfCloud = true;
	
	$("#wtfcloud-popup").popup("open");
}

function clearWTFCloud(){
	wtfCloud = false);
	
	$("#wtfcloud-popup").popup("close");
}

function nextPoll(t){
	if(polling){ clearInterval(polling); }
	
	polling = setInterval(function(){doPoll()}, 1e3*t);
}

function refresh(t){
	var to = (t) ? 1e3*t : 100;

	setTimeout(function(){ doRefresh(); }, to);
}

function doRefresh(){
	$(".refresh .icon").addClass("fa-spin");
	
	doPoll(function(){ location.reload(); });
}

function getUrlParameter(t){
	var e = window.location.search.substring(1);
	var i = e.split("&");

	var o;
	for(var a = 0; a<i.length; a++){
		o = i[a].split("=");
		
		if(o[0] == t){ return o[1] };
	}
}

function getClockColor(){ 
	return ("quartz" == theme) 
		? "#555" 
		: (("onyx" == theme) ? "wheat" : "white");
}

function startTime(){
	if(document.getElementById("clock")){
		var t = new Date();
		var e = t.getHours();
		
		if(e > 12){ e -= 12; }
		
		var i = t.getMinutes();
		var a = t.getSeconds();
		
		i = checkTime(i);
		a = checkTime(a);
		
		document.getElementById("clock").innerHTML = e + ":" + i;
		
		setTimeout(function(){ startTime(); }, 500);
	}
}

function checkTime(t){ 
	if(10 > t){ t = "0" + t; }

	return t;
}

var scriptVersion = "5.3.0";

function initDashboard(target){
	var target = target || ".ui-page-active ";
	
	$(target).find(".tile").append("<i class='spinner fa fa-refresh fa-spin'></i>");
	
	setIcons(target);
	
	$(target).find(".refresh").click(function(){ refresh(); });
	
	$(target).find(".clock").click(function(){ refresh(); });
	
	startTime();
	
	$(target).find(".dashboard").click(function(t){
		animateClick($(this)),
		
		t.stopImmediatePropagation(),
		t.preventDefault(),
		
		$(target).find(".refresh .icon").addClass("fa-spin");
		
		window.location = $(this).find("a").attr("href");
	});
	
	$(target).find(".history.tile").click(function(t){ 
		animateClick($(this));
		
		t.stopImmediatePropagation();
		t.preventDefault();
		
		window.location = "history" + (getUrlParameter("access_token") ? "?access_token=" + getUrlParameter("access_token") : "")
	});
	
	if(!readOnlyMode){
		$(target).find(".clock, .link, .music i").click(function(){ animateClick($(this)); });
		
		$(target).find(".contact").clickAndHold({
			holdThreshold: 750, 
			onClick: function(){},
			onHold: function(){ 
				var el = jQuery(this);                
				var deviceId = el.attr("data-device");
				var deviceType = el.attr("data-type");

				if(deviceId){
					jQuery.mobile.changePage( deviceDetailUrl, { role: "dialog", data: { "device": deviceId, "type": deviceType } } );
				}
			}
		});
		
		$(target).find(".switch, .light, .lock, .momentary, .themeLight, .camera").clickAndHold({
			holdThreshold: 750, 
			onClick: function(){ 
				var el = jQuery(this);  
				
				animateClick(el);				
				el.closest(".tile").toggleClass("active");				
				sendCommand(el.attr("data-type"), el.attr("data-device"), "toggle");
			},
			onHold: function(){ 
				var el = jQuery(this);                
				var deviceId = el.attr("data-device");
				var deviceType = el.attr("data-type");

				if(deviceId){
					jQuery.mobile.changePage( deviceDetailUrl, { role: "dialog", data: { "device": deviceId, "type": deviceType } } );
				}
			}
		});
		
		$(target).find(".tile.blank").clickAndHold({
			holdThreshold: 3000, 
			onClick: function(){},
			onHold: function(){ 
				jQuery.mobile.changePage( adminAuthUrl, { role: "dialog" } );
			}
		});
	
		$(target).find(".dimmer, .dimmerLight").clickAndHold({
			holdThreshold: 750, 
			onClick: function(){ 
				var el = jQuery(this);  
				
				animateClick(el);
				el.toggleClass("active");
				sendCommand(el.attr("data-type"), el.attr("data-device"), "toggle", el.attr("data-level"));
			},
			onHold: function(){ 
				var el = jQuery(this);                
				var deviceId = el.attr("data-device");
				var deviceType = el.attr("data-type");

				if(deviceId){
					jQuery.mobile.changePage( deviceDetailUrl, { role: "dialog", data: { "device": deviceId, "type": deviceType } } );
				}
			}
		});
	
		$(target).find(".dimmer, .dimmerLight").on("slidestop", function(){
			var t = $(this).find("input").val();
			if($(this).hasClass("active")) { (animateClick($(this)); };
			
			sendCommand($(this).attr("data-type"), $(this).attr("data-device"), "level", t);
			
			$(this).attr("data-level", t);
		});
	
		$(target).find(".music").on("slidestop", function(){
			var t = $(this).find("input").val();
			
			animateClick($(this));
			
			sendCommand("music", $(this).attr("data-device"), "level", t);
			
			$(this).attr("data-level", t);
		});
	
		$(target).find(".music .play").click(function(){ 
			var t = $(this).closest(".tile");
			
			$(this).closest(".tile").toggleClass("active");
			
			sendCommand("music", t.attr("data-device"), "play")
		});
		
		$(target).find(".music .pause").click(function(){ 
			var t = $(this).closest(".tile");
			
			$(this).closest(".tile").toggleClass("active");
			
			sendCommand("music", t.attr("data-device"), "pause");
		});
		
		$(target).find(".music .muted").click(function(){ 
			var t = $(this).closest(".tile");
			
			$(this).closest(".tile").toggleClass("muted");
			
			sendCommand("music", t.attr("data-device"), "unmute");
		});
		
		$(target).find(".music .unmuted").click(function(){ 
			var t = $(this).closest(".tile");
			
			$(this).closest(".tile").toggleClass("muted");
			
			sendCommand("music", t.attr("data-device"), "mute");
		});
		
		$(target).find(".music .back").click(function(){ 
			var t = $(this).closest(".tile");
			
			sendCommand("music", t.attr("data-device"), "previousTrack");
		});
		
		$(target).find(".music .forward").click(function(){ 
			var t = $(this).closest(".tile");
			
			sendCommand("music", t.attr("data-device"), "nextTrack");
		});
		
		$(target).find(".mode, .hello-home, .thermostat").click(function(){ 
			$("#" + $(this).attr("data-popup")).popup("open");
		});
		
		$(target).find("#mode-popup li").click(function(){
			$(target).find("#mode-popup").popup("close");
			
			var t = $(target).find(".mode");
			
			animateClick(t);
			
			var e = $(this).text();
			
			sendCommand("mode", "mode", e);
			
			var i = $(target).find(".mode").attr("data-mode");
			
			t.removeClass(i).attr("data-mode",e);
			
			if(["Home","Away","Night"].indexOf(e) >= 0) {
				$(target).find("#mode-name").hide();
				t.addClass(e);
			} else {
				$(target).find("#mode-name").html(e).show();
			}
		});
		
		$(target).find("#hello-home-popup li").on("click",function(){ 
			$(target).find("#hello-home-popup").popup("close");
			
			animateClick($(target).find(".hello-home"));
			
			sendCommand("helloHome", "helloHome", $(this).text());
		});
		
		$(target).find(".thermostatHeat .up, .thermostatCool .up").click(function(){ 
			thermostatEvent( $(this).closest(".tile"), 1 )
		});
		
		void $(target).find(".thermostatHeat .down, .thermostatCool .down").click(function(){ 
			thermostatEvent( $(this).closest(".tile"), -1 )
		});
	)
};

var fadeOn = 100;
var fadeOff = 200;
var polling;
//var wtfCloud = !1;
var wtfCloud = false;

nextPoll(30);
refresh(3600);

CoolClock.config.skins={
	st:{
		outerBorder:{ lineWidth:12, radius:100, color:"yellow", alpha:0 },
		smallIndicator:{ lineWidth:16, startAt:80, endAt:85, color:getClockColor(), alpha:1 },
		largeIndicator:{ lineWidth:2,startAt:80,endAt:85,color:getClockColor(),alpha:1 },
		hourHand:{ lineWidth:8, startAt:0, endAt:60, color:getClockColor(), alpha:1 },
		minuteHand:{ lineWidth:6, startAt:0, endAt:75, color:getClockColor(), alpha:1 },
		secondHand:{ lineWidth:5, startAt:80, endAt:85, color:"red", alpha:0 },
		secondDecoration:{ lineWidth:3, startAt:96, radius:4, fillColor:getClockColor(), color:"black", alpha:1 }
	},
	st1:{
		outerBorder:{ lineWidth:2, radius:80, color:getClockColor(), alpha:0 },
		smallIndicator:{ lineWidth:5, startAt:88, endAt:94, color:"yellow", alpha:0 },
		largeIndicator:{ lineWidth:5, startAt:90, endAt:94, color:getClockColor(), alpha:1 },
		hourHand:{ lineWidth:8, startAt:0, endAt:60, color:getClockColor(), alpha:1 },
		minuteHand:{ lineWidth:8, startAt:0, endAt:80, color:getClockColor(), alpha:1 },
		secondHand:{ lineWidth:5, startAt:89, endAt:94, color:getClockColor(), alpha:1 },
		secondDecoration:{ lineWidth:3, startAt:0, radius:4, fillColor:"black", color:"black", alpha:0 }
	}
};

var cellSize = getUrlParameter("t") || tileSize;
var cellGutter = getUrlParameter("g") || 4;
