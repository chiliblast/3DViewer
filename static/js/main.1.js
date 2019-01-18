// Functions to adapt screen space error and memory use to the device
var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

var heightOffset = -26;
function load3DScene(viewer) {

    // Add tileset. Do not forget to reduce the default screen space error to 1
    var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: 'Scene/Production_2.json',
        maximumScreenSpaceError : isMobile.any() ? 8 : 1, // Temporary workaround for low memory mobile devices - Increase maximum error to 8.
        maximumNumberOfLoadedTiles : isMobile.any() ? 10 : 1000 // Temporary workaround for low memory mobile devices - Decrease (disable) tile cache.
    }));

    //Adjust height of 3D Tile Set
    
    tileset.readyPromise.then(function(tileset) {
        // Position tileset
        var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
        var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
        var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        //getGroundAltitude(viewer, cartographic)

        
        //handleMouseClick(viewer, heightOffset)
        setView(viewer, tileset.boundingSphere);
        
        //drawCamera(viewer, cartographic);
    });
    
}



function setView(viewer, boundingSphere) {

    // Bounding sphere
    //var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(-99.37449371, 19.27093432, 3178.300031), 43.58356558);

    // Override behavior of home button
    viewer.homeButton.viewModel.command.beforeExecute.addEventListener(function(commandInfo) {
        // Fly to custom position
        viewer.camera.flyToBoundingSphere(boundingSphere);

        // Tell the home button not to do anything
        commandInfo.cancel = true;
    });

    // Set custom initial position
    viewer.camera.flyToBoundingSphere(boundingSphere, {duration: 0});
    //viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0, -1.0, 0));
    //viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

}

function drawCameras(viewer, heightOffset) {
    
    $.get( "data/test.xml?Math.random()", function( xml ) {
        $(xml).find("Photogroup").each(function () {

            //console.log($(this).find("Name").text())

            $(xml).find("Photo").each(function () {
                
                var imageId = $(this).find("Id").text();
                var imagePath = $(this).find("ImagePath").text();

                var cameraLon = $(this).find("ExifData").find("GPS").find("Latitude").text();
                var cameraLat = $(this).find("ExifData").find("GPS").find("Longitude").text();
                var cameraAlt = $(this).find("ExifData").find("GPS").find("Altitude").text();
                var cameraAlt = parseFloat(cameraAlt) + parseFloat(heightOffset);
        
                var cameraYawPitchRoll = $(this).find("ExifData").find("YawPitchRoll").text();
                var cameraYaw = cameraYawPitchRoll.split(' ')[0];
                var cameraPitch = cameraYawPitchRoll.split(' ')[1];
                var cameraRoll = cameraYawPitchRoll.split(' ')[2];
                
                //console.log($(this).find("ExifData").find("GPS").find("Latitude").text())

                var position = Cesium.Cartesian3.fromDegrees(parseFloat(cameraLat), parseFloat(cameraLon), cameraAlt);
                var heading = Cesium.Math.toRadians(parseFloat(cameraYaw));
                var pitch = Cesium.Math.toRadians(parseFloat(cameraPitch));
                var roll = Cesium.Math.toRadians(parseFloat(cameraRoll+90));
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
                
                //var url = 'models/marker.gltf';
                var url = 'models/camera.gltf';

                var entity  = viewer.entities.add({
                    position: position,
                    orientation : orientation,
                    name : 'Photo ID ' + imageId,
                    description : '<img id="'+imagePath+'" class="thumbnail" src="'+imagePath+'" width="150" height="120">',
                    
                    /*box : {
                        dimensions : new Cesium.Cartesian3(0.5, 0.5, 1),
                        material : Cesium.Color.BLUE.withAlpha(0.04)
                    },cylinder : {
                        length: 0.7,
                        topRadius: 0,
                        bottomRadius: 0.6,
                        material : Cesium.Color.BLUE.withAlpha(0.04)
                    },*/
                    model : {
                        uri : url,
                        scale : 0.6
                    }
                });
                
                viewer.infoBox.frame.contentDocument.body.addEventListener('click', function(e) { 
                    //
                    // The document body will be rewritten when the selectedEntity changes,
                    // but this body listener will survive.  Now it must determine if it was
                    // one of the clickable buttons.
                    //
                    if (e.target && e.target.className === 'thumbnail') {
                        $("#imageModal div img").attr("src",e.target.id);
                        $("#imageModal").show();
                        $("#zoomResult").show();
                        imageZoom("zoomImage", "zoomResult");
                    }
                }, false);

            
            });
        
        });

        

    });

}

/*function drawCamera(viewer, cartographic) {

    var position = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
    var heading = Cesium.Math.toRadians(0);
    var pitch = Cesium.Math.toRadians(-90);
    var roll = Cesium.Math.toRadians(0);
    var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
    
    var url = 'models/marker.gltf';

    var entity  = viewer.entities.add({
        position: position,
        orientation : orientation,
        name : 'Camera1',
        cylinder : {
            length: 1,
            topRadius: 0.5,
            bottomRadius: 1.5,
            material : Cesium.Color.BLUE.withAlpha(0.3)
        },
        model : {
            uri : url
        }
    });


}*/

function getGroundAltitude(viewer, cartographic) {
    // Get a reference to the ellipsoid, with terrain on it.  (This API may change soon)
    //var ellipsoid = viewer.scene.globe.ellipsoid;

    // Specify our point of interest.
    //var pointOfInterest = Cesium.Cartographic.fromRadians(
       // -1.7344121076640773, 0.3363412538555782, 5000, new Cesium.Cartographic());
    var pointOfInterest = cartographic;
    // [OPTIONAL] Fly the camera there, to see if we got the right point.
    /*viewer.camera.flyTo({
        destination: ellipsoid.cartographicToCartesian(pointOfInterest,
            new Cesium.Cartesian3())
    });*/

    // Sample the terrain (async) and write the answer to the console.
    Cesium.sampleTerrain(viewer.terrainProvider, 9, [ pointOfInterest ])
    .then(function(samples) {
        //console.log('Height in meters is: ' + samples[0].height);
        return samples[0].height;
    });
}