function handleMouse(viewer) {

    var scene = viewer.scene;
    var canvas = viewer.canvas;
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function() {
        canvas.focus();
    };
    var ellipsoid = viewer.scene.globe.ellipsoid;
    // disable the default event handlers
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

    var startMousePosition;
    var endMousePosition;
    var pan = false;
    var pickedCenter;
    var cameraPickDistance;
    var handler = new Cesium.ScreenSpaceEventHandler(canvas);

    handler.setInputAction(function(movement) {
     
        if (pan) {
            
            startMousePosition = movement.startPosition;
            endMousePosition = movement.endPosition;
            var camera = viewer.camera;
            //var width = canvas.clientWidth;
            //var height = canvas.clientHeight;
        
            // Coordinate (0.0, 0.0) will be where the mouse was clicked.
            var x = (endMousePosition.x - startMousePosition.x)// / width;
            var y = -(endMousePosition.y - startMousePosition.y)// / height;
  
            var moveFactor = cameraPickDistance/1000;
            
            camera.moveRight(x * moveFactor * -1);
            camera.moveUp(y * moveFactor * -1);
        }

        var cartesian = viewer.camera.pickEllipsoid(movement.endPosition, scene.globe.ellipsoid);
        if (cartesian) {
            var cartographic = scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            cursorLon = Cesium.Math.toDegrees(cartographic.longitude);
            cursorLat = Cesium.Math.toDegrees(cartographic.latitude);
            $('#LatLon').html(cursorLon.toFixed(2) + ',' + cursorLat.toFixed(2));
            //$('#LatLon').html(cursorLon + ',' + cursorLat);
        } 

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);


    //-----Right Mouse
    handler.setInputAction(function(click) {
        var cartesian = scene.pickPosition(click.position);
        
        if (scene.pickPositionSupported && Cesium.defined(cartesian)) {

            //var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            
            var cameraPos = viewer.camera.position; 
            cameraPickDistance = Cesium.Cartesian3.distance(cameraPos, cartesian);
            pan = true;
            
        }

    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    handler.setInputAction(function(click) {
        pan = false;
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);




    //-----Left Mouse
    handler.setInputAction(function(movement) {
        
        // Pick a new feature
        var pickedFeature = viewer.scene.pick(movement.position);
        if (!Cesium.defined(pickedFeature) || typeof(pickedFeature.content) == 'undefined') {
            return;
        }
        scene.screenSpaceCameraController.enableRotate = true;
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
        scene.screenSpaceCameraController.enableRotate = false;
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
   /* handler.setInputAction(function(value) {
        if(value >= 100)
            viewer.camera.zoomIn(2);
        else if(value <= -100)
            viewer.camera.zoomOut(2); 
        else if(value > 0 || value < 0)   
            viewer.camera.zoomIn(value);
    }, Cesium.ScreenSpaceEventType.WHEEL); */

    zoom(viewer);

}
