/* globals Terraformer */
(function (root, factory) {

  // Node.
  if(typeof module === 'object' && typeof module.exports === 'object') {
    exports = module.exports = factory(require('terraformer'));
  }

  // Browser Global.
  if(typeof root.navigator === "object") {
    if (!root.Terraformer){
      throw new Error("Terraformer.ArcGIS requires the core Terraformer library. https://github.com/esri/Terraformer");
    }
    root.Terraformer.ArcGIS = factory(root.Terraformer);
  }

}(this, function(Terraformer) {
  var exports = {};

  // https://github.com/Esri/terraformer-arcgis-parser/issues/10
  function decompressGeometry(str) {
    var xDiffPrev = 0;
    var yDiffPrev = 0;
    var points = [];
    var x, y;
    var strings;
    var coefficient;

    // Split the string into an array on the + and - characters
    strings = str.match(/((\+|\-)[^\+\-]+)/g);

    // The first value is the coefficient in base 32
    coefficient = parseInt(strings[0], 32);

    for (var j = 1; j < strings.length; j += 2) {
      // j is the offset for the x value
      // Convert the value from base 32 and add the previous x value
      x = (parseInt(strings[j], 32) + xDiffPrev);
      xDiffPrev = x;

      // j+1 is the offset for the y value
      // Convert the value from base 32 and add the previous y value
      y = (parseInt(strings[j + 1], 32) + yDiffPrev);
      yDiffPrev = y;

      points.push([x / coefficient, y / coefficient]);
    }

    return points;
  }

  // checks if the first and last points of a ring are equal and closes the ring
  function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
      coordinates.push(coordinates[0]);
    }
    return coordinates;
  }

  // checks if 2 x,y points are equal
  function pointsEqual(a, b) {
    for (var i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  // shallow object clone for feature properties and attributes
  // from http://jsperf.com/cloning-an-object/2
  function clone(obj) {
    var target = {};
    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        target[i] = obj[i];
      }
    }
    return target;
  }

  // determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
  // or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
  // points-are-in-clockwise-order
  function ringIsClockwise(ringToTest) {
    var total = 0,i = 0;
    var rLength = ringToTest.length;
    var pt1 = ringToTest[i];
    var pt2;
    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }
    return (total >= 0);
  }

  // This function ensures that rings are oriented in the right directions
  // outer rings are clockwise, holes are counterclockwise
  function orientRings(poly){
    var output = [];
    var polygon = poly.slice(0);
    var outerRing = closeRing(polygon.shift().slice(0));
    if(outerRing.length >= 4){
      if(!ringIsClockwise(outerRing)){
        outerRing.reverse();
      }

      output.push(outerRing);

      for (var i = 0; i < polygon.length; i++) {
        var hole = closeRing(polygon[i].slice(0));
        if(hole.length >= 4){
          if(ringIsClockwise(hole)){
            hole.reverse();
          }
          output.push(hole);
        }
      }
    }

    return output;
  }

  // This function flattens holes in multipolygons to one array of polygons
  // [
  //   [
  //     [ array of outer coordinates ]
  //     [ hole coordinates ]
  //     [ hole coordinates ]
  //   ],
  //   [
  //     [ array of outer coordinates ]
  //     [ hole coordinates ]
  //     [ hole coordinates ]
  //   ],
  // ]
  // becomes
  // [
  //   [ array of outer coordinates ]
  //   [ hole coordinates ]
  //   [ hole coordinates ]
  //   [ array of outer coordinates ]
  //   [ hole coordinates ]
  //   [ hole coordinates ]
  // ]
  function flattenMultiPolygonRings(rings){
    var output = [];
    for (var i = 0; i < rings.length; i++) {
      var polygon = orientRings(rings[i]);
      for (var x = polygon.length - 1; x >= 0; x--) {
        var ring = polygon[x].slice(0);
        output.push(ring);
      }
    }
    return output;
  }

  function coordinatesContainCoordinates(outer, inner){
    var intersects = Terraformer.Tools.arraysIntersectArrays(outer, inner);
    var contains = Terraformer.Tools.coordinatesContainPoint(outer, inner[0]);
    if(!intersects && contains){
      return true;
    }
    return false;
  }

  // do any polygons in this array contain any other polygons in this array?
  // used for checking for holes in arcgis rings
  function convertRingsToGeoJSON(rings){
    var outerRings = [];
    var holes = [];

    // for each ring
    for (var r = 0; r < rings.length; r++) {
      var ring = closeRing(rings[r].slice(0));
      if(ring.length < 4){
        continue;
      }
      // is this ring an outer ring? is it clockwise?
      if(ringIsClockwise(ring)){
        var polygon = [ ring ];
        outerRings.push(polygon); // push to outer rings
      } else {
        holes.push(ring); // counterclockwise push to holes
      }
    }

    // while there are holes left...
    while(holes.length){
      // pop a hole off out stack
      var hole = holes.pop();
      var matched = false;

      // loop over all outer rings and see if they contain our hole.
      for (var x = outerRings.length - 1; x >= 0; x--) {
        var outerRing = outerRings[x][0];
        if(coordinatesContainCoordinates(outerRing, hole)){
          // the hole is contained push it into our polygon
          outerRings[x].push(hole);

          // we matched the hole
          matched = true;

          // stop checking to see if other outer rings contian this hole
          break;
        }
      }

      // no outer rings contain this hole turn it into and outer ring (reverse it)
      if(!matched){
        outerRings.push([ hole.reverse() ]);
      }
    }

    if(outerRings.length === 1){
      return {
        type: "Polygon",
        coordinates: outerRings[0]
      };
    } else {
      return {
        type: "MultiPolygon",
        coordinates: outerRings
      };
    }
  }

  // ArcGIS -> GeoJSON
  function parse(arcgis, options){
    var geojson = {};

    options = options || {};
    options.idAttribute = options.idAttribute || undefined;

    if(typeof arcgis.x === 'number' && typeof arcgis.y === 'number'){
      geojson.type = "Point";
      geojson.coordinates = [arcgis.x, arcgis.y];
      if (arcgis.z || arcgis.m){
        geojson.coordinates.push(arcgis.z);
      }
      if (arcgis.m){
        geojson.coordinates.push(arcgis.m);
      }
    }

    if(arcgis.points){
      geojson.type = "MultiPoint";
      geojson.coordinates = arcgis.points.slice(0);
    }

    if(arcgis.paths) {
      if(arcgis.paths.length === 1){
        geojson.type = "LineString";
        geojson.coordinates = arcgis.paths[0].slice(0);
      } else {
        geojson.type = "MultiLineString";
        geojson.coordinates = arcgis.paths.slice(0);
      }
    }

    if(arcgis.rings) {
      geojson = convertRingsToGeoJSON(arcgis.rings.slice(0));
    }

    if(arcgis.compressedGeometry || arcgis.geometry || arcgis.attributes) {
      geojson.type = "Feature";

      if(arcgis.compressedGeometry){
        arcgis.geometry = {
          paths: [
            decompressGeometry(arcgis.compressedGeometry)
          ]
        };
      }

      geojson.geometry = (arcgis.geometry) ? parse(arcgis.geometry) : null;
      geojson.properties = (arcgis.attributes) ? clone(arcgis.attributes) : null;
      if(arcgis.attributes) {
        geojson.id =  arcgis.attributes[options.idAttribute] || arcgis.attributes.OBJECTID || arcgis.attributes.FID;
      }
    }

    var inputSpatialReference = (arcgis.geometry) ? arcgis.geometry.spatialReference : arcgis.spatialReference;

    //convert spatial ref if needed
    if(inputSpatialReference && inputSpatialReference.wkid === 102100){
      geojson = Terraformer.toGeographic(geojson);
    }

    return new Terraformer.Primitive(geojson);
  }

  // GeoJSON -> ArcGIS
  function convert(geojson, options){
    var spatialReference;

    options = options || {};
    var idAttribute = options.idAttribute || "OBJECTID";

    if(options.sr){
      spatialReference = { wkid: options.sr };
    } else if (geojson && geojson.crs === Terraformer.MercatorCRS) {
      spatialReference = { wkid: 102100 };
    } else {
      spatialReference = { wkid: 4326 };
    }

    var result = {};
    var i;

    switch(geojson.type){
    case "Point":
      result.x = geojson.coordinates[0];
      result.y = geojson.coordinates[1];
      if(geojson.coordinates[2]) {
        result.z = geojson.coordinates[2];
      }
      if(geojson.coordinates[3]) {
        result.m = geojson.coordinates[3];
      }
      result.spatialReference = spatialReference;
      break;
    case "MultiPoint":
      result.points = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case "LineString":
      result.paths = [geojson.coordinates.slice(0)];
      result.spatialReference = spatialReference;
      break;
    case "MultiLineString":
      result.paths = geojson.coordinates.slice(0);
      result.spatialReference = spatialReference;
      break;
    case "Polygon":
      result.rings = orientRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case "MultiPolygon":
      result.rings = flattenMultiPolygonRings(geojson.coordinates.slice(0));
      result.spatialReference = spatialReference;
      break;
    case "Feature":
      if(geojson.geometry) {
        result.geometry = convert(geojson.geometry, options);
      }
      result.attributes = (geojson.properties) ? clone(geojson.properties) : {};
      result.attributes[idAttribute] = geojson.id;
      break;
    case "FeatureCollection":
      result = [];
      for (i = 0; i < geojson.features.length; i++){
        result.push(convert(geojson.features[i], options));
      }
      break;
    case "GeometryCollection":
      result = [];
      for (i = 0; i < geojson.geometries.length; i++){
        result.push(convert(geojson.geometries[i], options));
      }
      break;
    }

    return result;
  }

  function parseCompressedGeometry(string){
    return new Terraformer.LineString(decompressGeometry(string));
  }

  exports.parse   = parse;
  exports.convert = convert;
  exports.toGeoJSON = parse;
  exports.fromGeoJSON = convert;
  exports.parseCompressedGeometry = parseCompressedGeometry;

  return exports;
}));
