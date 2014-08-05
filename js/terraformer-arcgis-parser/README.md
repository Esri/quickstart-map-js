# Terraformer ArcGIS JSON Parser

This plugin handles 2 way conversion between [GeoJSON](http://geojson.org/geojson-spec.html) and the [ArcGIS Geometry](http://help.arcgis.com/en/arcgisserver/10.0/apis/rest/geometry.html) format used by Esri.

This package is part of the [Terraformer](http://terraformer.io) project.

## Installing

### Node.js

    $ npm install terraformer-arcgis-parser

### Browser

In the browser, [Terraformer](http://github.com/esri/terraformer) is required.

You can use [Bower](http://bower.io/) to install the components if you like or download them and host them yourself.

```
$ bower install terraformer-arcgis-parser
```

## Documentation

For full documentation check out the [offical website](http://terraformer.io/arcgis-parser/).

```js
var ArcGIS = require('terraformer-arcgis-parser');

// parse ArcGIS JSON, convert it to a Terraformer.Primitive (GeoJSON)
var primitive = ArcGIS.parse({
    x:"-122.6764",
    y:"45.5165",
    spatialReference: {
      wkid: 4326
    }
  });

// take a Terraformer.Primitive or GeoJSON and convert it back to ArcGIS JSON
var point = ArcGIS.convert({
  "type": "Point",
  "coordinates": [45.5165, -122.6764]
});
```

```html
  <!-- Load the main Terraformer library -->
  <script src="terraformer.min.js" type="text/javascript"></script>
  
  <!-- Load the ArcGIS Parser -->
  <script src="terraformer-arcgis-parser.min.js" type="text/javascript"></script>
  
  <!-- Use it! -->
  <script>
    var primitive = Terraformer.ArcGIS.parse({
      x:"-122.6764",
      y:"45.5165",
      spatialReference: {
        wkid: 4326
      }
    });

    // take a Terraformer.Primitive or GeoJSON and convert it to ArcGIS JSON
    var point = Terraformer.ArcGIS.convert({
      "type": "Point",
      "coordinates": [45.5165, -122.6764]
    });
  </script>
  ```

## Resources

* [Terraformer Website](http://terraformer.io)
* [twitter@EsriPDX](http://twitter.com/esripdx)

## Issues

Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

[](Esri Tags: Terraformer GeoJSON ArcGIS)
[](Esri Language: JavaScript)
