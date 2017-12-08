/*Tiles*/

function thermostatEvent(t,e){
	window[t.data("device")]&&clearTimeout(window[t.data("device")]);
	var i=parseInt(t.attr("data-setpoint"));
	i<maxTemp&&i>minTemp&&(i+=e,t.find(".icon.setpoint").html(i+"&deg;")),
	t.attr("data-setpoint",i),
	window[t.data("device")]=setTimeout(function(){animateClick(t),sendCommand(t.attr("data-type"),t.attr("data-device"),"setpoint",i)},500)
}

function animateClick(t){spinner(t),t.closest(".tile").animate({opacity:.3},fadeOff,"swing").delay(fadeOn).animate({opacity:1},fadeOn,"swing")}

function spinner(t){t.closest(".tile").find(".spinner").fadeIn("slow").delay(2e3).fadeOut("slow")}

function setIcons(){
	$(".switch").append("<div class='icon'>"+icons["switch"].on+icons["switch"].off+"</div>"),
	$(".dimmer").append("<div class='icon'>"+icons.dimmer.on+icons.dimmer.off+"</div>"),
	$(".light").append("<div class='icon'>"+icons.light.on+icons.light.off+"</div>"),
	$(".dimmerLight").append("<div class='icon'>"+icons.light.on+icons.light.off+"</div>"),
	$(".themeLight").append("<div class='icon'>"+icons.themeLight.on+icons.themeLight.off+"</div>"),
	$(".lock").append("<div class='icon'>"+icons.lock.locked+icons.lock.unlocked+"</div>"),
	$(".motion").append("<div class='icon'>"+icons.motion.active+icons.motion.inactive+"</div>"),
	$(".acceleration").append("<div class='icon'>"+icons.acceleration.active+icons.acceleration.inactive+"</div>"),
	$(".presence").append("<div class='icon'>"+icons.presence.present+icons.presence.notPresent+"</div>"),
	$(".contact").append("<div class='icon'>"+icons.contact.open+icons.contact.closed+"</div>"),
	$(".water").append("<div class='icon'>"+icons.water.dry+icons.water.wet+"</div>"),
	$(".dimmer, .dimmerLight, .music").each(function(){renderSlider($(this))}),
	$(".momentary").append("<div class='icon'>"+icons.momentary+"</div>"),
	$(".camera").append("<div class='icon'>"+icons.camera+"</div>"),
	$(".refresh").append("<div class='icon'>"+icons.refresh+"</div>"),
	$(".history").append("<div class='icon'>"+icons.history+"</div>"),
	$(".hello-home").append("<div class='icon'>"+icons["hello-home"]+"</div>"),
	$(".humidity").append("<div class='footer'>"+icons.humidity+"</div>"),
	$(".luminosity").append("<div class='footer'>"+icons.luminosity+"</div>"),
	$(".temperature").append("<div class='footer'>"+icons.temperature+"</div>"),
	$(".energy").append("<div class='footer'>"+icons.energy+"</div>"),
	$(".power").append("<div class='footer'>"+icons.power+"</div>"),
	$(".battery").append("<div class='footer'>"+icons.battery+"</div>"),
	$(".link").find("a").html(icons.link),
	$(".dashboard").find("a").html(icons.dashboard),
	$(".tile[data-is-value=true]").each(function(){renderValue($(this))}
)}

function renderSlider(t){
	t.find(".slider-container").remove(),
	t.append("<div class='slider-container'><div class='full-width-slider'><input value='"+t.attr("data-level")+"' min='1' max='10' type='range' step='1' data-mini='true' data-popup-enabled='true' data-disabled='"+readOnlyMode+"' data-highlight='true'></div></div>").find("input").slider(),
	$(".full-width-slider").click(function(t){t.stopImmediatePropagation()})
}

function renderValue(t){t.find(".icon").remove(),t.append("<div class='icon text'>"+t.attr("data-value")+"</div>")}

function updateWeather(t,e){
	t.find(".title2").html(e.weather+", feels like "+e.feelsLike+"&deg;"),
	t.find(".icon.text").html(e.temperature+"&deg;"),
	t.find(".icon i").attr("class","wi "+e.icon),
	t.find(".footer").html(e.localSunrise+' <i class="fa fa-fw wi wi-horizon-alt"></i> '+e.localSunset),
	t.find(".footer.right").html(e.percentPrecip+"%<i class='fa fa-fw fa-umbrella'></i><br>"+e.humidity+"%<i class='fa fa-fw wi wi-sprinkles'></i>")
}

function updateThermostat(t,e){
	t.find(".title2").html(e.temperature+"&deg;, "+e.thermostatOperatingState),
	t.find(".icon.setpoint").html(e.setpoint+"&deg;"),
	t.find(".footer").html("&#10044; "+e.thermostatFanMode+(e.humidity?",<i class='fa fa-fw wi wi-sprinkles'></i>"+e.humidity+"%":"")),
	t.attr("data-setpoint",e.setpoint)
}

function sendCommand(t,e,i,a){
	var o=getUrlParameter("access_token"),
	n={type:t,device:e,command:i,value:a};
	o&&(n.access_token=o),
	$.get("command",n).done(function(t){"ok"==t.status&&nextPoll(5)}).fail(function(){setWTFCloud(),nextPoll(10)})}
	
	function doPoll(t){
		nextPoll(20),
		t||spinner($(".refresh"));
		var e=getUrlParameter("access_token"),
		a={ts:stateTS};e&&(a.access_token=e),
		$.get("ping",a).done(function(e){if("refresh"==e.status&&refresh(),clearWTFCloud(),t)t();else if(stateTS=e.ts,$(".refresh .footer").html("Updated "+e.updated),"update"==e.status)for(i in e.data)updateTile(e.data[i])}).fail(function(){setWTFCloud()})
	}
		
		function updateTile(t){
			if("device"==t.tile){
				var e=$("."+t.type+"[data-device="+t.device+"]");
				"music"==t.type&&((t.trackDescription!=e.attr("data-track-description")||t.mute+""!=e.attr("data-mute"))&&spinner(e),e.attr("data-track-description",t.trackDescription),t.mute+""!=e.attr("data-mute")&&e.toggleClass("muted"),e.attr("data-mute",t.mute),e.find(".title .track").html(e.attr("data-track-description"))),
				"thermostatHeat"==t.type||"thermostatCool"==t.type?(checkDataForUpdates(e,t),updateThermostat(e,t)):"weather"==t.type?(checkDataForUpdates(e,t),updateWeather(e,t)):(t.value!=e.attr("data-value")&&spinner(e),e.attr("data-value",t.value),t.isValue?renderValue(e):(e.removeClass("inactive active").addClass(t.active),e.attr("data-active",t.active)),("dimmer"==t.type||"dimmerLight"==t.type||"music"==t.type)&&(t.level!=e.attr("data-level")&&spinner(e),e.attr("data-level",t.level),renderSlider(e)))
			}else if("mode"==t.tile){
				var e=$(".mode");
				t.mode!=e.attr("data-mode")&&spinner(e),
				e.removeClass(e.attr("data-mode")),
				e.attr("data-mode",t.mode),
				t.isStandardMode&&e.addClass(t.mode),
				$(".mode-name").html(t.mode)
			}
		}

function checkDataForUpdates(t,e){
	e.name=null;
	var i=t.attr("data-data");
	if(i)try{
			i=JSON.parse(i);for(k in i)if(i[k]!=""+e[k]){spinner(t);break}
		}catch(a){
			spinner(t)
		}
	else 
		spinner(t);
		
		t.attr("data-data",JSON.stringify(e))
}

function setWTFCloud(){
	wtfCloud=!0,
	$("#wtfcloud-popup").popup("open")
}

function clearWTFCloud(){
	wtfCloud=!1,$("#wtfcloud-popup").popup("close")
}

function nextPoll(t){
	polling&&clearInterval(polling),
	polling=setInterval(function(){doPoll()},1e3*t)
}

function refresh(t){
	t?setTimeout(function(){doRefresh()},1e3*t):setTimeout(function(){doRefresh()},100)
}

function doRefresh(){
	$(".refresh .icon").addClass("fa-spin"),
	doPoll(function(){location.reload()})
}

function getUrlParameter(t){
	for(var e=window.location.search.substring(1),i=e.split("&"),a=0;a<i.length;a++){
		var o=i[a].split("=");if(o[0]==t)return o[1]
	}
}

function getClockColor(){return"quartz"==theme?"#555":"onyx"==theme?"wheat":"white"}

function startTime(){
	if(document.getElementById("clock")){
		var t=new Date,e=t.getHours();
		e>12&&(e-=12);
		var i=t.getMinutes(),a=t.getSeconds();i=checkTime(i),a=checkTime(a),document.getElementById("clock").innerHTML=e+":"+i,setTimeout(function(){startTime()},500)
	}
}

function checkTime(t){return 10>t&&(t="0"+t),t}

var scriptVersion="5.3.0";

$(function(){
	return $(".tile").append("<i class='spinner fa fa-refresh fa-spin'></i>"),
	setIcons(),
	$(".refresh, .clock").click(function(){refresh()}),
	startTime(),
	$(".dashboard").click(function(t){
		animateClick($(this)),
		t.stopImmediatePropagation(),
		t.preventDefault(),
		$(".refresh .icon").addClass("fa-spin"),
		window.location=$(this).find("a").attr("href")}),
	$(".history.tile").click(function(t){animateClick($(this)),t.stopImmediatePropagation(),t.preventDefault(),window.location="history"+(getUrlParameter("access_token")?"?access_token="+getUrlParameter("access_token"):"")}),
	
	readOnlyMode?!1:(
		$(".switch, .dimmer, .momentary, .clock, .lock, .link, .themeLight, .camera, .music i, .light, .dimmerLight").click(function(){animateClick($(this))}),
	
		$(".switch, .light, .lock, .momentary, .themeLight, .camera").click(function(){
			$(this).closest(".tile").toggleClass("active"),
			sendCommand($(this).attr("data-type"),$(this).attr("data-device"),"toggle")
		}),
	
		$(".dimmer, .dimmerLight").click(function(){
			$(this).toggleClass("active"),
			sendCommand($(this).attr("data-type"),$(this).attr("data-device"),"toggle",$(this).attr("data-level"))
		}),
	
		$(".dimmer, .dimmerLight").on("slidestop",function(){
			var t=$(this).find("input").val();
			$(this).hasClass("active")&&(animateClick($(this)),
			sendCommand($(this).attr("data-type"),
			$(this).attr("data-device"),"level",t)),
			$(this).attr("data-level",t)
		}),
	
		$(".music").on("slidestop",function(){
			var t=$(this).find("input").val();
			animateClick($(this)),
			sendCommand("music",$(this).attr("data-device"),"level",t),
			$(this).attr("data-level",t)
		}),
	
		$(".music .play").click(function(){var t=$(this).closest(".tile");$(this).closest(".tile").toggleClass("active"),sendCommand("music",t.attr("data-device"),"play")}),
		$(".music .pause").click(function(){var t=$(this).closest(".tile");$(this).closest(".tile").toggleClass("active"),sendCommand("music",t.attr("data-device"),"pause")}),
		$(".music .muted").click(function(){var t=$(this).closest(".tile");$(this).closest(".tile").toggleClass("muted"),sendCommand("music",t.attr("data-device"),"unmute")}),
		$(".music .unmuted").click(function(){var t=$(this).closest(".tile");$(this).closest(".tile").toggleClass("muted"),sendCommand("music",t.attr("data-device"),"mute")}),
		$(".music .back").click(function(){var t=$(this).closest(".tile");sendCommand("music",t.attr("data-device"),"previousTrack")}),
		$(".music .forward").click(function(){var t=$(this).closest(".tile");sendCommand("music",t.attr("data-device"),"nextTrack")}),
		
		$(".mode, .hello-home, .thermostat").click(function(){$("#"+$(this).attr("data-popup")).popup("open")}),
		$("#mode-popup li").click(function(){
			$("#mode-popup").popup("close");
			var t=$(".mode");
			animateClick(t);
			var e=$(this).text();
			sendCommand("mode","mode",e);
			var i=$(".mode").attr("data-mode");
			t.removeClass(i),
			t.attr("data-mode",e),
			["Home","Away","Night"].indexOf(e)>=0?($("#mode-name").hide(),t.addClass(e)):$("#mode-name").html(e).show()
		}),
		
		$("#hello-home-popup li").on("click",function(){$("#hello-home-popup").popup("close"),animateClick($(".hello-home")),sendCommand("helloHome","helloHome",$(this).text())}),
		
		$(".thermostatHeat .up, .thermostatCool .up").click(function(){thermostatEvent($(this).closest(".tile"),1)}),
		
		void $(".thermostatHeat .down, .thermostatCool .down").click(function(){thermostatEvent($(this).closest(".tile"),-1)})
	)
});

var fadeOn=100,fadeOff=200,polling,wtfCloud=!1;nextPoll(30),refresh(3600),CoolClock.config.skins={st:{outerBorder:{lineWidth:12,radius:100,color:"yellow",alpha:0},smallIndicator:{lineWidth:16,startAt:80,endAt:85,color:getClockColor(),alpha:1},largeIndicator:{lineWidth:2,startAt:80,endAt:85,color:getClockColor(),alpha:1},hourHand:{lineWidth:8,startAt:0,endAt:60,color:getClockColor(),alpha:1},minuteHand:{lineWidth:6,startAt:0,endAt:75,color:getClockColor(),alpha:1},secondHand:{lineWidth:5,startAt:80,endAt:85,color:"red",alpha:0},secondDecoration:{lineWidth:3,startAt:96,radius:4,fillColor:getClockColor(),color:"black",alpha:1}},st1:{outerBorder:{lineWidth:2,radius:80,color:getClockColor(),alpha:0},smallIndicator:{lineWidth:5,startAt:88,endAt:94,color:"yellow",alpha:0},largeIndicator:{lineWidth:5,startAt:90,endAt:94,color:getClockColor(),alpha:1},hourHand:{lineWidth:8,startAt:0,endAt:60,color:getClockColor(),alpha:1},minuteHand:{lineWidth:8,startAt:0,endAt:80,color:getClockColor(),alpha:1},secondHand:{lineWidth:5,startAt:89,endAt:94,color:getClockColor(),alpha:1},secondDecoration:{lineWidth:3,startAt:0,radius:4,fillColor:"black",color:"black",alpha:0}}};var cellSize=getUrlParameter("t")||tileSize,cellGutter=getUrlParameter("g")||4;
