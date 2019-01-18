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

    /*var layers = viewer.imageryLayers;
    var baseLayer = layers.get(0);
    layers.remove(baseLayer);
    layers.addImageryProvider(new Cesium.ArcGisMapServerImageryProvider({
        url : '//server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    }));*/

    $("#page_dashboard_3D #jobName").html(ProductionName);
    $("#page_dashboard_3D").show();

    // Add tileset. Do not forget to reduce the default screen space error to 1
    var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        url: "Productions/" + ProductionName + SceneURL,
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
    var url = "Productions/"+ProductionName+DataURL+"?"+Math.random();
    url = url.replace(/\s/g, '');
    $.get( url, function( xml ) {
        $(xml).find("Photogroup").each(function () {

            //console.log($(this).find("Name").text())

            $(xml).find("Photo").each(function () {
                
                var imageId = $(this).find("Id").text();
                var imagePath = "Productions/"+ProductionName+"/"+$(this).find("ImagePath").text();

                /*var cameraLon = $(this).find("ExifData").find("GPS").find("Latitude").text();
                var cameraLat = $(this).find("ExifData").find("GPS").find("Longitude").text();
                var cameraAlt = $(this).find("ExifData").find("GPS").find("Altitude").text();
                var cameraAlt = parseFloat(cameraAlt) + parseFloat(heightOffset);
                var position = Cesium.Cartesian3.fromDegrees(parseFloat(cameraLat), parseFloat(cameraLon), cameraAlt);
                */

                
                var x = $(this).find("Pose").find("Metadata").find("Center").find("x").text();
                var y = $(this).find("Pose").find("Metadata").find("Center").find("y").text();
                var z = $(this).find("Pose").find("Metadata").find("Center").find("z").text();
                var cameraAlt = parseFloat(z) + parseFloat(heightOffset);
                var position = Cesium.Cartesian3.fromDegrees(parseFloat(x),parseFloat(y),cameraAlt);
        
                var cameraYawPitchRoll = $(this).find("ExifData").find("YawPitchRoll").text();
                var cameraYaw = cameraYawPitchRoll.split(' ')[0];
                var cameraPitch = cameraYawPitchRoll.split(' ')[1];
                var cameraRoll = cameraYawPitchRoll.split(' ')[2];
               /*
                var M_00 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_00").text();
                var M_01 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_01").text();
                var M_02 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_02").text();
                var M_10 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_10").text();
                var M_11 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_11").text();
                var M_12 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_12").text();
                var M_20 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_20").text();
                var M_21 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_21").text();
                var M_22 = $(this).find("Pose").find("Metadata").find("Rotation").find("M_22").text();

                var matrix3 = new Cesium.Matrix3(parseFloat(M_00), parseFloat(M_01), parseFloat(M_02), parseFloat(M_10), parseFloat(M_11), parseFloat(M_12), parseFloat(M_20), parseFloat(M_21), parseFloat(M_22));
                var matrix4 = Cesium.Matrix4.fromRotationTranslation(matrix3);
                var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(matrix4);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
          */
                
                var heading = Cesium.Math.toRadians(parseFloat(cameraYaw));
                var pitch = Cesium.Math.toRadians(parseFloat(cameraRoll));
                var roll = Cesium.Math.toRadians(parseFloat(cameraPitch-270));
                var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
                var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
                
                //var url = 'models/marker.gltf';
                var url = 'models/camera.gltf';
                var entity  = viewer.entities.add({
                    position: position,
                    orientation : orientation,
                    name : 'Photo ID ' + imageId,
                    description : '<img id="'+imagePath+'" class="thumbnail" src="'+imagePath+'" width="150" height="120">',
                    
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


var ProductionName;
var DataURL;
var SceneURL;

function load2DScene(viewer) {

    $.getJSON( "Productions/config.json?"+Math.random(), function( json ) {

        $.each( json.Productions, function(i) {
            var p = json.Productions[i];
    
            $.get("Productions/"+p.Name+p.Data+"?"+Math.random(), function( xml ) {
       
                    var nameXML = $(xml).find("Block").find("Name").first().text();
                    var x = $(xml).find("Pose").find("Metadata").find("Center").find("x").first().text();
                    var y = $(xml).find("Pose").find("Metadata").find("Center").find("y").first().text();
                    var position = new Cesium.Cartesian3.fromDegrees(parseFloat(x), parseFloat(y), 0);

                    var id = p.Name + ", " + p.Data + "," + p.Scene;
                    
                    insertTableRow($("#productions"), [p.Name, nameXML], id, i);

                    var point = viewer.entities.add({
                        id : id,
                        name : p.Name,// + ", " + nameXML,
                        position : position,
                        billboard : {
                            image : '/static/img/location.png',
                            scale : 0.2,
                            scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5)                            
                        },
                        description : "<button class='load3DViewButton'>Load 3D View</button>"
                    });  
                    
                    if(i == 0) {
                        viewer.zoomTo(point, new Cesium.HeadingPitchRange(0, -Cesium.Math.PI_OVER_FOUR, 8000));
                    }
             
            });

        });

        viewer.infoBox.frame.contentDocument.body.addEventListener('click', function(e) { 
            if (e.target && e.target.className === 'load3DViewButton') {

                ProductionName = viewer.selectedEntity.id.split(',')[0];
                DataURL = viewer.selectedEntity.id.split(',')[1];
                SceneURL = viewer.selectedEntity.id.split(',')[2]; 

                $('#page_dashboard_2D').hide();    
                viewer.entities.removeAll();
                viewer.scene.morphTo3D(0);
                handleMouse(viewer);
                load3DScene(viewer);

            }
        }, false);   

    });

}


function insertTableRow(table, rowData, id, index) {
  var newRow = $('<tr/>').insertAfter( table.find('tr').eq(index) );
  $(rowData).each(function(colIndex) {  
      newRow.append($('<td/>').text(this));
  });
  newRow.append($('<td id=row'+index+' style="display:none"/>').text(id));
  newRow.append($('<td/>').html('<button id=load3DViewTableButton'+index+' type="button" class="btn btn-primary">Open</button>'));
    
  $("#load3DViewTableButton"+index).click(function(){
    var rowID = this.id[this.id.length -1]
    rowID = $("#row"+rowID).html(); 
    ProductionName = rowID.split(',')[0];
    DataURL = rowID.split(',')[1];
    SceneURL = rowID.split(',')[2]; 

    $('#page_dashboard_2D').hide();
    viewer.entities.removeAll();
    viewer.scene.morphTo3D(0);
    handleMouse(viewer);
    load3DScene(viewer);
  })
}