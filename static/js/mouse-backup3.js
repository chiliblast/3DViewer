function handleMouse(viewer) {

    var scene = viewer.scene;
    var canvas = viewer.canvas;
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function() {
        canvas.focus();
    };
    var ellipsoid = viewer.scene.globe.ellipsoid;
    // disable the default event handlers
    //scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

    var startMousePosition;
    var ellipsoid;
    var pan = false;

    var pickedCenter;

    var handler = new Cesium.ScreenSpaceEventHandler(canvas);


    handler.setInputAction(function(movement) {

        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
     
        if (pan) { 
            var center = scene.pickPosition(movement.startPosition);
        
            ellipsoid = Cesium.Ellipsoid.fromCartesian3(center);
        
    
            pan3D(startMousePosition, movement, scene.globe.ellipsoid);            
        }

        
        if (cartesian) {
            var cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            cursorLon = Cesium.Math.toDegrees(cartographic.longitude);
            cursorLat = Cesium.Math.toDegrees(cartographic.latitude);
            $('#LatLon').html(cursorLon.toFixed(2) + ',' + cursorLat.toFixed(2));
            //$('#LatLon').html(cursorLon + ',' + cursorLat);
        } 

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    //-----Right Mouse
    handler.setInputAction(function(movement) {
        pan = true;
        startMousePosition = Cesium.Cartesian3.clone(movement.position);
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    handler.setInputAction(function(position) {
        pan = false;
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);




    //-----Left Mouse
    handler.setInputAction(function(movement) {
        
        // Pick a new feature
        var pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature) || typeof(pickedFeature.content) == 'undefined') {
            return;
        }
        //scene.screenSpaceCameraController.enableRotate = true;
        var x = pickedFeature.content._model._rtcCenter3D.x;
        var y = pickedFeature.content._model._rtcCenter3D.y;
        var z = pickedFeature.content._model._rtcCenter3D.z;
        pickedCenter = Cesium.Cartesian3.fromElements(x, y, z);

        // Position tileset
        var cartographic = Cesium.Cartographic.fromCartesian(pickedCenter);
        var height = cartographic.height + heightOffset;
        pickedCenter = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
        //viewer.camera.viewBoundingSphere(new Cesium.BoundingSphere(pickedCenter));
        viewer.camera.lookAt(pickedCenter);   

    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    handler.setInputAction(function(position) {
        //scene.screenSpaceCameraController.enableRotate = false;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }, Cesium.ScreenSpaceEventType.LEFT_UP);

    handler.setInputAction(function(movement) {

        var cartesian = scene.pickPosition(movement.position);
            
        if (scene.pickPositionSupported && Cesium.defined(cartesian)) {

            var heading = viewer.camera.heading;
            var pitch = viewer.camera.pitch;
            var range = 10;

            var hpr = new Cesium.HeadingPitchRange(heading, pitch, range)

            viewer.camera.flyToBoundingSphere(
                new Cesium.BoundingSphere(cartesian,1),
                {offset : hpr}
            );
        }

    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    

    //-----Scroll Mouse
    handler.setInputAction(function(value) {
        if(value == 100)
            viewer.camera.zoomIn(2);
        else if(value == -100)
            viewer.camera.zoomOut(2); 
        else if(value > 0 || value < 0)   
            viewer.camera.zoomIn(value);
    }, Cesium.ScreenSpaceEventType.WHEEL); 


    var Cartesian2 = Cesium.Cartesian2;
    var Cartesian3 = Cesium.Cartesian3;
    var Cartesian4 = Cesium.Cartesian4;
    var pan3DP0 = Cartesian4.clone(Cartesian4.UNIT_W);
    var pan3DP1 = Cartesian4.clone(Cartesian4.UNIT_W);
    var pan3DTemp0 = new Cesium.Cartesian3();
    var pan3DTemp1 = new Cesium.Cartesian3();
    var pan3DTemp2 = new Cesium.Cartesian3();
    var pan3DTemp3 = new Cesium.Cartesian3();
    var pan3DStartMousePosition = new Cesium.Cartesian2();
    var pan3DEndMousePosition = new Cesium.Cartesian2();

    function pan3D(startPosition, movement, ellipsoid) {
        var scene = viewer.scene;
        var camera = viewer.camera;

        var startMousePosition = Cartesian2.clone(movement.startPosition, pan3DStartMousePosition);
        var endMousePosition = Cartesian2.clone(movement.endPosition, pan3DEndMousePosition);

        var p0 = camera.pickEllipsoid(startMousePosition,ellipsoid,pan3DP0);
        var p1 = camera.pickEllipsoid(endMousePosition,ellipsoid,pan3DP1);

        if (!defined(p0) || !defined(p1)) {
            return;
        }

        p0 = camera.worldToCameraCoordinates(p0, p0);
        p1 = camera.worldToCameraCoordinates(p1, p1);

        var Math = Cesium.Math;
     
        
            var basis0 = camera.constrainedAxis;
            var basis1 = Cartesian3.mostOrthogonalAxis(basis0, pan3DTemp0);
            Cartesian3.cross(basis1, basis0, basis1);
            Cartesian3.normalize(basis1, basis1);
            var basis2 = Cartesian3.cross(basis0, basis1, pan3DTemp1);

            var startRho = Cartesian3.magnitude(p0);
            var startDot = Cartesian3.dot(basis0, p0);
            var startTheta = Math.acosClamped(startDot / startRho);
            var startRej = Cartesian3.multiplyByScalar(basis0, startDot, pan3DTemp2);
            Cartesian3.subtract(p0, startRej, startRej);
            Cartesian3.normalize(startRej, startRej);

            var endRho = Cartesian3.magnitude(p1);
            var endDot = Cartesian3.dot(basis0, p1);
            var endTheta = Math.acosClamped(endDot / endRho);
            var endRej = Cartesian3.multiplyByScalar(basis0, endDot, pan3DTemp3);
            Cartesian3.subtract(p1, endRej, endRej);
            Cartesian3.normalize(endRej, endRej);

            var startPhi = Math.acosClamped(Cartesian3.dot(startRej, basis1));
            if (Cartesian3.dot(startRej, basis2) < 0) {
                startPhi = Math.TWO_PI - startPhi;
            }

            var endPhi = Math.acosClamped(Cartesian3.dot(endRej, basis1));
            if (Cartesian3.dot(endRej, basis2) < 0) {
                endPhi = Math.TWO_PI - endPhi;
            }

            var deltaPhi = startPhi - endPhi;

            var east;
            if (Cartesian3.equalsEpsilon(basis0, camera.position, Math.EPSILON2)) {
                east = camera.right;
            } else {
                east = Cartesian3.cross(basis0, camera.position, pan3DTemp0);
            }

            var planeNormal = Cartesian3.cross(basis0, east, pan3DTemp0);
            var side0 = Cartesian3.dot(planeNormal, Cartesian3.subtract(p0, basis0, pan3DTemp1));
            var side1 = Cartesian3.dot(planeNormal, Cartesian3.subtract(p1, basis0, pan3DTemp1));

            var deltaTheta;
            if (side0 > 0 && side1 > 0) {
                deltaTheta = endTheta - startTheta;
            } else if (side0 > 0 && side1 <= 0) {
                if (Cartesian3.dot(camera.position, basis0) > 0) {
                    deltaTheta = -startTheta - endTheta;
                } else {
                    deltaTheta = startTheta + endTheta;
                }
            } else {
                deltaTheta = startTheta - endTheta;
            }

            camera.moveRight(Cesium.Math.toDegrees(deltaPhi)*100);
            camera.moveDown(Cesium.Math.toDegrees(deltaTheta)*100);
        
    }

    function defined(value) {
        if(value == undefined) {
            console.log(value);
            return false;
        }
        else
            return true;
    }


}
