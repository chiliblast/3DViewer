function zoom(viewer){

    var canvas=viewer.canvas;
    var scene=viewer.scene;
    var ellipsoid=scene.globe.ellipsoid;
    var camera=scene.camera;
    var minCameraHeight=50;
    var maxCameraHeight=2*camera.positionCartographic.height;
    ownZoom(viewer);

    function getPick(winCoord) {
        var result = null;
        if (scene.mode == Cesium.SceneMode.SCENE3D) {
            var pickRay = null;
            pickRay = camera.getPickRay(winCoord);
            result = scene.globe.pick(pickRay, scene);
            if (result == undefined && result == null) {
                result = scene.camera.pickEllipsoid(winCoord);
            }
        } else {
            result = scene.camera.pickEllipsoid(winCoord);
        }
        return result;
    }

    function ownZoom(widget) {
        var scene=widget.scene;
        scene.screenSpaceCameraController.enableZoom = false;
    
        function zoom(newCameraHeight,x,y) {
            if (newCameraHeight < minCameraHeight) {
                    newCameraHeight = minCameraHeight;
            } else if (newCameraHeight > maxCameraHeight) {
                    newCameraHeight = maxCameraHeight;
            }
            var cameraHeight=camera.positionCartographic.height;
            if (newCameraHeight !== cameraHeight) {
                var cx =canvas.width / 2;
                var cy = canvas.height / 2;
                var dx = cx - x;
                var dy = cy - y;
                var cartPick = null;
                if (newCameraHeight < cameraHeight) {
                        cartPick = getPick(new Cesium.Cartesian2(x + dx / 2, y + dy / 2));
                } else if (newCameraHeight > cameraHeight) {
                        cartPick = getPick(new Cesium.Cartesian2(x + dx * 2, y + dy * 2));
                }

                if (cartPick) {
                        var geoPick = ellipsoid.cartesianToCartographic(cartPick);
                        if (geoPick !== undefined && geoPick !== null) {
                                var cameraRadX = geoPick.longitude;
                                var cameraRadY = geoPick.latitude;
                                cameraHeight = newCameraHeight;
                                if(scene.mode == Cesium.SceneMode.SCENE2D){
                                    //camera.setPositionCartographic(new Cesium.Cartographic(cameraRadX, cameraRadY, 2*cameraHeight));
                                    var cameraCartographic = Cesium.Cartographic.fromRadians(cameraRadX, cameraRadY, 2*cameraHeight);
                                    camera.position = new Cesium.Cartographic.toCartesian(cameraCartographic);
                                }else{
                                    //camera.setPositionCartographic(new Cesium.Cartographic(cameraRadX, cameraRadY, cameraHeight));
                                    var cameraCartographic = Cesium.Cartographic.fromRadians(cameraRadX, cameraRadY, cameraHeight);
                                    camera.position = new Cesium.Cartographic.toCartesian(cameraCartographic);
                                }
                        }else{
                            console.log("Error");
                        }
                }
            }
            
        }
        var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        var mousePosition=null;
        //mose move
        handler.setInputAction(function(e){
            mousePosition=e.endPosition;
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //wheel
        handler.setInputAction(function(delta){
            var newHeight = 0;
            if (delta > 0) {
                    newHeight =0.5 * camera.positionCartographic.height;
            } else {
                    newHeight = 2 * camera.positionCartographic.height;
            }
            zoom(newHeight, mousePosition.x, mousePosition.y);
        },Cesium.ScreenSpaceEventType.WHEEL);
        
    };

}