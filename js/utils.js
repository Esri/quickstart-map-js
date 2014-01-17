define(["esri/map","esri/symbols/PictureMarkerSymbol","esri/dijit/Popup", "dojo/dom-construct", "dojo/on", "dojo/dom"], 
	function(Map, PictureMarkerSymbol, Popup, domConstruct, on, dom) {
      "use strict"
      var resizeDelay = 200;
      return {
			autoRecenter:function(map) {
	      on(map, 'load', function (map) {
	        on(window, 'resize', map, map.resize);
	      });
	      on(map, 'resize',  function(extent, width, height) { 
	        map.__resizeCenter = map.extent.getCenter();
	        setTimeout(function() {
	          map.centerAt(map.__resizeCenter);
	        }, resizeDelay);
	      });
	    },
	    setPopup:function(map,anchorPos,xOffset,yOffset) {
        var popup = new Popup({anchor:anchorPos, offsetX:xOffset, offsetY:yOffset}, dojo.create("div"));
        popup.startupDijits();
        map.infoWindow = popup;
				map.infoWindow.set("highlight", false);
				popup.domNode.style.marginLeft = xOffset+"px";
	    },
			createPictureSymbol:function(url, xOffset, yOffset, xWidth, yHeight) {
	      return new PictureMarkerSymbol(
	      {
	          "angle": 0,
	          "xoffset": xOffset, "yoffset": yOffset, "type": "esriPMS",
	          "url": url,  
	          "contentType": "image/png",
	          "width":xWidth, "height": yHeight
	      });
	    },
      setSelected:function (button) {
        var elements = document.getElementsByClassName('button');
        for (var i = 0; i < elements.length; i++) {
            setStyle(elements[i], "button");
        }
        button.className = "button selected";
      },
			setMessage:function(msg) {
			  var element = document.getElementById("userMessage");
			  element.innerHTML = msg;
			}, 
			setStyle:function(elementName, className) {
			  var element = document.getElementById(elementName);
			  if (element)
			    element.className = className;
			}
	  }
	}
);