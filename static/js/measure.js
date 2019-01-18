var _measure = false;
function measure(viewer) {

    
    
    $("#measureButton").click(function() {
       // viewer.scene.globe.depthTestAgainstTerrain = true;
       _measure = true;
    });

    var canvas = viewer.canvas;
    var scene = viewer.scene;
    var points = [];

    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    handler.setInputAction(function(click) {
            if(_measure == false) return;
           
            var cartesian = scene.pickPosition(click.position);
            
            if (scene.pickPositionSupported && Cesium.defined(cartesian)) {

                /*var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var groundAltitude = getGroundAltitude(viewer, cartographic);
                cartesian = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, groundAltitude);
*/
                //Clear all 2 points and line
                if(points.length == 2) {
                    removeMeasureEntities();
                }

                points.push(cartesian);                 
                
                //Draw points
                if(points.length <= 2) {
                    viewer.entities.add({
                        id : "measurePoint"+points.length,
                        position : cartesian,
                        point : {
                            pixelSize : 5,
                            color : Cesium.Color.YELLOW
                        }
                    });

                    //Draw line between 2 points
                    if(points.length == 2) {
                        viewer.entities.add({
                            id : "measureLine",
                            polyline : {
                                positions : points,
                                width : 1,
                                material : Cesium.Color.YELLOW
                            }
                        });

                        //Measures distance between 2 points and place text
                        var distance = Cesium.Cartesian3.distance(points[0], points[1]);
                        distance = distance.toFixed(2).toString() + ' m';

                        //Measures mid point between 2 points to place the label
                        var midpoint =  Cesium.Cartesian3.midpoint(points[0], points[1], new Cesium.Cartesian3());

                        viewer.entities.add({
                            id : "distanceLabel",
                            position : midpoint,
                            label : {
                                text : "Distance: " + distance,
                                scale : 0.75,
                                verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
                                horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
                                showBackground : true,
                                fillColor : Cesium.Color.YELLOW
                            }                            
                        });

                        //Measure point 1 height
                        var cartographic = Cesium.Cartographic.fromCartesian(points[0]);
                        var height1 = cartographic.height;

                        //Measure point 2 height
                        var cartographic = Cesium.Cartographic.fromCartesian(points[1]);
                        var height2 = cartographic.height;

                        var verticalDistance = height1 - height2;
                        verticalDistance = Math.abs(verticalDistance);
                        verticalDistance = verticalDistance.toFixed(2).toString() + ' m';


                        viewer.entities.add({
                            id : "verticalDistanceLabel",
                            position : midpoint,
                            label : {
                                text : "Vertical Distance: " + verticalDistance,
                                scale : 0.75,
                                verticalOrigin : Cesium.VerticalOrigin.TOP,
                                horizontalOrigin : Cesium.HorizontalOrigin.RIGHT,
                                showBackground : true,
                                fillColor : Cesium.Color.YELLOW
                            }                           
                        });
                    }
                } 
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    $("#cursorButton").click(function() {
        resetMeasure();
        removeMeasureEntities();
    });  
    $("#drawButton").click(function() {
        resetMeasure();
        removeMeasureEntities();
    });  

    function resetMeasure() {
        _measure = false;
    }

    function removeMeasureEntities() {

        points = [];
        //viewer.entities.removeAll();
        viewer.entities.removeById("measurePoint1");
        viewer.entities.removeById("measurePoint2");
        viewer.entities.removeById("measureLine");
        viewer.entities.removeById("distanceLabel");
        viewer.entities.removeById("verticalDistanceLabel");

    } 

    
}
