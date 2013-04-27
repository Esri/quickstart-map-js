define(["esri/map","esri/symbols/PictureMarkerSymbol","dojo/on", "dojo/_base/connect"], 
	function(Map,PictureMarkerSymbol, on, conn) {
      "use strict"
      var resizeDelay = 200;
      return {
			 autoRecenter:function(map) {
	      conn.connect(map, 'onLoad', function (map) {
	        on(window, 'resize', map, map.resize);
	      });
	      conn.connect(map, 'onResize',  function(extent, width, height) { 
	        map.__resizeCenter = map.extent.getCenter();
	        setTimeout(function() {
	          map.centerAt(map.__resizeCenter);
	        }, resizeDelay);
	      });
	    },
			createPictureSymbol:function(url, xOffset, yOffset, size) {
	      return new PictureMarkerSymbol(
	      {
	          "angle": 0,
	          "xoffset": xOffset, "yoffset": yOffset, "type": "esriPMS",
	          "url": url,  
	          "contentType": "image/png",
	          "width":size, "height": size
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