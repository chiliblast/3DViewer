var viewer;
function startup(Cesium) {

    // Construct the default list of terrain sources.
    var terrainModels = Cesium.createDefaultTerrainProviderViewModels();

	viewer = new Cesium.Viewer(cesiumContainer, {
        imageryProvider : new Cesium.createTileMapServiceImageryProvider({
            url : '/static/Cesium-1.50/Assets/Textures/NaturalEarthII',
            usePreCachedTilesIfAvailable : false
        }),
        /*imageryProvider : new Cesium.ArcGisMapServerImageryProvider({
            url : '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer'
        }),*/
        sceneMode : Cesium.SceneMode.SCENE2D,
        sceneModePicker : false,
        baseLayerPicker : true,
        geocoder : false,
        timeline : false,
        animation : false,
        fullscreenButton : true,
        navigationHelpButton : false,
        homeButton : true,
        /*terrainProvider: Cesium.createWorldTerrain(),
        terrainProviderViewModels: terrainModels,
	    selectedTerrainProviderViewModel: terrainModels[1] */ // Select STK high-res terrain
    });

    // CAUTION: Only disable iframe sandbox if the descriptions come from a trusted source.
    viewer.infoBox.frame.setAttribute('sandbox', 'allow-same-origin allow-popups allow-forms allow-scripts allow-top-navigation');

    // No depth testing against the terrain to avoid z-fighting
    viewer.scene.globe.depthTestAgainstTerrain = true;

    viewer.scene.frameState.creditDisplay.destroy();
    // Add credit to Bentley
    //viewer.scene.frameState.creditDisplay.addDefaultCredit(new Cesium.Credit('Cesium 3D Tiles produced by Bentley ContextCapture', 'img/logoBentley.png', 'http://www.bentley.com/'));

    //Enable lighting based on sun/moon positions
    viewer.scene.globe.enableLighting = true;

    load2DScene(viewer);

    //handleMouse(viewer);
   // load3DScene(viewer);
    
}