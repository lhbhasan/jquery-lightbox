/**
 * jQuery Lightbox
 * Version 0.5 - 11/29/2007
 * @author Warren Krewenki
 *
 * Based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * Originally written to make use of the Prototype framework, and Script.acalo.us, now altered to use jQuery.
 *
 **/

(function($){
	$.fn.lightbox = function(options){
		debug(this);
		
		// build main options
		var opts = $.extend({}, $.fn.lightbox.defaults, options);
		
		// initalize the lightbox
		$.fn.lightbox.initialize();
		return this.each(function(){
			$(this).click(function(){
				$(this).lightbox.start(this);
				return false;
			});
		});
	};
	
	function debug($obj) {
		if (window.console && window.console.log)
			window.console.log('lightbox initalization count: ' + $obj.size());
	};
	
	// lightbox functions
	$.fn.lightbox.initialize = function(){
		$.fn.lightbox.destroyElement('overlay');
		$.fn.lightbox.destroyElement('lightbox');
		$.fn.lightbox.defaults.inprogress = false;
		$("body").append('<div id="overlay"></div><div id="lightbox"><div id="outerImageContainer"><div id="imageContainer"><img id="lightboxImage"><div style="" id="hoverNav"><a href="javascript://" id="prevLink"></a><a href="javascript://" id="nextLink"></a></div><div id="loading"><a href="javascript://" id="loadingLink"><img src="'+$.fn.lightbox.defaults.fileLoadingImage+'"></a></div></div></div><div id="imageDataContainer"><div id="imageData"><div id="imageDetails"><span id="caption"></span><span id="numberDisplay"></span></div><div id="bottomNav"><a href="javascript://" id="bottomNavClose"><img src="'+$.fn.lightbox.defaults.fileBottomNavCloseImage+'"></a></div></div></div></div>');
		$("#overlay").click(function(){ $.fn.lightbox.end(); }).hide();
		$("#lightbox").click(function(){ $.fn.lightbox.end();}).hide();
		$("#loadingLink").click(function(){ $.fn.lightbox.end(); return false;});
		$("#bottomNavClose").click(function(){ $.fn.lightbox.end(); return false; });
		$('#outerImageContainer').css({width: '250px', height: '250px;'});		
	};
	
	$.fn.lightbox.getPageSize = function(){
		var xScroll, yScroll;

		if (window.innerHeight && window.scrollMaxY) {	
			xScroll = window.innerWidth + window.scrollMaxX;
			yScroll = window.innerHeight + window.scrollMaxY;
		} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
			xScroll = document.body.scrollWidth;
			yScroll = document.body.scrollHeight;
		} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
			xScroll = document.body.offsetWidth;
			yScroll = document.body.offsetHeight;
		}

		var windowWidth, windowHeight;

		if (self.innerHeight) {	// all except Explorer
			if(document.documentElement.clientWidth){
				windowWidth = document.documentElement.clientWidth; 
			} else {
				windowWidth = self.innerWidth;
			}
			windowHeight = self.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
			windowWidth = document.documentElement.clientWidth;
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) { // other Explorers
			windowWidth = document.body.clientWidth;
			windowHeight = document.body.clientHeight;
		}	

		// for small pages with total height less then height of the viewport
		if(yScroll < windowHeight){
			pageHeight = windowHeight;
		} else { 
			pageHeight = yScroll;
		}


		// for small pages with total width less then width of the viewport
		if(xScroll < windowWidth){	
			pageWidth = xScroll;		
		} else {
			pageWidth = windowWidth;
		}

		arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight) 
		return arrayPageSize;
		

	};
	
	
	$.fn.lightbox.getPageScroll = function(){
		var xScroll, yScroll;

		if (self.pageYOffset) {
			yScroll = self.pageYOffset;
			xScroll = self.pageXOffset;
		} else if (document.documentElement && document.documentElement.scrollTop){	 // Explorer 6 Strict
			yScroll = document.documentElement.scrollTop;
			xScroll = document.documentElement.scrollLeft;
		} else if (document.body) {// all other Explorers
			yScroll = document.body.scrollTop;
			xScroll = document.body.scrollLeft;	
		}

		arrayPageScroll = new Array(xScroll,yScroll) 
		return arrayPageScroll;		
	};
	
	$.fn.lightbox.pause = function(ms){
		var date = new Date();
		curDate = null;
		do{var curDate = new Date();}
		while( curDate - date < ms);		
	};
	
	$.fn.lightbox.start = function(imageLink){
		$("select, embed, object").hide();
		var arrayPageSize = $.fn.lightbox.getPageSize();
		$("#overlay").hide().css({width: '100%', height: arrayPageSize[1]+'px', opacity : $.fn.lightbox.defaults.overlayOpacity}).fadeIn();
		$.fn.lightbox.defaults.imageArray = [];
		imageNum = 0;		
		
		var anchors = document.getElementsByTagName( imageLink.tagName);
	
		// if image is NOT part of a set..
		if(!imageLink.rel || (imageLink.rel == '')){
			// add single image to Lightbox.imageArray
			$.fn.lightbox.defaults.imageArray.push(new Array(imageLink.href, imageLink.title));			
		} else {
		// if image is part of a set..
			$("a").each(function(){
				if(this.href && (this.rel == imageLink.rel)){
					$.fn.lightbox.defaults.imageArray.push(new Array(this.href, this.title));
				}
			})


			for(i = 0; i < $.fn.lightbox.defaults.imageArray.length; i++){
		        for(j = $.fn.lightbox.defaults.imageArray.length-1; j>i; j--){        
		            if($.fn.lightbox.defaults.imageArray[i][0] == $.fn.lightbox.defaults.imageArray[j][0]){
		                $.fn.lightbox.defaults.imageArray.splice(j,1);
		            }
		        }
		    }
			while($.fn.lightbox.defaults.imageArray[imageNum][0] != imageLink.href) { imageNum++;}
		}

		// calculate top and left offset for the lightbox 
		var arrayPageScroll = $.fn.lightbox.getPageScroll();
		var lightboxTop = arrayPageScroll[1] + (arrayPageSize[3] / 10);
		var lightboxLeft = arrayPageScroll[0];
		$('#lightbox').css({top: lightboxTop+'px', left: lightboxLeft+'px'}).show();
		
		$.fn.lightbox.changeImage(imageNum);
		
	};
	
	$.fn.lightbox.changeImage = function(imageNum){
		if($.fn.lightbox.defaults.inprogress == false){
			$.fn.lightbox.defaults.inprogress = true;
			$.fn.lightbox.defaults.activeImage = imageNum;	// update global var

			// hide elements during transition
			$('#loading').show();
			$('#lightboxImage').hide();
			$('#hoverNav').hide();
			$('#prevLink').hide();
			$('#nextLink').hide();
			$('#imageDataContainer').hide();
			$('#numberDisplay').hide();		
		
			imgPreloader = new Image();
		
			// once image is preloaded, resize image container
			imgPreloader.onload=function(){
				document.getElementById('lightboxImage').src = $.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage][0];
				$.fn.lightbox.resizeImageContainer(imgPreloader.width, imgPreloader.height);
			}
			imgPreloader.src = $.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage][0];
		}		
	};
	
	
	
	$.fn.lightbox.destroyElement = function(id){
		if(el = document.getElementById(id)){
			el.parentNode.removeChild(el);
		}
	};

	$.fn.lightbox.end = function(){
		$.fn.lightbox.disableKeyboardNav();
		$('#lightbox').hide();
		$('#overlay').fadeOut();
		$('select, object, embed').show();
	};

	$.fn.lightbox.preloadNeighborImages = function(){
		if(($.fn.lightbox.defaults.imageArray.length - 1) > $.fn.lightbox.defaults.activeImage){
			preloadNextImage = new Image();
			preloadNextImage.src = $.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage + 1][0];
		}
		if($.fn.lightbox.defaults.activeImage > 0){
			preloadPrevImage = new Image();
			preloadPrevImage.src = $.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage - 1][0];
		}
	};
	
	$.fn.lightbox.keyboardAction = function(e){
		if (e == null) { // ie
			keycode = event.keyCode;
			escapeKey = 27;
		} else { // mozilla
			keycode = e.keyCode;
			escapeKey = e.DOM_VK_ESCAPE;
		}

		key = String.fromCharCode(keycode).toLowerCase();

		if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){	// close lightbox
			$.fn.lightbox.end();
		} else if((key == 'p') || (keycode == 37)){	// display previous image
			if($.fn.lightbox.defaults.activeImage != 0){
				$.fn.lightbox.disableKeyboardNav();
				$.fn.lightbox.changeImage($.fn.lightbox.defaults.activeImage - 1);
			}
		} else if((key == 'n') || (keycode == 39)){	// display next image
			if($.fn.lightbox.defaults.activeImage != ($.fn.lightbox.defaults.imageArray.length - 1)){
				$.fn.lightbox.disableKeyboardNav();
				$.fn.lightbox.changeImage($.fn.lightbox.defaults.activeImage + 1);
			}
		}		
	};
	
	$.fn.lightbox.resizeImageContainer = function(imgWidth, imgHeight){
		// get curren width and height
		$.fn.lightbox.defaults.widthCurrent = document.getElementById('outerImageContainer').offsetWidth;
		$.fn.lightbox.defaults.heightCurrent = document.getElementById('outerImageContainer').offsetHeight;

		// get new width and height
		var widthNew = (imgWidth  + ($.fn.lightbox.defaults.borderSize * 2));
		var heightNew = (imgHeight  + ($.fn.lightbox.defaults.borderSize * 2));

		// scalars based on change from old to new
		$.fn.lightbox.defaults.xScale = ( widthNew / $.fn.lightbox.defaults.widthCurrent) * 100;
		$.fn.lightbox.defaults.yScale = ( heightNew / $.fn.lightbox.defaults.heightCurrent) * 100;

		// calculate size difference between new and old image, and resize if necessary
		wDiff = $.fn.lightbox.defaults.widthCurrent - widthNew;
		hDiff = $.fn.lightbox.defaults.heightCurrent - heightNew;

		$('#outerImageContainer').animate({width: widthNew},$.fn.lightbox.defaults.resizeSpeed,'linear',function(){
			$('#outerImageContainer').animate({height: heightNew},$.fn.lightbox.defaults.resizeSpeed,'linear',function(){
				$.fn.lightbox.showImage();	
			});
		});


		// if new and old image are same size and no scaling transition is necessary, 
		// do a quick pause to prevent image flicker.
		if((hDiff == 0) && (wDiff == 0)){
			if (navigator.appVersion.indexOf("MSIE")!=-1){ $.fn.lightbox.pause(250); } else { $.fn.lightbox.pause(100);} 
		}

		$('#prevLink').css({height: imgHeight+'px'});
		$('#nextLink').css({height: imgHeight+'px'});
		$('#imageDataContainer').css({width: widthNew+'px'});	
	};
	
	$.fn.lightbox.showImage = function(){
		$('#loading').hide();
		$('#lightboxImage').fadeIn("fast");
		$.fn.lightbox.updateDetails();
		$.fn.lightbox.preloadNeighborImages();
		$.fn.lightbox.defaults.inprogress = false;
	};
	
	$.fn.lightbox.updateDetails = function(){
		$("#imageDataContainer").hide();
		if($.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage][1]){
			$('#caption').html($.fn.lightbox.defaults.imageArray[$.fn.lightbox.defaults.activeImage][1]).show();
		}
		
		// if image is part of set display 'Image x of x' 
		if($.fn.lightbox.defaults.imageArray.length > 1){
			$('#numberDisplay').html("Image " + eval($.fn.lightbox.defaults.activeImage + 1) + " of " + $.fn.lightbox.defaults.imageArray.length).show();
		}

		$("#imageDataContainer").hide().slideDown("slow");
		var arrayPageSize = $.fn.lightbox.getPageSize();
		$('#overLay').css({height: arrayPageSize[1]+'px'});
		$.fn.lightbox.updateNav();		
	};
	
	$.fn.lightbox.updateNav = function(){
		$('#hoverNav').show();				

		// if not first image in set, display prev image button
		if($.fn.lightbox.defaults.activeImage != 0){
			$('#prevLink').show().click(function(){
				$.fn.lightbox.changeImage($.fn.lightbox.defaults.activeImage - 1); return false;
			});
		}

		// if not last image in set, display next image button
		if($.fn.lightbox.defaults.activeImage != ($.fn.lightbox.defaults.imageArray.length - 1)){
			$('#nextLink').show().click(function(){
				
				$.fn.lightbox.changeImage($.fn.lightbox.defaults.activeImage +1); return false;
			});
		}
		
		$.fn.lightbox.enableKeyboardNav();		
	};
	
	
	$.fn.lightbox.enableKeyboardNav = function(){
		document.onkeydown = $.fn.lightbox.keyboardAction;
	};

	$.fn.lightbox.disableKeyboardNav = function(){
		document.onkeydown = '';
	};

	$.fn.lightbox.defaults = {
		fileLoadingImage : 'images/loading.gif',
		fileBottomNavCloseImage : 'images/closelabel.gif',
		overlayOpacity : 0.8,
		borderSize : 10,
		imageArray : new Array,
		activeImage : null,
		inprogess : false,
		resizeSpeed : 350,
		widthCurrent : 250,
		heightCurrent : 250,
		xScale : 1,
		yScale : 1
	};
})(jQuery);