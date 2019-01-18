var _draw = false;
function draw(viewer) {
    
    $("#drawButton").click(function() {
        _draw = true;
    });

    var canvas = viewer.canvas;
    var scene = viewer.scene;
    var positions = [];
    var polyline = null;
    var polygon = null;
    var firstHeight;
    var enableDrawHeightDepth = false;

    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    handler.setInputAction(function(click) {
        if(_draw == false) return;

        if(polygon) {
            return;
            //removeDrawEntities();
        }

        var cartesian = scene.pickPosition(click.position);
            
            if (scene.pickPositionSupported && Cesium.defined(cartesian)) {

                // first click
                if(positions.length == 0) {
                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    firstHeight = cartographic.height;
                    positions.push(cartesian);
                }
                else if(positions.length > 0) {

                    var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                    cartesian = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, firstHeight);

                    positions.push(cartesian);

                    //remove previous polylines to draw new polyline against newly added point
                    if(polyline)    
                        viewer.entities.remove(polyline);

                    polyline = viewer.entities.add({
                        polyline : {
                            positions :positions,
                            pixelSize : 5,
                            material : Cesium.Color.YELLOW
                        }
                    });

                }

            }
            
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


    var drawPolyline = null;
    var mousePosition;
    //draw plylines when mouse move
    handler.setInputAction(function(movement) {
        if(_draw == false) return;
        //when polygon is drawn, draw height/depth
        if(polygon) {
            drawHeightDepth(movement);
            return;
        }
        if(positions.length > 0) {
            if(mousePosition != movement.startPosition) {
                if(drawPolyline) {
                    viewer.entities.remove(drawPolyline);
                    drawPolyline = null;
                }
            }
            else return;
            var cursorCartesian = scene.pickPosition(movement.endPosition);
            mousePosition = movement.endPosition;
            var points = [];
            points[0] = positions[positions.length-1];
            points[1] = cursorCartesian;
            drawPolyline = viewer.entities.add({
                polyline : {
                    positions :points,
                    pixelSize : 5,
                    material : Cesium.Color.DARKGREY
                }
            });
            
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    handler.setInputAction(function(movement) {
        if(_draw == false) return;

        // Pick a new feature
        var pickedObject = viewer.scene.pick(movement.position);
        if (Cesium.defined(pickedObject) && (pickedObject.id === polygon)) {
            enableDrawHeightDepth = true;
        }

    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);


    handler.setInputAction(function(movement) {
        if(_draw == false) return;
        enableDrawHeightDepth = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);


    function drawHeightDepth(movement) {
        if(enableDrawHeightDepth == false)
            return;

        var startMousePosition = movement.startPosition;
        var endMousePosition = movement.endPosition;

        var y = -(endMousePosition.y - startMousePosition.y);

        if(y > 0)
            y = 0.1;
        else if(y < 0)
            y = -0.1;
       polygon.polygon.extrudedHeight = parseFloat(polygon.polygon.extrudedHeight._value) + y;


       /* var cursorCartesian = scene.pickPosition(movement.endPosition);
        var cursorCartographic = Cesium.Cartographic.fromCartesian(cursorCartesian);
        var height = cursorCartographic.height;
        polygon.polygon.extrudedHeight = height;*/

    }


    //double click to draw polygon if points are greater than or equal to 3
    handler.setInputAction(function(click) {
        if(_draw == false) return;
        if(positions.length >= 2) {
            //remove polylines to draw polygon
            if(polyline)    
                viewer.entities.remove(polyline);

            var cursorCartesian = scene.pickPosition(click.position);
            var cursorCartographic = Cesium.Cartographic.fromCartesian(cursorCartesian);
            var height = cursorCartographic.height;    

            polygon = viewer.entities.add({
                polygon : {
                    hierarchy : positions,
                    extrudedHeight : height,
                    perPositionHeight : true,
                    pixelSize : 5,
                    material : Cesium.Color.YELLOW.withAlpha(0.5),
                    outline : true,
                    outlineColor : Cesium.Color.YELLOW,
                    outlineWidth : 5
                }
            });
        }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);



    //left click to delete polylines
    handler.setInputAction(function(click) {
        if(_draw == false) return;
        if(polygon) 
            removeDrawEntities();
        //remove first point when no polyline was drawn
        else if(positions.length == 1) {
            positions.pop();
            viewer.entities.remove(drawPolyline);
            drawPolyline = null;
        }    
        //remove last point and draw new polyline
        else if(polyline) {  
            viewer.entities.remove(polyline);
            positions.pop();
            polyline = viewer.entities.add({
                polyline : {
                    positions :positions,
                    pixelSize : 5,
                    material : Cesium.Color.YELLOW
                }
            });
        }    
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);



    $("#cursorButton").click(function() {
        resetDraw();
        removeDrawEntities();
    }); 
    $("#measureButton").click(function() {
        resetDraw();
        removeDrawEntities();
    });

    function resetDraw() {
        _draw = false;
    }

    function removeDrawEntities() {
        positions = [];
        viewer.entities.remove(polyline);
        viewer.entities.remove(polygon);  
        viewer.entities.remove(drawPolyline);
        polyline = null;
        polygon = null;
        drawPolyline = null;
    } 

}