# quickstart-map-js

A simple set of examples that illustrate how to accomplish different mapping (and GIS) tasks with the [ArcGIS API for JavaScript](http://developers.arcgis.com) and [ArcGIS Online Services](https://developers.arcgis.com/en/features/). Also, learn how to style your apps nicely with the [Bootstrap 3.x framework](http://getbootstrap.com).

[View the samples](http://esri.github.com/quickstart-map-js/index.html)

![App](https://raw.github.com/Esri/quickstart-map-js/master/quickstart-map-js.png)

## Features
* Basemaps - Set different basemaps interactively
* Geolocation - Find and display your geolocation
* Place Finding - Find places or geocode an address
* Geocode - Forward and reverse geocoding
* Directions - Get directions, use direction widgets, multi-directions with barriers
* Graphics - Draw points, lines and polygons
* Maps - Load and auto resize and center maps
* Cloud - Draw and query features stored in the ArcGIS Online cloud
* Data - Load JSON services
* Popups - Format and position info windows and your own map pins
* Map Pins - You can use new Esri markers for point locations

NOTE: All examples are built with [Bootstrap 3.x styles](http://getbootstrap.com). To build fully responsive maps for all devices, see [Bootstrap-map-js](http://github.com/esri/bootstrap-map-js).

## Instructions

1. Fork and then clone the repo. 
2. Try the examples locally or try them [here](http://esri.github.com/quickstart-map-js/index.html).

NOTE: You should just be able to cut-and-paste and run the examples in JSFiddle!

## Example

``` HTML
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=7,IE=9">   
  <meta name="viewport" content="initial-scale=1, maximum-scale=1,user-scalable=no">
  <title>Basemaps</title>
  <link rel="shortcut icon" href="//esri.github.io/quickstart-map-js/images/favicon.ico">
  <!-- ArcGIS API for JavaScript CSS-->
  <link rel="stylesheet" href="//js.arcgis.com/3.10/js/esri/css/esri.css">
  <!-- Web Framework CSS - Bootstrap (getbootstrap.com) and Bootstrap-map-js (github.com/esri/bootstrap-map-js) -->
  <link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="//esri.github.io/bootstrap-map-js/src/css/bootstrapmap.css">
  <style>
    html, body, #mapDiv {
      height: 100%;
      width: 100%;
    }
  </style>

  <!-- ArcGIS API for JavaScript library references -->
  <script src="//js.arcgis.com/3.10compact"></script>
  <script>
    require(["esri/map", 
      "dojo/on", 
      "dojo/dom", 
      "dojo/domReady!"], 
      function(Map, on, dom) {
        // Create map
        var map = new Map("mapDiv",{ 
          basemap: "gray",
          center: [-122.69, 45.52],
          zoom: 3
        });

        // Wire UI Events
        on(dom.byId("btnStreets"),"click", function() { 
          map.setBasemap("streets");
        });
        on(dom.byId("btnSatellite"),"click", function() { 
          map.setBasemap("satellite");
        });
        on(dom.byId("btnHybrid"),"click", function() { 
          map.setBasemap("hybrid");
        });
        on(dom.byId("btnTopo"),"click", function() { 
          map.setBasemap("topo");
        });
        on(dom.byId("btnGray"),"click", function() { 
          map.setBasemap("gray");
        });
        on(dom.byId("btnNatGeo"),"click", function() { 
          map.setBasemap("national-geographic");
        });
    });
  </script>   
</head>
  <body>
    <div class="panel panel-primary panel-fixed">
      <div class="panel-heading">
        <h3 class="panel-title">Basemaps</h3>
      </div>
      <div class="panel-body">
        <div class="btn-toolbar">
          <div class="btn-group">
            <button id="btnStreets" class="btn btn-default">Streets</button>
            <button id="btnSatellite" class="btn btn-default">Satellite</button>
            <button id="btnHybrid" class="btn btn-default">Hybrid</button>
            <button id="btnTopo" class="btn btn-default">Topo</button>
          </div>  
        </div>
        <div class="btn-toolbar">
          <div class="btn-group">
            <button id="btnGray" class="btn btn-default">Gray</button>
            <button id="btnNatGeo" class="btn btn-default">National Geographic</button>
          </div>  
        </div>
      </div>
    </div>
    <div id="mapDiv"></div>
  </body>
</html>
```

## Requirements

* Notepad or your favorite HTML editor
* Web browser with access to the Internet
* All samples reference:

[Bootstrap 3.x: Web Framework CSS](http://getbootstrap.com)
```
//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css
```

[Bootstrap-map-js: Map, Popup and Dijit CSS](http://github.com/esri/bootstrap-map-js)
```
//esri.github.io/bootstrap-map-js/src/css/bootstrapmap.css
```

## Resources

* [ArcGIS for JavaScript API Resource Center](http://developers.arcgis.com)
* [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)
* [twitter@esri](http://twitter.com/esri)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.  Thank you!

* Directions - Uses OAuth and requires you to sign up for a [free ArcGIS Developer Subscription](https://developers.arcgis.com/en/sign-up/) to use the app.

## Contributing

Anyone and everyone is welcome to contribute. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing
Copyright 2013 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt]( https://raw.github.com/Esri/quickstart-map-js/master/license.txt) file.

[](Esri Tags: ArcGIS Web Mapping QuickStart)
[](Esri Language: JavaScript)
