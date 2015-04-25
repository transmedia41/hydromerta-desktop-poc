var app = angular.module("HydromertaDesktop", ["leaflet-directive","geolocation"]);
var mapboxMapId =  "hydromerta.lpkj6fe5";
var mapboxAccessToken = "pk.eyJ1IjoiaHlkcm9tZXJ0YSIsImEiOiJZTUlDdVA0In0.Z7qJF3weLg5WuPpzt6fMdA"
var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
    mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken;
init();
var sectors = JSON.parse(localStorage.getItem('sectors'));
app.controller("MapController", function ($scope, leafletData,geolocation) {
	
	angular.extend($scope, {
	    defaults: {
	    	 maxZoom: 18,
	    	 minZoom: 14,
	        tileLayer: mapboxTileLayer
	    },
	    maxbounds : {
			    southWest: {
			        lat:46.749859206774524,
			        lng: 6.559438705444336
			    },
			    northEast: {
			       lat:46.8027621127906,
			       lng: 6.731100082397461
			    }
			},
	    mapCenter: {
	            lat: 46.78,
	            lng: 6.65,
	            zoom: 15
	          },
	   
	    markers :{
	    },
	    paths:{	    
	    },
	    layers: {
            baselayers: {
                xyz: {
                    name: 'OpenStreetMap (XYZ)',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                }
            },
            overlays: {
                markers:{
                	type: 'group',
				    name: 'Markers',
				    visible: false
                },
                circles:{
                	type: 'group',
				    name: 'Circles',
				    visible: false
                },
                sectors:{
                	type: 'group',
				    name: 'Sectors',
				    visible: true
                },
                yverdon :{
                	type: 'group',
				    name: 'Yverdon',
				    visible: false
                }
            }
        },
		addSectorLabels: function(sectors){
			leafletData.getMap("map").then(function(map){
				leafletData.getPaths().then(function(paths){
					for (var i = sectors.length - 1; i >= 0; i--) {
						var title = sectors[i].properties.nomsquart;
						var sector = paths["sector"+i];
				 		
						//console.log(sector)
						//console.log(center)
						var labelLocation = new L.LatLng(51.329219337279405, 10.454119349999928);
					};
					var labelTitle = new L.LabelOverlay(labelLocation, '<b>'+title+'</b>');
					map.addLayer(labelTitle);
				})
				
			});	
		},
   		addSectorMarkersToMap: function(sectors){
			var sectorPoints = [];
			var indexPoint= 0;
			for (var i = sectors.length - 1; i >= 0; i--) {
				indexPoint = indexPoint+ sectors[i].properties.actionsPoint.length;
			};

			for (var i = sectors.length - 1; i >= 0; i--) {
				if (sectors[i].properties.actionsPoint) {


				for (var j = sectors[i].properties.actionsPoint.length - 1; j >= 0; j--) {
					var marker = {};

					var point = sectors[i].properties.actionsPoint[j];
					var lng = point.geometry.coordinates[0];
					var lat = point.geometry.coordinates[1];
					marker.layer = 'markers';
					marker.lat = lat;
					marker.lng = lng;
					marker.name = point.properties.type;

					if (point.properties.type=="Player") {
						marker.icon = playerIcon;
					}else{
						marker.icon = markerIcon
					}if (point.properties.type.toUpperCase() == "FONTAINE") {
						marker.icon = fontaineIcon
					};
					if (point.properties.type.toUpperCase()== "ARROSAGE") {
						marker.icon = arrosageIcon
					};
					if (point.properties.type.toUpperCase()  == "WC PUBLIC") {
						marker.icon = wcIcon
					};
					if (point.properties.type.toUpperCase() == "AFFICHE") {
						marker.icon = afficheIcon
					};
					var text = "cercle "+indexPoint+ " //"+ point.properties.type + " appartient à "+ sectors[i].properties.nomsquart + " radius "+ point.properties.actionRadius
					marker.message = text;
					sectorPoints.push(marker)
					indexPoint--;
				};
				
			};
			};

			return sectorPoints;
		},
   		addPointRadiusToMap: function(sectors){
   			var shapess = []
   			var shapes = {};
   			var circles = {};
   			var polygons = {}
  			//get total number of points to draw the circles
  			var totalCircles= 0;
  			for (var i = sectors.length - 1; i >= 0; i--) {
  				totalCircles = totalCircles+ sectors[i].properties.actionsPoint.length;
  			};
  			//set the sectors
  			//message label?
  			//geojson same?? style individuel??
  			//label a part??
  			//colors change 
  			for (var i = sectors.length - 1; i >= 0; i--) {
  				var influence = sectors[i].properties.influence;
     				var sector = {};
     				var latlngs = [];
     				sector.latlngs = [];

     				sector.type = "polygon";
     				sector.layer = 'sectors';
     				sector.focus = true;
     				sector.clickable = true;
     				sector.weight = 3;	
     				sector.actionsPolygon = sectors[i].properties.actionsPolygon
     				sector.actionPoints = sectors[i].properties.actionsPoint
     				sector.message = "<h3>Influence : "+sectors[i].properties.influence+"%</h3><p>Boss: "
     					+sectors[i].properties.character.name+"</p>";
     				sector.color = $scope.sectorColor(influence);	

     				latlngs = sectors[i].geometry.coordinates[0]
     				//set all the coordinates
     				for (var x = latlngs.length - 1; x>= 0; x--) {
     					sector.latlngs[x] = {
     						lat: latlngs[x][1], lng: latlngs[x][0]
  	   				}
     				};
     				shapes["sector"+i] = sector;
  	   			//set the circle radius
  				for (var j = sectors[i].properties.actionsPoint.length - 1; j >= 0; j--) {
  					var circle = {};
  					var point = sectors[i].properties.actionsPoint[j];
  					var lng = point.geometry.coordinates[0];
  					var lat = point.geometry.coordinates[1];

  					circle = {
  						type : "circle",
  						layer : 'circles',
  						dashArray : "7,10",
  						clickable : false,
  						radius : point.properties.actionRadius,
  						latlngs : {
  									lat: lat,
  									lng: lng
  								  },
  						color : 'green',
  						weight : 2
  					}
  					shapes["circle"+totalCircles] = circle;
  		
  					totalCircles--;
  				};
  			};

  			return shapes;
   		},
   		isMarkerInCircles:function(marker, sectors, circles){
   			var isIn = [];
   			var totalCircles = 0;
  			var isInCircle = false;
  			//total circles
  			for (var i = sectors.length - 1; i >= 0; i--) {
  				totalCircles = totalCircles+ sectors[i].properties.actionsPoint.length;
  			};
  			// check what circles is the marker in
  			for (var i = 1; i < totalCircles; i++) {
  				isInCircle = geolib.isPointInCircle(
  					{latitude: marker.lat, longitude: marker.lng},
  					{latitude: circles["circle"+i].latlngs.lat, longitude:circles["circle"+i].latlngs.lng},
  					circles["circle"+i].radius
  				);
  				if (isInCircle) {
  					isIn.push(i);
  				}				
  			};
  			return isIn;
   		},
   		sectorColor:function(influence){
   			if (influence <=20) {
   					return "orange";
   					   					
   				}else if(influence>20  && influence<=40){
   					return "green"
   				}
   				else if(influence >= 41 && influence <=60){
   					return  "red"
   				}
   				else if(influence>60 && influence<=80){
   					return  "black"
   				}
   				else if(influence >80){
   					return "blue"
   				}	
   		},
   		changeMarkerColor: function(color){
     		if(color == 'green'){
  				return 'red';
  			}if(color=="red"){
  				return 'orange'
  			}if (color=="orange") {
  				return "green";
  			};
   		},
   		setPlayerPosition:function(){
   			geolocation.getLocation().then(function(data){
		      $scope.coords = {lat:data.coords.latitude, long:data.coords.longitude};
	   					var player  = {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"actionRadius":1,"type":"Player"}}
	   					player.lat = $scope.coords.lat;
	   				    player.lng = $scope.coords.long;
	   				    player.icon = playerIcon;
	   				    $scope.markers.push(player);
		    });   			
   		},
   		getPlayer:function(){
   			for (var i = $scope.markers.length - 1; i >= 0; i--) {
	   				if ($scope.markers[i].name == "Player"){
	   					return $scope.markers[i]
	   				}
   				};
   		},
   		getSectorActions:function(name){
   			console.log($scope.paths[name].actionsPolygon)
   		},
   		isMarkerInSector:function(player,sectors){
   			for (var i = sectors.length - 1; i >= 0; i--) {

   			};
   		},
   		layersVisibility:function(){
   			leafletData.getMap("map").then(function(map){ 
	    		var zoom = map.getZoom();
	    		//whole yverdon
	    		if (zoom == 14) {
	    			$scope.layers.overlays.yverdon.visible = true;
	    			$scope.layers.overlays.sectors.visible = false;
	    		}else{
	    			$scope.layers.overlays.yverdon.visible = false;
	    			$scope.layers.overlays.sectors.visible = true;
	    		};
	    		//markers visibility
	    		if (zoom <= 15) {
	    			$scope.layers.overlays.markers.visible = false;
	    		}else{
	    			$scope.layers.overlays.markers.visible = true;
	    		};
	    		//circles visibility
	    		if (zoom <= 16) {
	    			$scope.layers.overlays.circles.visible = false;
	    		}else{
	    			$scope.layers.overlays.circles.visible = true;
	    		};
	    	})	
   		},
   		addYverdonLayer: function(yverdon){
   			
   			var Yverdon = {};
   			Yverdon.color = "red";
   			Yverdon.type = "polygon";
   			Yverdon.layer = 'yverdon';
   			Yverdon.weight = 3;
   			Yverdon.latlngs = [];
   			var latlngs =yverdon[0];
   			for (var i = latlngs.length - 1; i >= 0; i--) {
   				Yverdon.latlngs[i]= {
   					lat: latlngs[i][1], lng: latlngs[i][0]
   				}
   			};
   			return Yverdon;
   		}

	});


	$scope.markers = $scope.addSectorMarkersToMap(sectors);
	$scope.paths = $scope.addPointRadiusToMap(sectors, $scope);
	$scope.paths["Yverdon"] = $scope.addYverdonLayer(yverdon.features[0].geometry.coordinates[0]);
	$scope.setPlayerPosition();
	$scope.addSectorLabels(sectors);
	////DIRECTIVES////
	
		// MARKER CLICK
		 $scope.$on('leafletDirectiveMarker.click', function(ev, featureSelected, leafletEvent) {
 			var markerIndex = featureSelected.markerName;
 			var player = $scope.markers[markerIndex];
 			var circleIds = $scope.isMarkerInCircles(featureSelected.leafletEvent.latlng, sectors, $scope.paths);
 			var sectorId = $scope.isMarkerInSector($scope.markers[0], sectors);
 			//$scope.getSectorActions(circleIds);
 			console.log(featureSelected.leafletEvent.latlng);
 			console.log(circleIds)
	    });
		//MARKER MOUSEOVER
		$scope.$on('leafletDirectiveMarker.mouseover', function(ev, featureSelected, leafletEvent) {
					featureSelected.leafletEvent.target.openPopup();
		});
		//MARKER MOUSEOUT
		$scope.$on('leafletDirectiveMarker.mouseout', function(ev, featureSelected, leafletEvent) {
					featureSelected.leafletEvent.target.closePopup();
		});
	    //SECTOR CLICK
	    $scope.$on('leafletDirectivePath.mousedown',function(ev, featureSelected, leafletEvent){
	    	var sectorName = featureSelected.pathName;
	    	$scope.getSectorActions(sectorName);
	    })
	    //ON MAP ZOOM
	    $scope.$on("leafletDirectiveMap.zoomend",function(ev, featureSelected, leafletEvent){
	    	$scope.layersVisibility();  	
	    })
	    //PATHS MOUSEMOVE
	    $scope.$on("leafletDirectivePath.mouseover",function(ev,featureSelected,leafletEvent){
			
	    })
	console.log($scope)

})// MAP CONTROLLER


function init(){
	if (!localStorage.getItem("sectors")) {

	var sectors = [{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [
                [
                    [
                        6.631520100336561,
                        46.781168746085825
                    ],
                    [
                        6.631494745196198,
                        46.78117491558585
                    ],
                    [
                        6.625752069214194,
                        46.78564144134963
                    ],
                    [
                        6.62538783164383,
                        46.7862699509805
                    ],
                    [
                        6.62525362076794,
                        46.7865018988663
                    ],
                    [
                        6.62519283534817,
                        46.7865809897011
                    ],
                    [
                        6.62482184828459,
                        46.7869591410271
                    ],
                    [
                        6.62467353139203,
                        46.7871103844309
                    ],
                    [
                        6.62395972502805,
                        46.7878388170252
                    ],
                    [
                        6.62378546340914,
                        46.7880165016117
                    ],
                    [
                        6.62335046293642,
                        46.7884604014384
                    ],
                    [
                        6.62326522228727,
                        46.7884676185776
                    ],
                    [
                        6.6233455395161,
                        46.7885172184202
                    ],
                    [
                        6.62410240582572,
                        46.788942824758
                    ],
                    [
                        6.62459934931466,
                        46.7892265949549
                    ],
                    [
                        6.62490342479048,
                        46.7894029254336
                    ],
                    [
                        6.62499482953454,
                        46.7894559336656
                    ],
                    [
                        6.62549987730217,
                        46.7897643050886
                    ],
                    [
                        6.62560738310757,
                        46.7898299450291
                    ],
                    [
                        6.62569646959256,
                        46.7898843254065
                    ],
                    [
                        6.62614687431488,
                        46.7901592593849
                    ],
                    [
                        6.62700161335935,
                        46.7906725336501
                    ],
                    [
                        6.62793073595102,
                        46.7911964053971
                    ],
                    [
                        6.62806970329408,
                        46.7912747577454
                    ],
                    [
                        6.6280697030066,
                        46.7912747581525
                    ],
                    [
                        6.62806970582222,
                        46.79127475974
                    ],
                    [
                        6.6280240688793,
                        46.791339385773
                    ],
                    [
                        6.62795213379439,
                        46.7914542916062
                    ],
                    [
                        6.62819299676636,
                        46.7915241909475
                    ],
                    [
                        6.62819299886849,
                        46.7915241928172
                    ],
                    [
                        6.62819299945374,
                        46.7915241929871
                    ],
                    [
                        6.62830402441461,
                        46.7916229473289
                    ],
                    [
                        6.62829178800131,
                        46.7916788147764
                    ],
                    [
                        6.62840143452275,
                        46.7917734209063
                    ],
                    [
                        6.62850858433616,
                        46.7918504799474
                    ],
                    [
                        6.62854280080062,
                        46.7918750873034
                    ],
                    [
                        6.6286730667118,
                        46.7919551193768
                    ],
                    [
                        6.62869153004325,
                        46.7919664627017
                    ],
                    [
                        6.62945953364062,
                        46.7923890527477
                    ],
                    [
                        6.62947295479279,
                        46.7923762837741
                    ],
                    [
                        6.6294914827642,
                        46.792346188896
                    ],
                    [
                        6.6294914859067,
                        46.7923461903198
                    ],
                    [
                        6.6295265930777,
                        46.7922849079311
                    ],
                    [
                        6.62954399020371,
                        46.7922429304788
                    ],
                    [
                        6.62955540475707,
                        46.7922242097176
                    ],
                    [
                        6.62945660973497,
                        46.7921655753142
                    ],
                    [
                        6.6295226047822,
                        46.7920535943923
                    ],
                    [
                        6.629586685496,
                        46.7919469971886
                    ],
                    [
                        6.63050173601766,
                        46.7905326672508
                    ],
                    [
                        6.63080371742601,
                        46.790326730886
                    ],
                    [
                        6.63168633003087,
                        46.7889579508009
                    ],
                    [
                        6.63172049918652,
                        46.7888802880709
                    ],
                    [
                        6.63310489666639,
                        46.7867881751044
                    ],
                    [
                        6.6334357358445,
                        46.7862882684241
                    ],
                    [
                        6.63372811407811,
                        46.7858463833607
                    ],
                    [
                        6.63381839064696,
                        46.7857035352761
                    ],
                    [
                        6.63389174364348,
                        46.7855888150554
                    ],
                    [
                        6.63398260670426,
                        46.7854504689401
                    ],
                    [
                        6.63422797384614,
                        46.7850865156137
                    ],
                    [
                        6.63433605595348,
                        46.7849262505277
                    ],
                    [
                        6.63457275845297,
                        46.7845458627347
                    ],
                    [
                        6.63472035842517,
                        46.7843087807268
                    ],
                    [
                        6.63532043110814,
                        46.7837868906667
                    ],
                    [
                        6.63524411893224,
                        46.7837431515024
                    ],
                    [
                        6.63511026223282,
                        46.7836664307749
                    ],
                    [
                        6.6351081861956,
                        46.7836677295203
                    ],
                    [
                        6.63510604609229,
                        46.7836689827908
                    ],
                    [
                        6.63510382860634,
                        46.7836701723734
                    ],
                    [
                        6.63510155823539,
                        46.783671317109
                    ],
                    [
                        6.63509923765585,
                        46.7836723983481
                    ],
                    [
                        6.63509685155107,
                        46.7836734247679
                    ],
                    [
                        6.63509442788613,
                        46.7836743971144
                    ],
                    [
                        6.63509193895006,
                        46.7836752976224
                    ],
                    [
                        6.63508941167097,
                        46.7836761429534
                    ],
                    [
                        6.63508684695468,
                        46.783676925976
                    ],
                    [
                        6.6350842296403,
                        46.7836776449362
                    ],
                    [
                        6.63508158768469,
                        46.7836783011291
                    ],
                    [
                        6.63507890764016,
                        46.7836788851258
                    ],
                    [
                        6.63507620123302,
                        46.783679414579
                    ],
                    [
                        6.63507347125438,
                        46.7836798631532
                    ],
                    [
                        6.63507071490494,
                        46.783680257733
                    ],
                    [
                        6.63506794698075,
                        46.7836805709691
                    ],
                    [
                        6.63506515362433,
                        46.7836808208833
                    ],
                    [
                        6.6350623612023,
                        46.7836810082103
                    ],
                    [
                        6.6350595570662,
                        46.7836811235268
                    ],
                    [
                        6.63505674121606,
                        46.783681166833
                    ],
                    [
                        6.63505392550931,
                        46.7836811469974
                    ],
                    [
                        6.63505112446328,
                        46.783681055337
                    ],
                    [
                        6.63504832449923,
                        46.7836808912074
                    ],
                    [
                        6.63504553838851,
                        46.7836806557965
                    ],
                    [
                        6.63504275322043,
                        46.7836803572494
                    ],
                    [
                        6.63503999536159,
                        46.783679996301
                    ],
                    [
                        6.63503725137251,
                        46.7836795629733
                    ],
                    [
                        6.63503454841903,
                        46.7836790580067
                    ],
                    [
                        6.63503185918776,
                        46.7836784905431
                    ],
                    [
                        6.63502919727398,
                        46.7836778601291
                    ],
                    [
                        6.63502657479735,
                        46.7836771580651
                    ],
                    [
                        6.63502399322519,
                        46.7836763931464
                    ],
                    [
                        6.63502145161891,
                        46.7836755747005
                    ],
                    [
                        6.63501896384426,
                        46.783674684157
                    ],
                    [
                        6.63501651602732,
                        46.7836737406354
                    ],
                    [
                        6.63501412124274,
                        46.7836727250104
                    ],
                    [
                        6.63501176708401,
                        46.7836716651971
                    ],
                    [
                        6.63500949220125,
                        46.7836705422504
                    ],
                    [
                        6.63500725741561,
                        46.7836693569925
                    ],
                    [
                        6.63500510161907,
                        46.7836681278166
                    ],
                    [
                        6.63500299939187,
                        46.7836668441113
                    ],
                    [
                        6.63447017626879,
                        46.7833300604033
                    ],
                    [
                        6.63446781567673,
                        46.7833285233935
                    ],
                    [
                        6.63446553408199,
                        46.7833269419171
                    ],
                    [
                        6.63446333254624,
                        46.7833252984113
                    ],
                    [
                        6.63446121001599,
                        46.7833236098899
                    ],
                    [
                        6.63445916647483,
                        46.7833218774508
                    ],
                    [
                        6.63445720286962,
                        46.7833200912175
                    ],
                    [
                        6.63445534449688,
                        46.7833182700367
                    ],
                    [
                        6.63445355153449,
                        46.7833164042935
                    ],
                    [
                        6.63445186461196,
                        46.7833145030593
                    ],
                    [
                        6.63445026946619,
                        46.7833125579977
                    ],
                    [
                        6.63444875412512,
                        46.7833105679261
                    ],
                    [
                        6.63444734401645,
                        46.783308542907
                    ],
                    [
                        6.63444602542203,
                        46.7833064916287
                    ],
                    [
                        6.63444481286743,
                        46.7833044048595
                    ],
                    [
                        6.63444370447529,
                        46.7833023012545
                    ],
                    [
                        6.63444268933527,
                        46.7833001620685
                    ],
                    [
                        6.63444179115357,
                        46.7832980055878
                    ],
                    [
                        6.63444099874096,
                        46.7832958317336
                    ],
                    [
                        6.63444029850233,
                        46.783293640959
                    ],
                    [
                        6.6344397160212,
                        46.7832914328953
                    ],
                    [
                        6.6342766936782,
                        46.7832548394984
                    ],
                    [
                        6.63437575371258,
                        46.7831547835371
                    ],
                    [
                        6.6345169046484,
                        46.7830160722669
                    ],
                    [
                        6.63456236569785,
                        46.7829710529321
                    ],
                    [
                        6.63462975241821,
                        46.7829046882863
                    ],
                    [
                        6.63466204699146,
                        46.7828731605881
                    ],
                    [
                        6.63477011183799,
                        46.7827663307682
                    ],
                    [
                        6.63483751416465,
                        46.7826988866449
                    ],
                    [
                        6.63484072065998,
                        46.7826955357691
                    ],
                    [
                        6.63484225352927,
                        46.7826937291571
                    ],
                    [
                        6.63484369568081,
                        46.7826918955506
                    ],
                    [
                        6.63484504567193,
                        46.7826900245071
                    ],
                    [
                        6.63484630494531,
                        46.7826881264692
                    ],
                    [
                        6.63484747364856,
                        46.7826861915545
                    ],
                    [
                        6.63484855057252,
                        46.782684247208
                    ],
                    [
                        6.6348495361271,
                        46.7826822659793
                    ],
                    [
                        6.63485041725428,
                        46.7826802658954
                    ],
                    [
                        6.63485120660216,
                        46.7826782563797
                    ],
                    [
                        6.63485190444135,
                        46.7826762193149
                    ],
                    [
                        6.63485249851299,
                        46.7826741727338
                    ],
                    [
                        6.6348530008136,
                        46.7826721161718
                    ],
                    [
                        6.63485339868684,
                        46.7826700407548
                    ],
                    [
                        6.63485369106294,
                        46.7826679645944
                    ],
                    [
                        6.63485384131315,
                        46.7826658248388
                    ],
                    [
                        6.63485389886202,
                        46.7826636838809
                    ],
                    [
                        6.63485383971649,
                        46.7826615426497
                    ],
                    [
                        6.63485368786141,
                        46.7826594007653
                    ],
                    [
                        6.63485341918901,
                        46.7826572668428
                    ],
                    [
                        6.6348530576759,
                        46.7826551410512
                    ],
                    [
                        6.63485259132558,
                        46.782653023855
                    ],
                    [
                        6.63485202094549,
                        46.7826509147108
                    ],
                    [
                        6.63485135758539,
                        46.7826488230306
                    ],
                    [
                        6.63485059006434,
                        46.7826467481867
                    ],
                    [
                        6.63484971676755,
                        46.7826446912656
                    ],
                    [
                        6.63484873930986,
                        46.7826426511808
                    ],
                    [
                        6.63484768232775,
                        46.7826406374398
                    ],
                    [
                        6.63484650745043,
                        46.7826386503214
                    ],
                    [
                        6.63484525304868,
                        46.782636689547
                    ],
                    [
                        6.63484389341633,
                        46.7826347637205
                    ],
                    [
                        6.63484245505879,
                        46.7826328642434
                    ],
                    [
                        6.63484091146242,
                        46.7826310002632
                    ],
                    [
                        6.63483928900151,
                        46.7826291719658
                    ],
                    [
                        6.63483757409754,
                        46.7826273787062
                    ],
                    [
                        6.6348357794068,
                        46.7826256293589
                    ],
                    [
                        6.63483389292465,
                        46.7826239249374
                    ],
                    [
                        6.63483192757798,
                        46.7826222561985
                    ],
                    [
                        6.6348298823134,
                        46.7826206401559
                    ],
                    [
                        6.6348277580449,
                        46.7826190691293
                    ],
                    [
                        6.63482556743705,
                        46.7826175514437
                    ],
                    [
                        6.6348232978417,
                        46.7826160776759
                    ],
                    [
                        6.63482096189057,
                        46.7826146583473
                    ],
                    [
                        6.6348185594771,
                        46.7826133005948
                    ],
                    [
                        6.63481609084726,
                        46.7826119879483
                    ],
                    [
                        6.63481355574685,
                        46.7826107374271
                    ],
                    [
                        6.63432190569908,
                        46.7823851623813
                    ],
                    [
                        6.63420940273909,
                        46.7823332722584
                    ],
                    [
                        6.63392546601587,
                        46.7822033477362
                    ],
                    [
                        6.63353119158024,
                        46.7820257747952
                    ],
                    [
                        6.63338940568208,
                        46.7819618024744
                    ],
                    [
                        6.63303312732947,
                        46.7818006885662
                    ],
                    [
                        6.63268101844624,
                        46.7816411321416
                    ],
                    [
                        6.63267138141755,
                        46.7816367011561
                    ],
                    [
                        6.63254549606424,
                        46.7815788222122
                    ],
                    [
                        6.63222212757116,
                        46.7814328718428
                    ],
                    [
                        6.6319498902346,
                        46.7813093217457
                    ],
                    [
                        6.63173787654368,
                        46.7812130953154
                    ],
                    [
                        6.63171065118038,
                        46.781203456555
                    ],
                    [
                        6.63168238452901,
                        46.7812021771177
                    ],
                    [
                        6.63165450785036,
                        46.7812098063133
                    ],
                    [
                        6.63163256221448,
                        46.7812235951785
                    ],
                    [
                        6.631520100336561,
                        46.781168746085825
                    ]
                ]
            ]
        },
        "properties": {
            "nbActions": "",
            "influence": "10",
            "nomsquart": "Quartier 1",
            "character": "9",
            "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
            "actionsPoint": [
    {
       
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62466223816658,
                46.7887316374555
            ]
        }
    },
    {
        "id": "2",
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62716488943498,
                46.7878528439684
            ]
        }
    },
    {
        "id": "3",
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62756181259108,
                46.7849910162683
            ]
        }
    },
    {
        "id": 4,
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63406877431904,
                46.7824166651184
            ]
        }
    },
    {
        "id": "5",
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63277500086861,
                46.7870396637835
            ]
        }
    },
    {
        "id": "6",
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62880513401515,
                46.7911538031889
            ]
        }
    },
    {
        "id": "7",
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62880579834312,
                46.7911603294832
            ]
        }
    },
    {
        "id": "8",
        "type": "Feature",
        "properties": {
            "type": "arrosage",
            "name": "Régler le débit d'un arrosage communal",
            "description": "Vise à limiter l'utilisation inutile de l'eau potable",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63360087674072,
                46.7843974100742
            ]
        }
    },
    {
        "id": "9",
        "type": "Feature",
        "properties": {
            "type": "arrosage",
            "name": "Régler le débit d'un arrosage communal",
            "description": "Vise à limiter l'utilisation inutile de l'eau potable",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62965168887535,
                46.7869864765238
            ]
        }
    },
    {
        "id": "10",
        "type": "Feature",
        "properties": {
            "type": "arrosage",
            "name": "Régler le débit d'un arrosage communal",
            "description": "Vise à limiter l'utilisation inutile de l'eau potable",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62486798456495,
                46.7891048166476
            ]
        }
    },
    {
        "id": "11",
        "type": "Feature",
        "properties": {
            "type": "hydrant",
            "name": "Protéger l'hydrant",
            "description": "Vise à éviter le sabotage et le vol d'eau",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63407250471329,
                46.7842725449316
            ]
        }
    },
    {
        "id": "12",
        "type": "Feature",
        "properties": {
            "type": "hydrant",
            "name": "Protéger l'hydrant",
            "description": "Vise à éviter le sabotage et le vol d'eau",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62970756479098,
                46.7874078817547
            ]
        }
    },
    {
        "id": "12",
        "type": "Feature",
        "properties": {
            "type": "hydrant",
            "name": "Protéger l'hydrant",
            "description": "Vise à éviter le sabotage et le vol d'eau",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62603534139692,
                46.7893052023602
            ]
        }
    },
    {
        "id": "13",
        "type": "Feature",
        "properties": {
            "type": "hydrant",
            "name": "Protéger l'hydrant",
            "description": "Vise à éviter le sabotage et le vol d'eau",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62511893533227,
                46.7871088526952
            ]
        }
    },
    {
        "id": "14",
        "type": "Feature",
        "properties": {
            "type": "hydrant",
            "name": "Protéger l'hydrant",
            "description": "Vise à éviter le sabotage et le vol d'eau",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63187711818661,
                46.7823953549712
            ]
        }
    },
    {
        "id": "15",
        "type": "Feature",
        "properties": {
            "type": "WC publics",
            "name": "Remplacer les robinets des WC publics par des installations écologiques",
            "description": "Vise à limiter l'utilisation inutile de l'eau potable",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63289162591545,
                46.7850739354067
            ]
        }
    },
    {
       
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62810031473, 46.7892604199
            ]
        }
    },
    {
       
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62848287325, 46.7842051823
            ]
        }
    },
    {
       
        "type": "Feature",
        "properties": {
            "type": "grille",
            "name": "Protéger une bouche d'égoût",
            "description": "Vise à éviter la pollution des égoûts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "",
            "actionRadius": 50
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
               6.62822327997, 46.7873066389
            ]
        }
    },
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.62964791166961,
                            46.7924310519952
                        ],
                        [
                            6.62970406516031,
                            46.7924682416826
                        ],
                        [
                            6.62970406509828,
                            46.7924682417966
                        ],
                        [
                            6.62970406800763,
                            46.7924682437234
                        ],
                        [
                            6.62968318942546,
                            46.7925065979264
                        ],
                        [
                            6.62968222027671,
                            46.7925274611727
                        ],
                        [
                            6.63078731611663,
                            46.7931468326048
                        ],
                        [
                            6.63180190939843,
                            46.7937150873766
                        ],
                        [
                            6.63278993572704,
                            46.794256967193
                        ],
                        [
                            6.63283203407074,
                            46.7942797543097
                        ],
                        [
                            6.63322814515276,
                            46.7944717352613
                        ],
                        [
                            6.63364184761016,
                            46.7946437780523
                        ],
                        [
                            6.63407127793299,
                            46.7947978484541
                        ],
                        [
                            6.63544850366512,
                            46.7952000435345
                        ],
                        [
                            6.6354485031728,
                            46.7952000443845
                        ],
                        [
                            6.63544850642048,
                            46.7952000453329
                        ],
                        [
                            6.63543371748702,
                            46.7952255788332
                        ],
                        [
                            6.63582444641241,
                            46.7953401468961
                        ],
                        [
                            6.63582444587419,
                            46.7953401480483
                        ],
                        [
                            6.63582444897201,
                            46.7953401489566
                        ],
                        [
                            6.63582268987302,
                            46.7953439147061
                        ],
                        [
                            6.63596184653988,
                            46.7953847455836
                        ],
                        [
                            6.63597067436239,
                            46.7953724833399
                        ],
                        [
                            6.6377719088232,
                            46.7959095734237
                        ],
                        [
                            6.63844768682451,
                            46.7959790606587
                        ],
                        [
                            6.63847002451846,
                            46.7959448778461
                        ],
                        [
                            6.63853204273098,
                            46.7958351233879
                        ],
                        [
                            6.6385834780867,
                            46.7957228178497
                        ],
                        [
                            6.63862410599721,
                            46.7956084444962
                        ],
                        [
                            6.63862993361327,
                            46.7955888095647
                        ],
                        [
                            6.63872530300829,
                            46.7955099668336
                        ],
                        [
                            6.63882657013581,
                            46.7954149766947
                        ],
                        [
                            6.63891857623431,
                            46.7953156393859
                        ],
                        [
                            6.63896860280753,
                            46.7952548465428
                        ],
                        [
                            6.63902388210685,
                            46.7951845175191
                        ],
                        [
                            6.63924929181067,
                            46.7950734390655
                        ],
                        [
                            6.6392955392083,
                            46.7950501202867
                        ],
                        [
                            6.63932598474914,
                            46.7950341718159
                        ],
                        [
                            6.63956456432108,
                            46.7949072911868
                        ],
                        [
                            6.63966773196936,
                            46.7948494848665
                        ],
                        [
                            6.63979403536732,
                            46.7947698865765
                        ],
                        [
                            6.63991248760982,
                            46.7946847848003
                        ],
                        [
                            6.64002258281575,
                            46.7945945438955
                        ],
                        [
                            6.64012384590877,
                            46.7944995542418
                        ],
                        [
                            6.64021584804999,
                            46.794400215876
                        ],
                        [
                            6.64023888984539,
                            46.7943728930559
                        ],
                        [
                            6.64045497176632,
                            46.794111427437
                        ],
                        [
                            6.64050122610999,
                            46.7941217780713
                        ],
                        [
                            6.64189719141885,
                            46.7944104080395
                        ],
                        [
                            6.64194864047641,
                            46.7944206521513
                        ],
                        [
                            6.64211518021187,
                            46.794448548985
                        ],
                        [
                            6.6422840190612,
                            46.7944689064713
                        ],
                        [
                            6.64245443633554,
                            46.7944816361132
                        ],
                        [
                            6.64262569965589,
                            46.7944866828294
                        ],
                        [
                            6.64279707772043,
                            46.7944840266906
                        ],
                        [
                            6.64296783559099,
                            46.7944736773963
                        ],
                        [
                            6.64313724420618,
                            46.7944556798315
                        ],
                        [
                            6.64330457241338,
                            46.7944301123637
                        ],
                        [
                            6.64346911102508,
                            46.7943970820693
                        ],
                        [
                            6.64363014954045,
                            46.7943567311596
                        ],
                        [
                            6.64378700015301,
                            46.7943092355007
                        ],
                        [
                            6.64393899072745,
                            46.7942547930337
                        ],
                        [
                            6.64408547411774,
                            46.7941936425076
                        ],
                        [
                            6.64422581730902,
                            46.7941260408915
                        ],
                        [
                            6.64435942193492,
                            46.7940522816363
                        ],
                        [
                            6.64448571652744,
                            46.7939726781479
                        ],
                        [
                            6.64460415960123,
                            46.7938875714954
                        ],
                        [
                            6.64471424290821,
                            46.7937973265896
                        ],
                        [
                            6.64481223163442,
                            46.7937056093885
                        ],
                        [
                            6.64707434950101,
                            46.7914413469799
                        ],
                        [
                            6.64506524971748,
                            46.7902725444933
                        ],
                        [
                            6.64276648575322,
                            46.7889351238954
                        ],
                        [
                            6.64204988693773,
                            46.7885222482336
                        ],
                        [
                            6.64116440255624,
                            46.7880083325767
                        ],
                        [
                            6.64117755380351,
                            46.7879958300179
                        ],
                        [
                            6.64061661619671,
                            46.7876683248155
                        ],
                        [
                            6.63988451476901,
                            46.7872697195016
                        ],
                        [
                            6.63946682289923,
                            46.7870425260896
                        ],
                        [
                            6.63888212071635,
                            46.7867291488889
                        ],
                        [
                            6.63817862064969,
                            46.7863464763209
                        ],
                        [
                            6.63754520399637,
                            46.7859985659303
                        ],
                        [
                            6.63724022060794,
                            46.7857938355589
                        ],
                        [
                            6.63724406211741,
                            46.7857908942892
                        ],
                        [
                            6.63707064232268,
                            46.7856604045718
                        ],
                        [
                            6.63696568564379,
                            46.7855672787792
                        ],
                        [
                            6.63688704213012,
                            46.7854925097563
                        ],
                        [
                            6.6367173104041,
                            46.7852991640301
                        ],
                        [
                            6.6366039912414,
                            46.7851345514947
                        ],
                        [
                            6.6365129322745,
                            46.784970185415
                        ],
                        [
                            6.63646367263789,
                            46.7848483040816
                        ],
                        [
                            6.6364224449467,
                            46.7847147846245
                        ],
                        [
                            6.63639513390189,
                            46.7845877503226
                        ],
                        [
                            6.63637856378743,
                            46.7844693372358
                        ],
                        [
                            6.63637984024203,
                            46.7843134473334
                        ],
                        [
                            6.63639225460105,
                            46.7841834534551
                        ],
                        [
                            6.6364046236214,
                            46.7840477022838
                        ],
                        [
                            6.63642610550605,
                            46.7838980710825
                        ],
                        [
                            6.63644777860769,
                            46.7837619350993
                        ],
                        [
                            6.63647528292872,
                            46.7836387047653
                        ],
                        [
                            6.63650683680161,
                            46.7835074063526
                        ],
                        [
                            6.63654091337967,
                            46.7833737866419
                        ],
                        [
                            6.63651898662163,
                            46.7832808845452
                        ],
                        [
                            6.63661462074085,
                            46.7830940817783
                        ],
                        [
                            6.63668732867661,
                            46.7829517377143
                        ],
                        [
                            6.63668151908224,
                            46.7829461194435
                        ],
                        [
                            6.63652690774205,
                            46.7830217678078
                        ],
                        [
                            6.63637436978796,
                            46.7830549695178
                        ],
                        [
                            6.63611098965389,
                            46.7832233194798
                        ],
                        [
                            6.63557351501017,
                            46.7835667797116
                        ],
                        [
                            6.63532043110814,
                            46.7837868906667
                        ],
                        [
                            6.63472035842517,
                            46.7843087807268
                        ],
                        [
                            6.63457275845297,
                            46.7845458627347
                        ],
                        [
                            6.63433605595348,
                            46.7849262505277
                        ],
                        [
                            6.63422797384614,
                            46.7850865156137
                        ],
                        [
                            6.63398260670426,
                            46.7854504689401
                        ],
                        [
                            6.63389174364348,
                            46.7855888150554
                        ],
                        [
                            6.63381839064696,
                            46.7857035352761
                        ],
                        [
                            6.63372811407811,
                            46.7858463833607
                        ],
                        [
                            6.6334357358445,
                            46.7862882684241
                        ],
                        [
                            6.63310489666639,
                            46.7867881751044
                        ],
                        [
                            6.63172049918652,
                            46.7888802880709
                        ],
                        [
                            6.63168633003087,
                            46.7889579508009
                        ],
                        [
                            6.63080371742601,
                            46.790326730886
                        ],
                        [
                            6.63050173601766,
                            46.7905326672508
                        ],
                        [
                            6.629586685496,
                            46.7919469971886
                        ],
                        [
                            6.6295226047822,
                            46.7920535943923
                        ],
                        [
                            6.62945660973497,
                            46.7921655753142
                        ],
                        [
                            6.62955540475707,
                            46.7922242097176
                        ],
                        [
                            6.62954399020371,
                            46.7922429304788
                        ],
                        [
                            6.6295265930777,
                            46.7922849079311
                        ],
                        [
                            6.6294914859067,
                            46.7923461903198
                        ],
                        [
                            6.62955340823853,
                            46.7923742455382
                        ],
                        [
                            6.62955505422968,
                            46.7923693094562
                        ],
                        [
                            6.62965114557202,
                            46.7924248659642
                        ],
                        [
                            6.62965114543958,
                            46.7924248662172
                        ],
                        [
                            6.62965114807157,
                            46.7924248677389
                        ],
                        [
                            6.62964791166961,
                            46.7924310519952
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "30",
                "nomsquart": "Quartier 2",
                "character": "5",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [
        {
            "id": "16",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63395302900193,
                    46.7880944296658
                ]
            }
        },
        {
            "id": "17",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64066263466032,
                    46.7884863721188
                ]
            }
        },
        {
            "id": "18",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63770422004714,
                    46.7891211729052
                ]
            }
        },
        {
            "id": "19",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63428092136416,
                    46.7912619549288
                ]
            }
        },
        {
            "id": "20",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63207681539437,
                    46.7910253626638
                ]
            }
        },
        {
            "id": "21",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63230651295601,
                    46.7935894725393
                ]
            }
        },
        {
            "id": "22",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63959428451071,
                    46.7910717907849
                ]
            }
        },
        {
            "id": "23",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6366924763443,
                    46.7855289778844
                ]
            }
        },
        {
            "id": "24",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63597285055207,
                    46.7863789317934
                ]
            }
        },
        {
            "id": "25",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63735615800004,
                    46.7863082458248
                ]
            }
        },
        {
            "id": "26",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64011644403189,
                    46.7875833682877
                ]
            }
        },
        {
            "id": "27",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63493664780614,
                    46.787404764184
                ]
            }
        },
        {
            "id": "28",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6363870759151,
                    46.7849863665369
                ]
            }
        },
        {
            "id": "29",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64100961807948,
                    46.7882520099322
                ]
            }
        },
        {
            "id": "30",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64082194085386,
                    46.7917489153581
                ]
            }
        }
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.65998484729482,
                            46.7860110089772
                        ],
                        [
                            6.65998485390454,
                            46.7860109963783
                        ],
                        [
                            6.66238704666973,
                            46.7833036831149
                        ],
                        [
                            6.66247353799939,
                            46.7832088252819
                        ],
                        [
                            6.66294361783469,
                            46.782677037393
                        ],
                        [
                            6.66294361798104,
                            46.7826770373179
                        ],
                        [
                            6.66266351318225,
                            46.7824764147102
                        ],
                        [
                            6.66212827404061,
                            46.7821236417494
                        ],
                        [
                            6.66214244986877,
                            46.7821032279049
                        ],
                        [
                            6.6621268143695,
                            46.7820977236005
                        ],
                        [
                            6.6621147812855,
                            46.7821148241434
                        ],
                        [
                            6.66204525120637,
                            46.7820689216346
                        ],
                        [
                            6.66135217348431,
                            46.7816376151647
                        ],
                        [
                            6.66054392718403,
                            46.7811750231419
                        ],
                        [
                            6.65989581688547,
                            46.7808414406183
                        ],
                        [
                            6.65954562300059,
                            46.7806712754977
                        ],
                        [
                            6.65918269543038,
                            46.7805124472316
                        ],
                        [
                            6.65913350735227,
                            46.7804908809018
                        ],
                        [
                            6.65844769007303,
                            46.7801850994678
                        ],
                        [
                            6.65802893657885,
                            46.7800114918397
                        ],
                        [
                            6.6572734356703,
                            46.779734822633
                        ],
                        [
                            6.65715920688746,
                            46.7796743971922
                        ],
                        [
                            6.65706614828507,
                            46.7796260814027
                        ],
                        [
                            6.65679445488669,
                            46.7795519820057
                        ],
                        [
                            6.65637772125746,
                            46.7794382956398
                        ],
                        [
                            6.65585435510942,
                            46.779318477553
                        ],
                        [
                            6.65539215126628,
                            46.7792341618575
                        ],
                        [
                            6.65536576136771,
                            46.7792301119128
                        ],
                        [
                            6.65535270901842,
                            46.7792269656259
                        ],
                        [
                            6.65524158143285,
                            46.7792056898474
                        ],
                        [
                            6.65502960330127,
                            46.779185702171
                        ],
                        [
                            6.65465354697295,
                            46.7791476740815
                        ],
                        [
                            6.65434304828463,
                            46.779121970217
                        ],
                        [
                            6.6542864156636,
                            46.7791172645724
                        ],
                        [
                            6.65360432635238,
                            46.7791335309498
                        ],
                        [
                            6.65296277913094,
                            46.7791354108054
                        ],
                        [
                            6.65264802604082,
                            46.7791589704061
                        ],
                        [
                            6.65230926809049,
                            46.7792122301268
                        ],
                        [
                            6.65201924214761,
                            46.7793000092756
                        ],
                        [
                            6.65194157531832,
                            46.7792024079797
                        ],
                        [
                            6.6518003328907,
                            46.7792257227628
                        ],
                        [
                            6.6517831139335,
                            46.7791763960807
                        ],
                        [
                            6.65160792713246,
                            46.7792016353797
                        ],
                        [
                            6.65113701726146,
                            46.7793012103901
                        ],
                        [
                            6.65048518410562,
                            46.7794419900091
                        ],
                        [
                            6.65047113269031,
                            46.7794448633635
                        ],
                        [
                            6.65044814263497,
                            46.7794497405363
                        ],
                        [
                            6.65025712398153,
                            46.7794829643552
                        ],
                        [
                            6.65025002650837,
                            46.7794847162359
                        ],
                        [
                            6.6500808863351,
                            46.7795261858745
                        ],
                        [
                            6.64974704418426,
                            46.7796100583159
                        ],
                        [
                            6.64913495336413,
                            46.779763791324
                        ],
                        [
                            6.64900679624947,
                            46.7797340271082
                        ],
                        [
                            6.64899520375584,
                            46.7797387149492
                        ],
                        [
                            6.64901322177435,
                            46.7797869675824
                        ],
                        [
                            6.64857933942711,
                            46.7799147639312
                        ],
                        [
                            6.64837589903545,
                            46.7799821729722
                        ],
                        [
                            6.64830431347359,
                            46.7800058759948
                        ],
                        [
                            6.64823299130277,
                            46.7800294907511
                        ],
                        [
                            6.64820219901077,
                            46.7800397129298
                        ],
                        [
                            6.64815768266904,
                            46.7800481301952
                        ],
                        [
                            6.64807757873686,
                            46.7800633178638
                        ],
                        [
                            6.64799970788889,
                            46.78007807127
                        ],
                        [
                            6.64792485837164,
                            46.7800922157886
                        ],
                        [
                            6.6478506786473,
                            46.7801141913002
                        ],
                        [
                            6.64777584168475,
                            46.7801363423007
                        ],
                        [
                            6.64770192661735,
                            46.7801581394574
                        ],
                        [
                            6.64769048349128,
                            46.7801615686437
                        ],
                        [
                            6.64742471152269,
                            46.7802287238467
                        ],
                        [
                            6.64718403578909,
                            46.7802812096523
                        ],
                        [
                            6.64694296586937,
                            46.7803337817152
                        ],
                        [
                            6.64701296126685,
                            46.780436101305
                        ],
                        [
                            6.64696390084746,
                            46.780450693771
                        ],
                        [
                            6.64639439813009,
                            46.7805923856124
                        ],
                        [
                            6.64598866892183,
                            46.7806927480162
                        ],
                        [
                            6.64598000208763,
                            46.7806943970331
                        ],
                        [
                            6.64580531315975,
                            46.7807387022233
                        ],
                        [
                            6.64544728197465,
                            46.7807923474484
                        ],
                        [
                            6.64465266358886,
                            46.7809517141691
                        ],
                        [
                            6.64424357036538,
                            46.7810932500743
                        ],
                        [
                            6.64422904124271,
                            46.7811903946872
                        ],
                        [
                            6.64420439615144,
                            46.7811774001312
                        ],
                        [
                            6.64382102206141,
                            46.7809752489199
                        ],
                        [
                            6.64380113173785,
                            46.7809831162647
                        ],
                        [
                            6.64379741056197,
                            46.7809867789663
                        ],
                        [
                            6.64378859262605,
                            46.7809897758223
                        ],
                        [
                            6.64370149261058,
                            46.7810263220036
                        ],
                        [
                            6.64201132366162,
                            46.7817394213343
                        ],
                        [
                            6.64021127914251,
                            46.7822024497996
                        ],
                        [
                            6.64021124476558,
                            46.782213604408
                        ],
                        [
                            6.64010186320559,
                            46.7822334397224
                        ],
                        [
                            6.63998617786054,
                            46.7822544898069
                        ],
                        [
                            6.63973916538413,
                            46.782282806105
                        ],
                        [
                            6.63918243399886,
                            46.7823379187144
                        ],
                        [
                            6.63912448515587,
                            46.7823511865266
                        ],
                        [
                            6.63866891959166,
                            46.7824193300477
                        ],
                        [
                            6.63859943539038,
                            46.7824333260201
                        ],
                        [
                            6.63849960688745,
                            46.7824535864472
                        ],
                        [
                            6.63843382070293,
                            46.7824654493269
                        ],
                        [
                            6.63823315491266,
                            46.7825208957113
                        ],
                        [
                            6.6380479145598,
                            46.7825869750825
                        ],
                        [
                            6.63787383567052,
                            46.7826686057772
                        ],
                        [
                            6.63776547576004,
                            46.7827165127109
                        ],
                        [
                            6.63761822089125,
                            46.7827907745355
                        ],
                        [
                            6.6374726808072,
                            46.7828642388909
                        ],
                        [
                            6.63746001851254,
                            46.7828527249623
                        ],
                        [
                            6.63742479592764,
                            46.7828699296699
                        ],
                        [
                            6.63739638157045,
                            46.7828432820589
                        ],
                        [
                            6.63734056771075,
                            46.7828714069059
                        ],
                        [
                            6.63733665144676,
                            46.7828837866701
                        ],
                        [
                            6.63733282621077,
                            46.7828961725643
                        ],
                        [
                            6.63732909258959,
                            46.7829085788683
                        ],
                        [
                            6.63732544992299,
                            46.7829209962434
                        ],
                        [
                            6.63732188629623,
                            46.7829334196643
                        ],
                        [
                            6.6373184303997,
                            46.7829458548232
                        ],
                        [
                            6.63731504696133,
                            46.7829583086103
                        ],
                        [
                            6.63731177062575,
                            46.7829707626006
                        ],
                        [
                            6.63730857327302,
                            46.7829832264798
                        ],
                        [
                            6.63730548047842,
                            46.7829957004276
                        ],
                        [
                            6.63730246588391,
                            46.7830081831606
                        ],
                        [
                            6.63729954226082,
                            46.7830206758668
                        ],
                        [
                            6.63729671120764,
                            46.7830331785573
                        ],
                        [
                            6.63729397113419,
                            46.783045690672
                        ],
                        [
                            6.63729305668217,
                            46.7830490758369
                        ],
                        [
                            6.63729223308029,
                            46.78305247921
                        ],
                        [
                            6.63729151416881,
                            46.7830558838678
                        ],
                        [
                            6.63729088690672,
                            46.7830593067396
                        ],
                        [
                            6.63729035152293,
                            46.783062732453
                        ],
                        [
                            6.63728992076419,
                            46.7830661638431
                        ],
                        [
                            6.63728958188375,
                            46.7830695980749
                        ],
                        [
                            6.63728933398436,
                            46.783073041731
                        ],
                        [
                            6.63728919078366,
                            46.7830764861225
                        ],
                        [
                            6.63728913949401,
                            46.7830799311598
                        ],
                        [
                            6.63728919277229,
                            46.7830833857167
                        ],
                        [
                            6.63728933809246,
                            46.7830868321352
                        ],
                        [
                            6.63728958810321,
                            46.7830902798382
                        ],
                        [
                            6.63728992923406,
                            46.7830937276322
                        ],
                        [
                            6.63729036318154,
                            46.7830971689405
                        ],
                        [
                            6.63729090121661,
                            46.7831005983514
                        ],
                        [
                            6.63729153126914,
                            46.7831040212709
                        ],
                        [
                            6.63729225257258,
                            46.7831074354972
                        ],
                        [
                            6.63729307950493,
                            46.7831108416806
                        ],
                        [
                            6.63729399847928,
                            46.7831142397254
                        ],
                        [
                            6.63729502175382,
                            46.7831176115987
                        ],
                        [
                            6.63729615080442,
                            46.7831209655467
                        ],
                        [
                            6.63729739759497,
                            46.7831243033008
                        ],
                        [
                            6.63729874950134,
                            46.7831276137909
                        ],
                        [
                            6.63730020636009,
                            46.7831309079972
                        ],
                        [
                            6.63730176819572,
                            46.7831341842726
                        ],
                        [
                            6.63730344884851,
                            46.7831374256933
                        ],
                        [
                            6.63730522085869,
                            46.7831406512837
                        ],
                        [
                            6.63730711174329,
                            46.7831438381764
                        ],
                        [
                            6.6373090949071,
                            46.7831470010093
                        ],
                        [
                            6.63713137588579,
                            46.7832178098016
                        ],
                        [
                            6.63707996886101,
                            46.7832313921427
                        ],
                        [
                            6.6365723370094,
                            46.7833654613647
                        ],
                        [
                            6.63654091337967,
                            46.7833737866419
                        ],
                        [
                            6.63650683680161,
                            46.7835074063526
                        ],
                        [
                            6.63647528292872,
                            46.7836387047653
                        ],
                        [
                            6.63644777860769,
                            46.7837619350993
                        ],
                        [
                            6.63642610550605,
                            46.7838980710825
                        ],
                        [
                            6.6364046236214,
                            46.7840477022838
                        ],
                        [
                            6.63639225460105,
                            46.7841834534551
                        ],
                        [
                            6.63637984024203,
                            46.7843134473334
                        ],
                        [
                            6.63637856378743,
                            46.7844693372358
                        ],
                        [
                            6.63639513390189,
                            46.7845877503226
                        ],
                        [
                            6.6364224449467,
                            46.7847147846245
                        ],
                        [
                            6.63646367263789,
                            46.7848483040816
                        ],
                        [
                            6.6365129322745,
                            46.784970185415
                        ],
                        [
                            6.6366039912414,
                            46.7851345514947
                        ],
                        [
                            6.6367173104041,
                            46.7852991640301
                        ],
                        [
                            6.63688704213012,
                            46.7854925097563
                        ],
                        [
                            6.63696568564379,
                            46.7855672787792
                        ],
                        [
                            6.63707064232268,
                            46.7856604045718
                        ],
                        [
                            6.63724406211741,
                            46.7857908942892
                        ],
                        [
                            6.63724022060794,
                            46.7857938355589
                        ],
                        [
                            6.63754520399637,
                            46.7859985659303
                        ],
                        [
                            6.63817862064969,
                            46.7863464763209
                        ],
                        [
                            6.63888212071635,
                            46.7867291488889
                        ],
                        [
                            6.63946682289923,
                            46.7870425260896
                        ],
                        [
                            6.63988451476901,
                            46.7872697195016
                        ],
                        [
                            6.64061661619671,
                            46.7876683248155
                        ],
                        [
                            6.64117755380351,
                            46.7879958300179
                        ],
                        [
                            6.64116440255624,
                            46.7880083325767
                        ],
                        [
                            6.64204988693773,
                            46.7885222482336
                        ],
                        [
                            6.64276648575322,
                            46.7889351238954
                        ],
                        [
                            6.64506524971748,
                            46.7902725444933
                        ],
                        [
                            6.64706299081066,
                            46.7914347392244
                        ],
                        [
                            6.6472251310032,
                            46.7912904148617
                        ],
                        [
                            6.64774384067145,
                            46.7907711698857
                        ],
                        [
                            6.64774710080479,
                            46.7907679002866
                        ],
                        [
                            6.6478390817085,
                            46.7906685557252
                        ],
                        [
                            6.6479214036751,
                            46.7905652935445
                        ],
                        [
                            6.64799371810877,
                            46.7904585549945
                        ],
                        [
                            6.64805571299059,
                            46.7903487953036
                        ],
                        [
                            6.64810712084679,
                            46.7902364853804
                        ],
                        [
                            6.64814772678934,
                            46.7901221085752
                        ],
                        [
                            6.6481773518899,
                            46.7900061495827
                        ],
                        [
                            6.64819587213666,
                            46.7898891099471
                        ],
                        [
                            6.64820320831573,
                            46.7897714893237
                        ],
                        [
                            6.64819932833496,
                            46.7896537904362
                        ],
                        [
                            6.64818424963654,
                            46.7895365179957
                        ],
                        [
                            6.64815803686191,
                            46.7894201742916
                        ],
                        [
                            6.64812079949266,
                            46.78930525643
                        ],
                        [
                            6.64807270220788,
                            46.7891922586026
                        ],
                        [
                            6.64801394584418,
                            46.7890816620709
                        ],
                        [
                            6.64794478409954,
                            46.7889739407735
                        ],
                        [
                            6.64786551557104,
                            46.7888695590746
                        ],
                        [
                            6.64777647591392,
                            46.7887689612785
                        ],
                        [
                            6.64767804892641,
                            46.7886725788437
                        ],
                        [
                            6.64766014443959,
                            46.7886564038505
                        ],
                        [
                            6.64747018738901,
                            46.7884867895758
                        ],
                        [
                            6.64755652998183,
                            46.7884337835627
                        ],
                        [
                            6.64790022136277,
                            46.7882262325495
                        ],
                        [
                            6.64943225543277,
                            46.7882368415834
                        ],
                        [
                            6.64960361247263,
                            46.7882341752196
                        ],
                        [
                            6.64977434921745,
                            46.7882238157367
                        ],
                        [
                            6.64994373669617,
                            46.7882058080632
                        ],
                        [
                            6.65011104225231,
                            46.7881802305993
                        ],
                        [
                            6.65027555679418,
                            46.7881471904637
                        ],
                        [
                            6.65043657231936,
                            46.7881068299268
                        ],
                        [
                            6.65059339792616,
                            46.7880593248736
                        ],
                        [
                            6.65074536477958,
                            46.7880048733076
                        ],
                        [
                            6.65089182344093,
                            46.7879437140002
                        ],
                        [
                            6.65103214180063,
                            46.7878761039638
                        ],
                        [
                            6.65103441402653,
                            46.7878749303744
                        ],
                        [
                            6.65114507227247,
                            46.787867333139
                        ],
                        [
                            6.65119607131575,
                            46.787862730409
                        ],
                        [
                            6.65133614666453,
                            46.7878491239091
                        ],
                        [
                            6.65145453345554,
                            46.7878357167855
                        ],
                        [
                            6.65162183714431,
                            46.7878101371061
                        ],
                        [
                            6.65178634962866,
                            46.7877770947917
                        ],
                        [
                            6.65185315078205,
                            46.7877611088123
                        ],
                        [
                            6.65187117504893,
                            46.7877598044536
                        ],
                        [
                            6.65204055794497,
                            46.7877417952981
                        ],
                        [
                            6.65220786108763,
                            46.7877162131125
                        ],
                        [
                            6.65237237290142,
                            46.7876831716001
                        ],
                        [
                            6.65253338466039,
                            46.7876428086467
                        ],
                        [
                            6.6526902078976,
                            46.7875952985196
                        ],
                        [
                            6.65284217128939,
                            46.7875408463551
                        ],
                        [
                            6.65298862633957,
                            46.7874796821578
                        ],
                        [
                            6.65305152124246,
                            46.7874505371185
                        ],
                        [
                            6.65314094271539,
                            46.7874077925985
                        ],
                        [
                            6.65321836138201,
                            46.7873693266007
                        ],
                        [
                            6.6533519369526,
                            46.7872955551119
                        ],
                        [
                            6.65347820240717,
                            46.7872159416079
                        ],
                        [
                            6.65359661640135,
                            46.7871308261026
                        ],
                        [
                            6.65370667081175,
                            46.7870405735471
                        ],
                        [
                            6.65380789878478,
                            46.7869455700413
                        ],
                        [
                            6.65389986197988,
                            46.7868462205488
                        ],
                        [
                            6.65391913146198,
                            46.7868220426626
                        ],
                        [
                            6.65392759911677,
                            46.7868254974326
                        ],
                        [
                            6.65400794491241,
                            46.7868567999805
                        ],
                        [
                            6.65406258832151,
                            46.7868772238574
                        ],
                        [
                            6.65476368241388,
                            46.787141285599
                        ],
                        [
                            6.6548410986186,
                            46.787169298284
                        ],
                        [
                            6.65499650599327,
                            46.7872189566337
                        ],
                        [
                            6.65515630785789,
                            46.7872615268624
                        ],
                        [
                            6.65531981937417,
                            46.7872968252542
                        ],
                        [
                            6.65548634397931,
                            46.7873247042546
                        ],
                        [
                            6.65565516557015,
                            46.7873450403374
                        ],
                        [
                            6.65582556266004,
                            46.7873577500258
                        ],
                        [
                            6.655996805367,
                            46.7873627772426
                        ],
                        [
                            6.65616815930784,
                            46.7873601004752
                        ],
                        [
                            6.65633889201798,
                            46.7873497311726
                        ],
                        [
                            6.65650827452767,
                            46.7873317154031
                        ],
                        [
                            6.65667557427371,
                            46.7873061266682
                        ],
                        [
                            6.65684008209327,
                            46.7872730787154
                        ],
                        [
                            6.6570010900766,
                            46.7872327094637
                        ],
                        [
                            6.65715790737858,
                            46.7871851931909
                        ],
                        [
                            6.65730986509552,
                            46.787130735076
                        ],
                        [
                            6.65745631395598,
                            46.7870695651436
                        ],
                        [
                            6.65751156799934,
                            46.7870440534148
                        ],
                        [
                            6.65795608133377,
                            46.7872750381733
                        ],
                        [
                            6.65805952401875,
                            46.7873261211599
                        ],
                        [
                            6.65820416724142,
                            46.7873892831484
                        ],
                        [
                            6.65826672767519,
                            46.7874138738569
                        ],
                        [
                            6.65862048096572,
                            46.787548525812
                        ],
                        [
                            6.65998484729482,
                            46.7860110089772
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "50",
                "nomsquart": "Quartier 3",
                "character": "8",
                "actionsPolygon": ["1","2","3","4","5","6","7","8","9","10"],
                "actionsPoint": [
        {
            "id": "31",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64023803069838,
                    46.786907124059
                ]
            }
        },
        {
            "id": "32",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64362614977826,
                    46.7868196601471
                ]
            }
        },
        {
            "id": "33",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64772404624208,
                    46.7852914537374
                ]
            }
        },
        {
            "id": "34",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64918221291475,
                    46.7841744235872
                ]
            }
        },
        {
            "id": "35",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65342526691632,
                    46.7842995550785
                ]
            }
        },
        {
            "id": "36",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65455525907384,
                    46.7796112745644
                ]
            }
        },
        {
            "id": "37",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6446889680136,
                    46.7817750900309
                ]
            }
        },
        {
            "id": "38",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65276000960435,
                    46.7802783800209
                ]
            }
        },
        {
            "id": "39",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63807021360963,
                    46.7838614674905
                ]
            }
        },
        {
            "id": "40",
            "type": "Feature",
            "properties": {
                "type": "affiche",
                "name": "Placarder une affiche de la resistance",
                "description": "Vise à saboter la campagne d'affichage de la mafia",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64584013,
                    46.78383419
                ]
            }
        },
        {
            "id": "41",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64317317654304,
                    46.7883935668289
                ]
            }
        },
        {
            "id": "42",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64693495073778,
                    46.785321325676
                ]
            }
        },
        {
            "id": "43",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64868583028527,
                    46.7848457519374
                ]
            }
        },
        {
            "id": "44",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65175896360224,
                    46.7847298937998
                ]
            }
        },
        {
            "id": "45",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65484822746817,
                    46.7845714125008
                ]
            }
        }
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.63532043110814,
                            46.7837868906667
                        ],
                        [
                            6.63557351501017,
                            46.7835667797116
                        ],
                        [
                            6.63611098965389,
                            46.7832233194798
                        ],
                        [
                            6.63637436978796,
                            46.7830549695178
                        ],
                        [
                            6.63652690774205,
                            46.7830217678078
                        ],
                        [
                            6.63668151908224,
                            46.7829461194435
                        ],
                        [
                            6.63668732867661,
                            46.7829517377143
                        ],
                        [
                            6.63661462074085,
                            46.7830940817783
                        ],
                        [
                            6.63651898662163,
                            46.7832808845452
                        ],
                        [
                            6.63654091337967,
                            46.7833737866419
                        ],
                        [
                            6.6365723370094,
                            46.7833654613647
                        ],
                        [
                            6.63707996886101,
                            46.7832313921427
                        ],
                        [
                            6.63713137588579,
                            46.7832178098016
                        ],
                        [
                            6.6373090949071,
                            46.7831470010093
                        ],
                        [
                            6.63730711174329,
                            46.7831438381764
                        ],
                        [
                            6.63730522085869,
                            46.7831406512837
                        ],
                        [
                            6.63730344884851,
                            46.7831374256933
                        ],
                        [
                            6.63730176819572,
                            46.7831341842726
                        ],
                        [
                            6.63730020636009,
                            46.7831309079972
                        ],
                        [
                            6.63729874950134,
                            46.7831276137909
                        ],
                        [
                            6.63729739759497,
                            46.7831243033008
                        ],
                        [
                            6.63729615080442,
                            46.7831209655467
                        ],
                        [
                            6.63729502175382,
                            46.7831176115987
                        ],
                        [
                            6.63729399847928,
                            46.7831142397254
                        ],
                        [
                            6.63729307950493,
                            46.7831108416806
                        ],
                        [
                            6.63729225257258,
                            46.7831074354972
                        ],
                        [
                            6.63729153126914,
                            46.7831040212709
                        ],
                        [
                            6.63729090121661,
                            46.7831005983514
                        ],
                        [
                            6.63729036318154,
                            46.7830971689405
                        ],
                        [
                            6.63728992923406,
                            46.7830937276322
                        ],
                        [
                            6.63728958810321,
                            46.7830902798382
                        ],
                        [
                            6.63728933809246,
                            46.7830868321352
                        ],
                        [
                            6.63728919277229,
                            46.7830833857167
                        ],
                        [
                            6.63728913949401,
                            46.7830799311598
                        ],
                        [
                            6.63728919078366,
                            46.7830764861225
                        ],
                        [
                            6.63728933398436,
                            46.783073041731
                        ],
                        [
                            6.63728958188375,
                            46.7830695980749
                        ],
                        [
                            6.63728992076419,
                            46.7830661638431
                        ],
                        [
                            6.63729035152293,
                            46.783062732453
                        ],
                        [
                            6.63729088690672,
                            46.7830593067396
                        ],
                        [
                            6.63729151416881,
                            46.7830558838678
                        ],
                        [
                            6.63729223308029,
                            46.78305247921
                        ],
                        [
                            6.63729305668217,
                            46.7830490758369
                        ],
                        [
                            6.63729397113419,
                            46.783045690672
                        ],
                        [
                            6.63729671120764,
                            46.7830331785573
                        ],
                        [
                            6.63729954226082,
                            46.7830206758668
                        ],
                        [
                            6.63730246588391,
                            46.7830081831606
                        ],
                        [
                            6.63730548047842,
                            46.7829957004276
                        ],
                        [
                            6.63730857327302,
                            46.7829832264798
                        ],
                        [
                            6.63731177062575,
                            46.7829707626006
                        ],
                        [
                            6.63731504696133,
                            46.7829583086103
                        ],
                        [
                            6.6373184303997,
                            46.7829458548232
                        ],
                        [
                            6.63732188629623,
                            46.7829334196643
                        ],
                        [
                            6.63732544992299,
                            46.7829209962434
                        ],
                        [
                            6.63732909258959,
                            46.7829085788683
                        ],
                        [
                            6.63733282621077,
                            46.7828961725643
                        ],
                        [
                            6.63733665144676,
                            46.7828837866701
                        ],
                        [
                            6.63734056771075,
                            46.7828714069059
                        ],
                        [
                            6.63739638157045,
                            46.7828432820589
                        ],
                        [
                            6.63742479592764,
                            46.7828699296699
                        ],
                        [
                            6.63746001851254,
                            46.7828527249623
                        ],
                        [
                            6.6374726808072,
                            46.7828642388909
                        ],
                        [
                            6.63761822089125,
                            46.7827907745355
                        ],
                        [
                            6.63776547576004,
                            46.7827165127109
                        ],
                        [
                            6.63787383567052,
                            46.7826686057772
                        ],
                        [
                            6.6380479145598,
                            46.7825869750825
                        ],
                        [
                            6.63823315491266,
                            46.7825208957113
                        ],
                        [
                            6.63843382070293,
                            46.7824654493269
                        ],
                        [
                            6.63849960688745,
                            46.7824535864472
                        ],
                        [
                            6.63859943539038,
                            46.7824333260201
                        ],
                        [
                            6.63866891959166,
                            46.7824193300477
                        ],
                        [
                            6.63912448515587,
                            46.7823511865266
                        ],
                        [
                            6.63918243399886,
                            46.7823379187144
                        ],
                        [
                            6.63973916538413,
                            46.782282806105
                        ],
                        [
                            6.63998617786054,
                            46.7822544898069
                        ],
                        [
                            6.64010186320559,
                            46.7822334397224
                        ],
                        [
                            6.64021124476558,
                            46.782213604408
                        ],
                        [
                            6.64021127914251,
                            46.7822024497996
                        ],
                        [
                            6.64201132366162,
                            46.7817394213343
                        ],
                        [
                            6.64370149261058,
                            46.7810263220036
                        ],
                        [
                            6.64378859262605,
                            46.7809897758223
                        ],
                        [
                            6.64379741056197,
                            46.7809867789663
                        ],
                        [
                            6.64380113173785,
                            46.7809831162647
                        ],
                        [
                            6.64382102206141,
                            46.7809752489199
                        ],
                        [
                            6.64420439615144,
                            46.7811774001312
                        ],
                        [
                            6.64422904124271,
                            46.7811903946872
                        ],
                        [
                            6.64424357036538,
                            46.7810932500743
                        ],
                        [
                            6.64465266358886,
                            46.7809517141691
                        ],
                        [
                            6.64544728197465,
                            46.7807923474484
                        ],
                        [
                            6.64580531315975,
                            46.7807387022233
                        ],
                        [
                            6.64598000208763,
                            46.7806943970331
                        ],
                        [
                            6.64598866892183,
                            46.7806927480162
                        ],
                        [
                            6.64639439813009,
                            46.7805923856124
                        ],
                        [
                            6.64696390084746,
                            46.780450693771
                        ],
                        [
                            6.64701296126685,
                            46.780436101305
                        ],
                        [
                            6.64694296586937,
                            46.7803337817152
                        ],
                        [
                            6.64718403578909,
                            46.7802812096523
                        ],
                        [
                            6.64742471152269,
                            46.7802287238467
                        ],
                        [
                            6.64769048349128,
                            46.7801615686437
                        ],
                        [
                            6.64770192661735,
                            46.7801581394574
                        ],
                        [
                            6.64777584168475,
                            46.7801363423007
                        ],
                        [
                            6.6478506786473,
                            46.7801141913002
                        ],
                        [
                            6.64792485837164,
                            46.7800922157886
                        ],
                        [
                            6.64799970788889,
                            46.78007807127
                        ],
                        [
                            6.64807757873686,
                            46.7800633178638
                        ],
                        [
                            6.64815768266904,
                            46.7800481301952
                        ],
                        [
                            6.64820219901077,
                            46.7800397129298
                        ],
                        [
                            6.64823299130277,
                            46.7800294907511
                        ],
                        [
                            6.64830431347359,
                            46.7800058759948
                        ],
                        [
                            6.64837589903545,
                            46.7799821729722
                        ],
                        [
                            6.64857933942711,
                            46.7799147639312
                        ],
                        [
                            6.64901322177435,
                            46.7797869675824
                        ],
                        [
                            6.64899520375584,
                            46.7797387149492
                        ],
                        [
                            6.64900679624947,
                            46.7797340271082
                        ],
                        [
                            6.64913495336413,
                            46.779763791324
                        ],
                        [
                            6.64974704418426,
                            46.7796100583159
                        ],
                        [
                            6.6500808863351,
                            46.7795261858745
                        ],
                        [
                            6.65025002650837,
                            46.7794847162359
                        ],
                        [
                            6.65025712398153,
                            46.7794829643552
                        ],
                        [
                            6.65044814263497,
                            46.7794497405363
                        ],
                        [
                            6.65047113269031,
                            46.7794448633635
                        ],
                        [
                            6.65048518410562,
                            46.7794419900091
                        ],
                        [
                            6.65113701726146,
                            46.7793012103901
                        ],
                        [
                            6.65160792713246,
                            46.7792016353797
                        ],
                        [
                            6.6517831139335,
                            46.7791763960807
                        ],
                        [
                            6.65174707603945,
                            46.77871240856
                        ],
                        [
                            6.65197713080813,
                            46.7786153100982
                        ],
                        [
                            6.65237348164637,
                            46.7784110477006
                        ],
                        [
                            6.65275620531273,
                            46.7781713356513
                        ],
                        [
                            6.65309745202804,
                            46.7779290877014
                        ],
                        [
                            6.65312251627377,
                            46.7777998090943
                        ],
                        [
                            6.65304521214401,
                            46.7777670711659
                        ],
                        [
                            6.6530104791387,
                            46.7777513592306
                        ],
                        [
                            6.65293713315772,
                            46.7777165796091
                        ],
                        [
                            6.65275176978509,
                            46.7776051026729
                        ],
                        [
                            6.65251377960771,
                            46.7774390171238
                        ],
                        [
                            6.65231436356848,
                            46.7774649903893
                        ],
                        [
                            6.65231622177865,
                            46.7774659744991
                        ],
                        [
                            6.65231801366506,
                            46.7774670125092
                        ],
                        [
                            6.65231973923571,
                            46.7774681038707
                        ],
                        [
                            6.65232138570429,
                            46.7774692484953
                        ],
                        [
                            6.65232295226363,
                            46.7774704469266
                        ],
                        [
                            6.65232444064834,
                            46.7774716898424
                        ],
                        [
                            6.6523258355544,
                            46.7774729853732
                        ],
                        [
                            6.65232715160699,
                            46.7774743171478
                        ],
                        [
                            6.65232837590749,
                            46.7774756927642
                        ],
                        [
                            6.65232950697794,
                            46.7774771039763
                        ],
                        [
                            6.65233054721572,
                            46.7774785508005
                        ],
                        [
                            6.65233148158146,
                            46.7774800232501
                        ],
                        [
                            6.65233232351624,
                            46.7774815313008
                        ],
                        [
                            6.6523330604984,
                            46.7774830567472
                        ],
                        [
                            6.6523336923996,
                            46.7774846083734
                        ],
                        [
                            6.65233422014728,
                            46.7774861774007
                        ],
                        [
                            6.65233465453653,
                            46.777487790808
                        ],
                        [
                            6.65233499756661,
                            46.7774894211555
                        ],
                        [
                            6.65233523510149,
                            46.7774910513247
                        ],
                        [
                            6.65233536861916,
                            46.777492689562
                        ],
                        [
                            6.65233539732047,
                            46.7774943358616
                        ],
                        [
                            6.65233532053456,
                            46.7774959814341
                        ],
                        [
                            6.65233515277438,
                            46.7774976175943
                        ],
                        [
                            6.65233486674062,
                            46.7774992529392
                        ],
                        [
                            6.65233448986888,
                            46.7775008695385
                        ],
                        [
                            6.65233400763824,
                            46.7775024766265
                        ],
                        [
                            6.65233343444127,
                            46.7775040737532
                        ],
                        [
                            6.65233271608287,
                            46.7775057599261
                        ],
                        [
                            6.65233189249379,
                            46.7775074278034
                        ],
                        [
                            6.6523309780667,
                            46.7775090769352
                        ],
                        [
                            6.65232997306623,
                            46.7775106892042
                        ],
                        [
                            6.65232887562942,
                            46.7775122827167
                        ],
                        [
                            6.65232768761122,
                            46.7775138399154
                        ],
                        [
                            6.65232639543409,
                            46.7775153601577
                        ],
                        [
                            6.65232503732078,
                            46.777516853041
                        ],
                        [
                            6.65232357597602,
                            46.7775183001892
                        ],
                        [
                            6.65232203683618,
                            46.7775197111117
                        ],
                        [
                            6.65232043202473,
                            46.7775210765579
                        ],
                        [
                            6.6523187367682,
                            46.7775223963572
                        ],
                        [
                            6.65231696385286,
                            46.7775236705975
                        ],
                        [
                            6.65231512540229,
                            46.7775248900284
                        ],
                        [
                            6.65231321008407,
                            46.777526064455
                        ],
                        [
                            6.6523112161796,
                            46.7775272021013
                        ],
                        [
                            6.65230914407384,
                            46.7775282766148
                        ],
                        [
                            6.65230702081747,
                            46.7775292964181
                        ],
                        [
                            6.65230484653878,
                            46.7775302527268
                        ],
                        [
                            6.65230260751599,
                            46.7775311547807
                        ],
                        [
                            6.65230031666375,
                            46.7775319938836
                        ],
                        [
                            6.65229798771189,
                            46.7775327602469
                        ],
                        [
                            6.65229560680226,
                            46.7775334724435
                        ],
                        [
                            6.65229318858416,
                            46.7775341124551
                        ],
                        [
                            6.65226152837255,
                            46.777541091338
                        ],
                        [
                            6.65196844876213,
                            46.7776054595691
                        ],
                        [
                            6.65193495076651,
                            46.7776127853249
                        ],
                        [
                            6.65175734231629,
                            46.7776517721227
                        ],
                        [
                            6.65172673308857,
                            46.7776585774661
                        ],
                        [
                            6.65166984977692,
                            46.7776711391241
                        ],
                        [
                            6.65158866271626,
                            46.7776891104665
                        ],
                        [
                            6.65156790545452,
                            46.777693735323
                        ],
                        [
                            6.65145243201,
                            46.7777192063121
                        ],
                        [
                            6.65128730372901,
                            46.7777553992112
                        ],
                        [
                            6.65091540938675,
                            46.7778364937429
                        ],
                        [
                            6.65091409643362,
                            46.7778367542668
                        ],
                        [
                            6.65087639424495,
                            46.7778449500489
                        ],
                        [
                            6.65059420926342,
                            46.7779073216832
                        ],
                        [
                            6.6505821228316,
                            46.7779100268844
                        ],
                        [
                            6.65042211444855,
                            46.7779452644957
                        ],
                        [
                            6.65010317555902,
                            46.7780135881196
                        ],
                        [
                            6.65003720779101,
                            46.7780295046523
                        ],
                        [
                            6.64975476930444,
                            46.7780911520947
                        ],
                        [
                            6.64959093324808,
                            46.7781283414587
                        ],
                        [
                            6.64932819707744,
                            46.7781858068384
                        ],
                        [
                            6.64924887604718,
                            46.7781121210857
                        ],
                        [
                            6.64907370993211,
                            46.7779219044421
                        ],
                        [
                            6.64883848290935,
                            46.7776663214112
                        ],
                        [
                            6.64847011535367,
                            46.777266060504
                        ],
                        [
                            6.6478644367357,
                            46.7766015630431
                        ],
                        [
                            6.64778037965053,
                            46.7765029245299
                        ],
                        [
                            6.64777381392603,
                            46.7764953221927
                        ],
                        [
                            6.64777136983746,
                            46.7764923369886
                        ],
                        [
                            6.64770726208328,
                            46.7765064657743
                        ],
                        [
                            6.64770596949019,
                            46.7765052872977
                        ],
                        [
                            6.64757730069038,
                            46.776368376754
                        ],
                        [
                            6.64755427443638,
                            46.7763403293789
                        ],
                        [
                            6.64758960919706,
                            46.7763238421887
                        ],
                        [
                            6.64759752013489,
                            46.7763201189264
                        ],
                        [
                            6.64759907701486,
                            46.776319356089
                        ],
                        [
                            6.6476005557089,
                            46.7763185295666
                        ],
                        [
                            6.64760198232204,
                            46.7763176576594
                        ],
                        [
                            6.6476033449964,
                            46.7763167315002
                        ],
                        [
                            6.6476046156254,
                            46.7763157602281
                        ],
                        [
                            6.6476058221946,
                            46.7763147429391
                        ],
                        [
                            6.6476069511108,
                            46.7763136800881
                        ],
                        [
                            6.6476079886517,
                            46.776312580914
                        ],
                        [
                            6.64760894841048,
                            46.7763114449619
                        ],
                        [
                            6.64760981679398,
                            46.7763102726868
                        ],
                        [
                            6.64761058009596,
                            46.7763090722295
                        ],
                        [
                            6.64761126626978,
                            46.776307844882
                        ],
                        [
                            6.64761184803218,
                            46.7763065981421
                        ],
                        [
                            6.64761233748303,
                            46.7763053244067
                        ],
                        [
                            6.64761272318441,
                            46.7763040406176
                        ],
                        [
                            6.64761301711524,
                            46.776302747407
                        ],
                        [
                            6.64761320649751,
                            46.7763014441371
                        ],
                        [
                            6.64761329132316,
                            46.776300131357
                        ],
                        [
                            6.64761328424917,
                            46.7762988179395
                        ],
                        [
                            6.64761241451232,
                            46.7762867571399
                        ],
                        [
                            6.64761857042912,
                            46.7762866202898
                        ],
                        [
                            6.64755569243121,
                            46.776190377466
                        ],
                        [
                            6.6472975092751,
                            46.7759207778116
                        ],
                        [
                            6.64717446754338,
                            46.7757931718868
                        ],
                        [
                            6.64688879886898,
                            46.7754963027318
                        ],
                        [
                            6.64677791009176,
                            46.7753793958409
                        ],
                        [
                            6.64666725664558,
                            46.7752642892157
                        ],
                        [
                            6.64652146329156,
                            46.7751080071123
                        ],
                        [
                            6.64650409882752,
                            46.7750867463232
                        ],
                        [
                            6.64631824887015,
                            46.774858668074
                        ],
                        [
                            6.646272004897,
                            46.774806800368
                        ],
                        [
                            6.64593984933334,
                            46.7744397978821
                        ],
                        [
                            6.64587143188802,
                            46.7743643861687
                        ],
                        [
                            6.64526993386762,
                            46.7737048509583
                        ],
                        [
                            6.64512290485039,
                            46.7735441504716
                        ],
                        [
                            6.64505834559039,
                            46.7734736226905
                        ],
                        [
                            6.6449372168123,
                            46.7733413494958
                        ],
                        [
                            6.64490796546711,
                            46.7733093900543
                        ],
                        [
                            6.64422502977781,
                            46.7725625614436
                        ],
                        [
                            6.64409642414851,
                            46.7724403106209
                        ],
                        [
                            6.64378894852929,
                            46.7720974924678
                        ],
                        [
                            6.6437421119509,
                            46.7720329349951
                        ],
                        [
                            6.64366217225551,
                            46.7719224478529
                        ],
                        [
                            6.64365421344802,
                            46.7719116872018
                        ],
                        [
                            6.6435548967301,
                            46.7717746163151
                        ],
                        [
                            6.64345417487325,
                            46.7715820313853
                        ],
                        [
                            6.64338193343391,
                            46.7713759704321
                        ],
                        [
                            6.64333661264094,
                            46.7711645202837
                        ],
                        [
                            6.64305676523213,
                            46.7711855979096
                        ],
                        [
                            6.64301501289078,
                            46.7714681385545
                        ],
                        [
                            6.64296593084837,
                            46.771688465888
                        ],
                        [
                            6.64289646374035,
                            46.771906042342
                        ],
                        [
                            6.64273093833261,
                            46.7723419094661
                        ],
                        [
                            6.64268694906937,
                            46.772403584516
                        ],
                        [
                            6.64267864983741,
                            46.772417640927
                        ],
                        [
                            6.64267024631265,
                            46.7724316702542
                        ],
                        [
                            6.6426617503674,
                            46.7724456802675
                        ],
                        [
                            6.6426531646505,
                            46.7724596539642
                        ],
                        [
                            6.64264448663475,
                            46.7724736001117
                        ],
                        [
                            6.64263570500327,
                            46.7724875274161
                        ],
                        [
                            6.6426268320018,
                            46.7725014183928
                        ],
                        [
                            6.6426178675085,
                            46.7725152812767
                        ],
                        [
                            6.64260878474,
                            46.7725291438835
                        ],
                        [
                            6.64259962499268,
                            46.7725429697137
                        ],
                        [
                            6.64259036016919,
                            46.7725567673565
                        ],
                        [
                            6.6425810038374,
                            46.7725705380045
                        ],
                        [
                            6.64257155680445,
                            46.7725842811143
                        ],
                        [
                            6.64256201921639,
                            46.7725979868037
                        ],
                        [
                            6.64255237653566,
                            46.7726116654035
                        ],
                        [
                            6.64254265593877,
                            46.7726253165542
                        ],
                        [
                            6.64253288392961,
                            46.7726388772982
                        ],
                        [
                            6.64252302042813,
                            46.7726524099493
                        ],
                        [
                            6.64251307993934,
                            46.7726659063726
                        ],
                        [
                            6.64250304701288,
                            46.7726793845797
                        ],
                        [
                            6.64249293711528,
                            46.7726928254611
                        ],
                        [
                            6.64248274849408,
                            46.7727062394368
                        ],
                        [
                            6.64247246838031,
                            46.7727196253195
                        ],
                        [
                            6.64246211047993,
                            46.7727329749687
                        ],
                        [
                            6.64245258252384,
                            46.7727451070884
                        ],
                        [
                            6.64244296333572,
                            46.7727571935469
                        ],
                        [
                            6.64243322708531,
                            46.7727692517338
                        ],
                        [
                            6.64242339959469,
                            46.7727812648085
                        ],
                        [
                            6.64241348074201,
                            46.7727932410061
                        ],
                        [
                            6.64240345773387,
                            46.7728051807861
                        ],
                        [
                            6.64239333070832,
                            46.7728170748156
                        ],
                        [
                            6.64238311311964,
                            46.7728289319734
                        ],
                        [
                            6.64237279058445,
                            46.7728407521591
                        ],
                        [
                            6.64236109897226,
                            46.7728539848702
                        ],
                        [
                            6.64234931599658,
                            46.7728671807038
                        ],
                        [
                            6.64233744259447,
                            46.7728803303322
                        ],
                        [
                            6.64232547781251,
                            46.7728934441809
                        ],
                        [
                            6.64231342166694,
                            46.772906521152
                        ],
                        [
                            6.64230127415768,
                            46.7729195612454
                        ],
                        [
                            6.64228903621372,
                            46.7729325556826
                        ],
                        [
                            6.64227670689787,
                            46.772945513791
                        ],
                        [
                            6.64226581549974,
                            46.772956835285
                        ],
                        [
                            6.64225483366003,
                            46.7729681116718
                        ],
                        [
                            6.64224377404216,
                            46.7729793512761
                        ],
                        [
                            6.64223260960741,
                            46.7729905451238
                        ],
                        [
                            6.64222135460107,
                            46.7730017026486
                        ],
                        [
                            6.64221002114734,
                            46.7730128146009
                        ],
                        [
                            6.64219858448292,
                            46.7730238802587
                        ],
                        [
                            6.64218706936294,
                            46.773034900893
                        ],
                        [
                            6.64217546301026,
                            46.7730458758654
                        ],
                        [
                            6.64216376608586,
                            46.7730568145148
                        ],
                        [
                            6.64214891096668,
                            46.7730705555107
                        ],
                        [
                            6.64213396554907,
                            46.7730842415163
                        ],
                        [
                            6.64211892888774,
                            46.7730978824083
                        ],
                        [
                            6.64210380099071,
                            46.7731114776375
                        ],
                        [
                            6.64208858199611,
                            46.7731250178708
                        ],
                        [
                            6.64207325977146,
                            46.7731385129066
                        ],
                        [
                            6.64205785909637,
                            46.7731519623689
                        ],
                        [
                            6.64204235453829,
                            46.7731653567458
                        ],
                        [
                            6.64203110943368,
                            46.7731749758337
                        ],
                        [
                            6.64201978601225,
                            46.7731845405647
                        ],
                        [
                            6.64200838401396,
                            46.7731940685074
                        ],
                        [
                            6.64199690516701,
                            46.7732035508885
                        ],
                        [
                            6.64198533508788,
                            46.7732129876077
                        ],
                        [
                            6.64197369933908,
                            46.7732223793925
                        ],
                        [
                            6.64196198674965,
                            46.7732317250668
                        ],
                        [
                            6.64195018305802,
                            46.7732410162948
                        ],
                        [
                            6.64193831436576,
                            46.7732502713782
                        ],
                        [
                            6.64192636723471,
                            46.7732594803397
                        ],
                        [
                            6.64191434337676,
                            46.7732686355045
                        ],
                        [
                            6.64189523835331,
                            46.773282904631
                        ],
                        [
                            6.64187604222972,
                            46.7732971187603
                        ],
                        [
                            6.6418567812294,
                            46.7733112879586
                        ],
                        [
                            6.64183742992799,
                            46.7733254021652
                        ],
                        [
                            6.64181795528968,
                            46.773339857576
                        ],
                        [
                            6.64179841578246,
                            46.7733542675067
                        ],
                        [
                            6.6417787859738,
                            46.7733686224454
                        ],
                        [
                            6.64175833908222,
                            46.7733832692664
                        ],
                        [
                            6.64173782799822,
                            46.7733978788476
                        ],
                        [
                            6.64171725189835,
                            46.7734124528305
                        ],
                        [
                            6.64168644740721,
                            46.7734342502486
                        ],
                        [
                            6.64165572039678,
                            46.7734561025577
                        ],
                        [
                            6.64163671872346,
                            46.7734695893933
                        ],
                        [
                            6.64161763871962,
                            46.7734830224188
                        ],
                        [
                            6.64159848120876,
                            46.7734963999928
                        ],
                        [
                            6.6415792461665,
                            46.7735097237621
                        ],
                        [
                            6.64154101392723,
                            46.7735361741911
                        ],
                        [
                            6.64150278164233,
                            46.7735626251561
                        ],
                        [
                            6.64146432478371,
                            46.7735892359647
                        ],
                        [
                            6.64142578957424,
                            46.7736157924042
                        ],
                        [
                            6.64138715151052,
                            46.773642276184
                        ],
                        [
                            6.64134840899438,
                            46.7736686872929
                        ],
                        [
                            6.64130174545475,
                            46.7737003596338
                        ],
                        [
                            6.6412550304562,
                            46.7737319953576
                        ],
                        [
                            6.64123155313424,
                            46.7737479161485
                        ],
                        [
                            6.6412081415942,
                            46.7737638730839
                        ],
                        [
                            6.64118479396141,
                            46.7737798848192
                        ],
                        [
                            6.64116151131142,
                            46.7737959326935
                        ],
                        [
                            6.64064040347486,
                            46.7741391705529
                        ],
                        [
                            6.64040668785827,
                            46.7742711242882
                        ],
                        [
                            6.64031874373852,
                            46.7743209757443
                        ],
                        [
                            6.64029840963511,
                            46.774332438504
                        ],
                        [
                            6.64018973481013,
                            46.774394019434
                        ],
                        [
                            6.64015949381537,
                            46.774411259834
                        ],
                        [
                            6.64005636931677,
                            46.7744693709543
                        ],
                        [
                            6.64003181073566,
                            46.7744831425665
                        ],
                        [
                            6.64001741764465,
                            46.7744913184285
                        ],
                        [
                            6.64000698603012,
                            46.7744971824512
                        ],
                        [
                            6.63992155359155,
                            46.7745454319922
                        ],
                        [
                            6.63978035377754,
                            46.7746281050533
                        ],
                        [
                            6.63977863700187,
                            46.7746290829974
                        ],
                        [
                            6.63954956350253,
                            46.7747655654774
                        ],
                        [
                            6.63953278567129,
                            46.7747756133635
                        ],
                        [
                            6.63951904610159,
                            46.7747837931933
                        ],
                        [
                            6.63951772514849,
                            46.7747845938127
                        ],
                        [
                            6.63949077821955,
                            46.7748004174626
                        ],
                        [
                            6.63927479645577,
                            46.7749281752988
                        ],
                        [
                            6.63924982960654,
                            46.7749429338526
                        ],
                        [
                            6.63922103280306,
                            46.7749599139881
                        ],
                        [
                            6.63921957945069,
                            46.7749608037231
                        ],
                        [
                            6.63919474229579,
                            46.774975652672
                        ],
                        [
                            6.63916171566555,
                            46.7749953018116
                        ],
                        [
                            6.63899433255386,
                            46.7750951529902
                        ],
                        [
                            6.6389694966124,
                            46.7751099118521
                        ],
                        [
                            6.63892986337605,
                            46.7751335634289
                        ],
                        [
                            6.63882682311846,
                            46.7751946428521
                        ],
                        [
                            6.63871373987271,
                            46.7752618589566
                        ],
                        [
                            6.63870184925426,
                            46.77526897219
                        ],
                        [
                            6.63869788553177,
                            46.7752713734649
                        ],
                        [
                            6.63866803004801,
                            46.7752890658651
                        ],
                        [
                            6.63864781747133,
                            46.7753010683714
                        ],
                        [
                            6.63850804916903,
                            46.7753841101077
                        ],
                        [
                            6.63847793011308,
                            46.7754018906568
                        ],
                        [
                            6.63847396637898,
                            46.775404291375
                        ],
                        [
                            6.63830539802,
                            46.7755044028329
                        ],
                        [
                            6.63811767134785,
                            46.7756160741715
                        ],
                        [
                            6.63813387005048,
                            46.7756274327754
                        ],
                        [
                            6.63793024971224,
                            46.7757511370858
                        ],
                        [
                            6.63791835620383,
                            46.7757584303125
                        ],
                        [
                            6.6378809630975,
                            46.7757811072876
                        ],
                        [
                            6.63787913741628,
                            46.7757805904253
                        ],
                        [
                            6.63787727163097,
                            46.7757801369734
                        ],
                        [
                            6.63787536562723,
                            46.7757797546178
                        ],
                        [
                            6.63787344576779,
                            46.7757794440928
                        ],
                        [
                            6.63787149766035,
                            46.7757792058464
                        ],
                        [
                            6.63786953663517,
                            46.775779030103
                        ],
                        [
                            6.63786756082447,
                            46.7757789349687
                        ],
                        [
                            6.63786558407462,
                            46.7757789029706
                        ],
                        [
                            6.6378636061161,
                            46.775778952226
                        ],
                        [
                            6.63786164001247,
                            46.7757790641584
                        ],
                        [
                            6.63785967349928,
                            46.7757792573498
                        ],
                        [
                            6.63785773161868,
                            46.775779513857
                        ],
                        [
                            6.63785581490849,
                            46.7757798512538
                        ],
                        [
                            6.63785392296969,
                            46.7757802426332
                        ],
                        [
                            6.63785206977812,
                            46.7757807155466
                        ],
                        [
                            6.6378502548123,
                            46.7757812513221
                        ],
                        [
                            6.63784847806409,
                            46.7757818505087
                        ],
                        [
                            6.63784675311847,
                            46.7757825132018
                        ],
                        [
                            6.63784507917631,
                            46.7757832393958
                        ],
                        [
                            6.63784347062996,
                            46.7757840286426
                        ],
                        [
                            6.63784191242678,
                            46.7757848720515
                        ],
                        [
                            6.63784043252777,
                            46.775785770368
                        ],
                        [
                            6.63773321463193,
                            46.7758546458964
                        ],
                        [
                            6.63772158050614,
                            46.7758621210186
                        ],
                        [
                            6.63769196640762,
                            46.7758811644705
                        ],
                        [
                            6.63766552521732,
                            46.775898160761
                        ],
                        [
                            6.63762731746288,
                            46.7759227212751
                        ],
                        [
                            6.63760100728762,
                            46.775939718471
                        ],
                        [
                            6.6374849249819,
                            46.7760146492244
                        ],
                        [
                            6.6374721008374,
                            46.7760229252884
                        ],
                        [
                            6.63744512939094,
                            46.7760403674902
                        ],
                        [
                            6.63726915000792,
                            46.7761542794557
                        ],
                        [
                            6.63724534924339,
                            46.7761697650486
                        ],
                        [
                            6.63723530159576,
                            46.7761762612999
                        ],
                        [
                            6.63712239526379,
                            46.7762488744277
                        ],
                        [
                            6.6371033553304,
                            46.7762612450931
                        ],
                        [
                            6.63702865776985,
                            46.7763092983444
                        ],
                        [
                            6.63695554510206,
                            46.7763563727184
                        ],
                        [
                            6.63695299281029,
                            46.7763580640266
                        ],
                        [
                            6.63695051803153,
                            46.7763598096882
                        ],
                        [
                            6.63694812155679,
                            46.7763616102578
                        ],
                        [
                            6.63694580193492,
                            46.776363455842
                        ],
                        [
                            6.636943561547,
                            46.7763653475558
                        ],
                        [
                            6.63694139801203,
                            46.7763672842843
                        ],
                        [
                            6.63693932583686,
                            46.7763692578933
                        ],
                        [
                            6.63693734475993,
                            46.7763712859514
                        ],
                        [
                            6.63693545437453,
                            46.7763733421003
                        ],
                        [
                            6.63693364244034,
                            46.776375443275
                        ],
                        [
                            6.63693193465203,
                            46.7763775814203
                        ],
                        [
                            6.63693031757166,
                            46.7763797465584
                        ],
                        [
                            6.63692879264213,
                            46.7763819491318
                        ],
                        [
                            6.63692737106758,
                            46.776384188121
                        ],
                        [
                            6.63692604112277,
                            46.7763864458736
                        ],
                        [
                            6.6369248154629,
                            46.7763887312635
                        ],
                        [
                            6.63692368130194,
                            46.776391044201
                        ],
                        [
                            6.63692265155678,
                            46.7763933759916
                        ],
                        [
                            6.6369217254365,
                            46.7763957260807
                        ],
                        [
                            6.63692090439215,
                            46.7763981043619
                        ],
                        [
                            6.63692018790264,
                            46.776400492163
                        ],
                        [
                            6.63691956317377,
                            46.7764028899434
                        ],
                        [
                            6.63691905565496,
                            46.7764053061178
                        ],
                        [
                            6.63691865362098,
                            46.7764077230337
                        ],
                        [
                            6.63691835520376,
                            46.7764101587971
                        ],
                        [
                            6.63691816160309,
                            46.7764125865123
                        ],
                        [
                            6.63691807335647,
                            46.7764150237531
                        ],
                        [
                            6.63691808899646,
                            46.7764174617242
                        ],
                        [
                            6.63691821012136,
                            46.7764199004367
                        ],
                        [
                            6.63691844884891,
                            46.7764223311909
                        ],
                        [
                            6.63691877948438,
                            46.776424762042
                        ],
                        [
                            6.63691922785338,
                            46.7764271761505
                        ],
                        [
                            6.63691976812212,
                            46.776429590905
                        ],
                        [
                            6.63692042613258,
                            46.7764319883679
                        ],
                        [
                            6.63692117630449,
                            46.7764343689084
                        ],
                        [
                            6.63692204502544,
                            46.776436731614
                        ],
                        [
                            6.63692300510872,
                            46.7764390773915
                        ],
                        [
                            6.63692407014774,
                            46.7764414057876
                        ],
                        [
                            6.63692522748724,
                            46.7764437079282
                        ],
                        [
                            6.63692648991328,
                            46.7764459839031
                        ],
                        [
                            6.63692785742591,
                            46.7764482337123
                        ],
                        [
                            6.63692931724724,
                            46.7764504567169
                        ],
                        [
                            6.63693086856995,
                            46.7764526534605
                        ],
                        [
                            6.63693252604006,
                            46.7764548064756
                        ],
                        [
                            6.6369342622337,
                            46.7764569325907
                        ],
                        [
                            6.63693610378376,
                            46.7764590144227
                        ],
                        [
                            6.63693802404103,
                            46.7764610704526
                        ],
                        [
                            6.63694003701587,
                            46.7764630722276
                        ],
                        [
                            6.63694214161478,
                            46.7764650395061
                        ],
                        [
                            6.63684688429839,
                            46.7765571178833
                        ],
                        [
                            6.63684468109409,
                            46.7765556001454
                        ],
                        [
                            6.63684241155991,
                            46.7765541357499
                        ],
                        [
                            6.63684007569582,
                            46.7765527246967
                        ],
                        [
                            6.63683767349365,
                            46.7765513675347
                        ],
                        [
                            6.63683520482256,
                            46.7765500730483
                        ],
                        [
                            6.63683266982974,
                            46.7765488313551
                        ],
                        [
                            6.63683006849883,
                            46.7765476435532
                        ],
                        [
                            6.63682742707028,
                            46.7765465186122
                        ],
                        [
                            6.63682471917278,
                            46.7765454563466
                        ],
                        [
                            6.63682197118582,
                            46.7765444563928
                        ],
                        [
                            6.6368191703151,
                            46.77654351921
                        ],
                        [
                            6.63681632855575,
                            46.7765426443335
                        ],
                        [
                            6.63681344669874,
                            46.7765418323177
                        ],
                        [
                            6.63681052460501,
                            46.776541092496
                        ],
                        [
                            6.63680757507701,
                            46.7765404238601
                        ],
                        [
                            6.63680458545129,
                            46.776539818085
                        ],
                        [
                            6.63680156865295,
                            46.7765392659275
                        ],
                        [
                            6.63679852520305,
                            46.7765387860595
                        ],
                        [
                            6.63679545431885,
                            46.7765383773773
                        ],
                        [
                            6.63679238235523,
                            46.7765380411645
                        ],
                        [
                            6.63678928295726,
                            46.7765377761375
                        ],
                        [
                            6.63678616889464,
                            46.7765375834842
                        ],
                        [
                            6.63678305469073,
                            46.7765374539727
                        ],
                        [
                            6.63677992570766,
                            46.7765374045211
                        ],
                        [
                            6.63677680923032,
                            46.7765374276343
                        ],
                        [
                            6.6367736910134,
                            46.776537513878
                        ],
                        [
                            6.63677057239343,
                            46.7765376808317
                        ],
                        [
                            6.63676746561906,
                            46.7765379110114
                        ],
                        [
                            6.63676438401377,
                            46.776538222081
                        ],
                        [
                            6.63676131425403,
                            46.7765385963765
                        ],
                        [
                            6.63675825620902,
                            46.7765390426822
                        ],
                        [
                            6.63675522426303,
                            46.7765395610992
                        ],
                        [
                            6.63675222960387,
                            46.7765401517062
                        ],
                        [
                            6.63674927369077,
                            46.7765408238476
                        ],
                        [
                            6.63674634255647,
                            46.7765415494227
                        ],
                        [
                            6.63674346308512,
                            46.7765423478379
                        ],
                        [
                            6.63674060904448,
                            46.7765432095745
                        ],
                        [
                            6.63673780601485,
                            46.7765441342635
                        ],
                        [
                            6.63673505384903,
                            46.7765451317871
                        ],
                        [
                            6.63673234084632,
                            46.7765461828455
                        ],
                        [
                            6.63672967963736,
                            46.7765472979598
                        ],
                        [
                            6.63672708222547,
                            46.7765484761164
                        ],
                        [
                            6.63672453675456,
                            46.7765497084467
                        ],
                        [
                            6.63672205587167,
                            46.7765510043739
                        ],
                        [
                            6.63671963984669,
                            46.7765523457807
                        ],
                        [
                            6.63671728761057,
                            46.7765537507787
                        ],
                        [
                            6.63671501368671,
                            46.7765552101359
                        ],
                        [
                            6.63671280462075,
                            46.7765567149726
                        ],
                        [
                            6.63642267981806,
                            46.7767909078609
                        ],
                        [
                            6.63623619125755,
                            46.7769418970133
                        ],
                        [
                            6.63608814259092,
                            46.77706158056
                        ],
                        [
                            6.63598913470815,
                            46.7771415776062
                        ],
                        [
                            6.63585022976724,
                            46.7772538584224
                        ],
                        [
                            6.63584652587546,
                            46.7772563964992
                        ],
                        [
                            6.63584289963589,
                            46.777258979597
                        ],
                        [
                            6.63583935104033,
                            46.7772616082647
                        ],
                        [
                            6.63583587994963,
                            46.7772642918355
                        ],
                        [
                            6.63583248731028,
                            46.7772670204329
                        ],
                        [
                            6.63582917230678,
                            46.7772697951493
                        ],
                        [
                            6.63582593508651,
                            46.7772726061025
                        ],
                        [
                            6.63582277617843,
                            46.7772754714155
                        ],
                        [
                            6.63581970783165,
                            46.7772783736043
                        ],
                        [
                            6.63581671793624,
                            46.7772813208198
                        ],
                        [
                            6.63581381859396,
                            46.7772843054601
                        ],
                        [
                            6.63581101062854,
                            46.7772873258838
                        ],
                        [
                            6.63580828029899,
                            46.7772903924267
                        ],
                        [
                            6.63580564146913,
                            46.7772934865178
                        ],
                        [
                            6.63580314675451,
                            46.777296563504
                        ],
                        [
                            6.63580074353962,
                            46.7772996680386
                        ],
                        [
                            6.63579841809983,
                            46.777302809359
                        ],
                        [
                            6.6357961841598,
                            46.7773059782279
                        ],
                        [
                            6.63579405436658,
                            46.7773091840682
                        ],
                        [
                            6.63579200262692,
                            46.7773124080281
                        ],
                        [
                            6.63579004238703,
                            46.7773156595363
                        ],
                        [
                            6.63578817363873,
                            46.7773189391419
                        ],
                        [
                            6.63578640918467,
                            46.7773222458369
                        ],
                        [
                            6.63578472276786,
                            46.7773255717495
                        ],
                        [
                            6.63578314063713,
                            46.7773289253004
                        ],
                        [
                            6.63578164947732,
                            46.7773322882768
                        ],
                        [
                            6.63578026340276,
                            46.7773356788972
                        ],
                        [
                            6.63578013988008,
                            46.7773387094312
                        ],
                        [
                            6.63578013369198,
                            46.7773417501254
                        ],
                        [
                            6.63578021954436,
                            46.7773447821333
                        ],
                        [
                            6.63578042286239,
                            46.7773478155171
                        ],
                        [
                            6.63578071808992,
                            46.7773508489988
                        ],
                        [
                            6.63578113172145,
                            46.7773538745288
                        ],
                        [
                            6.63578163672542,
                            46.7773568825828
                        ],
                        [
                            6.63578224640882,
                            46.7773598919227
                        ],
                        [
                            6.63578296091909,
                            46.7773628926664
                        ],
                        [
                            6.63578378118636,
                            46.7773658760352
                        ],
                        [
                            6.63578470561239,
                            46.777368842018
                        ],
                        [
                            6.63578573578729,
                            46.777371791175
                        ],
                        [
                            6.63578685720368,
                            46.77737473164
                        ],
                        [
                            6.63578808370904,
                            46.7773776459405
                        ],
                        [
                            6.63578941517231,
                            46.7773805428605
                        ],
                        [
                            6.63579081443842,
                            46.7773833414255
                        ],
                        [
                            6.63579231786334,
                            46.7773861226045
                        ],
                        [
                            6.635793913591,
                            46.7773888775289
                        ],
                        [
                            6.63579558803599,
                            46.7773916061029
                        ],
                        [
                            6.63579736836913,
                            46.777394308518
                        ],
                        [
                            6.6357992402059,
                            46.7773969846728
                        ],
                        [
                            6.63580119089919,
                            46.7773996251442
                        ],
                        [
                            6.6358032338953,
                            46.7774022393609
                        ],
                        [
                            6.63580536946439,
                            46.7774048092056
                        ],
                        [
                            6.63580758375085,
                            46.7774073527001
                        ],
                        [
                            6.63580989047932,
                            46.7774098606066
                        ],
                        [
                            6.63581227605617,
                            46.7774123333788
                        ],
                        [
                            6.63581475340692,
                            46.7774147617733
                        ],
                        [
                            6.63581729775813,
                            46.7774171456158
                        ],
                        [
                            6.63581993374403,
                            46.7774194944139
                        ],
                        [
                            6.63582264939387,
                            46.777421806985
                        ],
                        [
                            6.63582543136787,
                            46.7774240667634
                        ],
                        [
                            6.63569917608639,
                            46.7775485812675
                        ],
                        [
                            6.63569692818018,
                            46.7775465234593
                        ],
                        [
                            6.63569458770101,
                            46.777544510023
                        ],
                        [
                            6.63569216824251,
                            46.7775425405051
                        ],
                        [
                            6.63568966965734,
                            46.7775406247878
                        ],
                        [
                            6.63568709208468,
                            46.777538753538
                        ],
                        [
                            6.63568443472539,
                            46.77753692675
                        ],
                        [
                            6.63568171170199,
                            46.7775351620933
                        ],
                        [
                            6.63567890875276,
                            46.7775334512317
                        ],
                        [
                            6.63567605225763,
                            46.7775317938016
                        ],
                        [
                            6.63567311663579,
                            46.7775301901722
                        ],
                        [
                            6.6356701154809,
                            46.77752863989
                        ],
                        [
                            6.63566704706359,
                            46.7775271517278
                        ],
                        [
                            6.63566392576033,
                            46.7775257263361
                        ],
                        [
                            6.63566075077193,
                            46.7775243637092
                        ],
                        [
                            6.63565752290572,
                            46.7775230633035
                        ],
                        [
                            6.63565422856803,
                            46.7775218255727
                        ],
                        [
                            6.6356508933315,
                            46.7775206506966
                        ],
                        [
                            6.6356475187944,
                            46.7775195386865
                        ],
                        [
                            6.63564409058033,
                            46.7775184888922
                        ],
                        [
                            6.63564062213546,
                            46.7775175107424
                        ],
                        [
                            6.63563711345165,
                            46.7775166047861
                        ],
                        [
                            6.63563356387711,
                            46.7775157611356
                        ],
                        [
                            6.63562998765723,
                            46.7775149892253
                        ],
                        [
                            6.63562638399282,
                            46.7775142890495
                        ],
                        [
                            6.63562275288391,
                            46.7775136606083
                        ],
                        [
                            6.63561909526063,
                            46.7775130951231
                        ],
                        [
                            6.63561540925443,
                            46.7775126106999
                        ],
                        [
                            6.6356117103275,
                            46.7775121887795
                        ],
                        [
                            6.63560799661126,
                            46.7775118474677
                        ],
                        [
                            6.63560426835956,
                            46.7775115697454
                        ],
                        [
                            6.63560053971129,
                            46.777511372184
                        ],
                        [
                            6.63559679652758,
                            46.7775112382121
                        ],
                        [
                            6.63559306492624,
                            46.7775111850345
                        ],
                        [
                            6.63558932040408,
                            46.7775111943596
                        ],
                        [
                            6.63558558665692,
                            46.7775112850225
                        ],
                        [
                            6.635581852636,
                            46.7775114476112
                        ],
                        [
                            6.63557811674296,
                            46.7775116821145
                        ],
                        [
                            6.63557440693968,
                            46.7775119892783
                        ],
                        [
                            6.63557070819801,
                            46.7775123585646
                        ],
                        [
                            6.63556702182139,
                            46.7775128097489
                        ],
                        [
                            6.63556336075168,
                            46.7775133324901
                        ],
                        [
                            6.63555972511178,
                            46.777513918553
                        ],
                        [
                            6.63555610118516,
                            46.7775145766262
                        ],
                        [
                            6.63555251533534,
                            46.7775153074443
                        ],
                        [
                            6.63554895479241,
                            46.7775161098193
                        ],
                        [
                            6.63554544605098,
                            46.7775169757018
                        ],
                        [
                            6.63554196180908,
                            46.7775179136846
                        ],
                        [
                            6.63553851578317,
                            46.7775189150791
                        ],
                        [
                            6.63553510864141,
                            46.7775199886752
                        ],
                        [
                            6.63553175251011,
                            46.7775211252241
                        ],
                        [
                            6.63552844737291,
                            46.7775223258239
                        ],
                        [
                            6.63552518126722,
                            46.777523588743
                        ],
                        [
                            6.63552197974109,
                            46.7775249158087
                        ],
                        [
                            6.63551882935646,
                            46.7775262970431
                        ],
                        [
                            6.63551574342849,
                            46.777527750659
                        ],
                        [
                            6.63551270944116,
                            46.7775292584494
                        ],
                        [
                            6.63550974017259,
                            46.777530821053
                        ],
                        [
                            6.63550684748711,
                            46.7775324467896
                        ],
                        [
                            6.63550400767243,
                            46.7775341179219
                        ],
                        [
                            6.63550124523176,
                            46.7775358527419
                        ],
                        [
                            6.63540675127659,
                            46.7776115626567
                        ],
                        [
                            6.6351364657933,
                            46.7778317683661
                        ],
                        [
                            6.63505945005889,
                            46.7778944674222
                        ],
                        [
                            6.63507931315805,
                            46.7779059423203
                        ],
                        [
                            6.63506579340885,
                            46.7779169118856
                        ],
                        [
                            6.63504325538068,
                            46.7779354647791
                        ],
                        [
                            6.63472959011063,
                            46.7781403403033
                        ],
                        [
                            6.63407642965426,
                            46.7786307810057
                        ],
                        [
                            6.63408175187147,
                            46.7786514190256
                        ],
                        [
                            6.6340788621031,
                            46.7786782963786
                        ],
                        [
                            6.63405181607232,
                            46.7787355897082
                        ],
                        [
                            6.63401362723905,
                            46.7788024301346
                        ],
                        [
                            6.63398602677087,
                            46.7788442462558
                        ],
                        [
                            6.63376063319366,
                            46.7791528353818
                        ],
                        [
                            6.63356238026268,
                            46.7793889289376
                        ],
                        [
                            6.63352711164129,
                            46.779420714262
                        ],
                        [
                            6.63350808969636,
                            46.7794378432347
                        ],
                        [
                            6.63345921361815,
                            46.7794837374204
                        ],
                        [
                            6.6334098261115,
                            46.7795288181
                        ],
                        [
                            6.63335848491073,
                            46.7795731656864
                        ],
                        [
                            6.63332743708527,
                            46.7795914780721
                        ],
                        [
                            6.63328776338767,
                            46.7795999237423
                        ],
                        [
                            6.63324589250954,
                            46.7795977393043
                        ],
                        [
                            6.63320928503799,
                            46.7795850663868
                        ],
                        [
                            6.63304780614004,
                            46.7797261516129
                        ],
                        [
                            6.63304855470385,
                            46.779729539158
                        ],
                        [
                            6.63304919750532,
                            46.7797329440753
                        ],
                        [
                            6.63304973561467,
                            46.7797363482532
                        ],
                        [
                            6.63305015597399,
                            46.7797397697187
                        ],
                        [
                            6.63305048442801,
                            46.779743190535
                        ],
                        [
                            6.63305070818988,
                            46.779746610612
                        ],
                        [
                            6.6330508143331,
                            46.7797500391924
                        ],
                        [
                            6.63305082857918,
                            46.7797534665747
                        ],
                        [
                            6.63305073799339,
                            46.7797569025507
                        ],
                        [
                            6.63305052940872,
                            46.7797603190251
                        ],
                        [
                            6.63305021678311,
                            46.7797637446478
                        ],
                        [
                            6.63304981159256,
                            46.7797671602826
                        ],
                        [
                            6.63304928892292,
                            46.7797705750877
                        ],
                        [
                            6.6330486618321,
                            46.7797739710361
                        ],
                        [
                            6.63304793004895,
                            46.779777366245
                        ],
                        [
                            6.63304709384466,
                            46.7797807425972
                        ],
                        [
                            6.63304616652575,
                            46.7797841188549
                        ],
                        [
                            6.63304512133929,
                            46.7797874668267
                        ],
                        [
                            6.63304397079274,
                            46.7797908052694
                        ],
                        [
                            6.63304272941093,
                            46.7797941249512
                        ],
                        [
                            6.63304138387895,
                            46.7797974076589
                        ],
                        [
                            6.63303994763498,
                            46.7798006633707
                        ],
                        [
                            6.63303840603901,
                            46.7798039090042
                        ],
                        [
                            6.63303677294002,
                            46.7798071270871
                        ],
                        [
                            6.63303503635855,
                            46.7798103169857
                        ],
                        [
                            6.63303319467976,
                            46.7798134797867
                        ],
                        [
                            6.63303126216564,
                            46.7798166238269
                        ],
                        [
                            6.6330292382881,
                            46.7798197309833
                        ],
                        [
                            6.63302712290745,
                            46.7798228105891
                        ],
                        [
                            6.63302490403604,
                            46.7798258625595
                        ],
                        [
                            6.63302259300199,
                            46.7798288776405
                        ],
                        [
                            6.63302019125579,
                            46.7798318657254
                        ],
                        [
                            6.63301769828578,
                            46.7798348075934
                        ],
                        [
                            6.63301512739867,
                            46.7798377220067
                        ],
                        [
                            6.63301245235301,
                            46.7798405999948
                        ],
                        [
                            6.63300969887039,
                            46.7798434318562
                        ],
                        [
                            6.63300685480701,
                            46.7798462279374
                        ],
                        [
                            6.63300393310585,
                            46.7798489778975
                        ],
                        [
                            6.63300092017266,
                            46.7798516821897
                        ],
                        [
                            6.63299782865458,
                            46.7798543502373
                        ],
                        [
                            6.63292645795689,
                            46.7799157381394
                        ],
                        [
                            6.63264764570288,
                            46.7801529702968
                        ],
                        [
                            6.63266596297633,
                            46.7801628149361
                        ],
                        [
                            6.6325926028535,
                            46.7802258077765
                        ],
                        [
                            6.63258384678056,
                            46.780233392768
                        ],
                        [
                            6.63247360775043,
                            46.7803280603475
                        ],
                        [
                            6.63244137214991,
                            46.7803557196684
                        ],
                        [
                            6.63242890221969,
                            46.7803664267539
                        ],
                        [
                            6.63231057046276,
                            46.7804680540653
                        ],
                        [
                            6.63226705482583,
                            46.7805056194947
                        ],
                        [
                            6.63216996351313,
                            46.7805879653077
                        ],
                        [
                            6.63214594953768,
                            46.7806087561846
                        ],
                        [
                            6.63204820601498,
                            46.7806909171899
                        ],
                        [
                            6.63203227610722,
                            46.7807052884038
                        ],
                        [
                            6.6320267000505,
                            46.7807103761683
                        ],
                        [
                            6.63200203412589,
                            46.7807309823107
                        ],
                        [
                            6.63191860496807,
                            46.7808016404335
                        ],
                        [
                            6.63190414156,
                            46.7808143122042
                        ],
                        [
                            6.63187814813702,
                            46.7808360784459
                        ],
                        [
                            6.63184538440643,
                            46.7808640040071
                        ],
                        [
                            6.63183039804292,
                            46.7808765820225
                        ],
                        [
                            6.63168950604082,
                            46.7809979303219
                        ],
                        [
                            6.63167504172691,
                            46.7810106020576
                        ],
                        [
                            6.63150060877465,
                            46.7811592398024
                        ],
                        [
                            6.63163256221448,
                            46.7812235951785
                        ],
                        [
                            6.63165450785036,
                            46.7812098063133
                        ],
                        [
                            6.63168238452901,
                            46.7812021771177
                        ],
                        [
                            6.63171065118038,
                            46.781203456555
                        ],
                        [
                            6.63173787654368,
                            46.7812130953154
                        ],
                        [
                            6.6319498902346,
                            46.7813093217457
                        ],
                        [
                            6.63222212757116,
                            46.7814328718428
                        ],
                        [
                            6.63254549606424,
                            46.7815788222122
                        ],
                        [
                            6.63267138141755,
                            46.7816367011561
                        ],
                        [
                            6.63268101844624,
                            46.7816411321416
                        ],
                        [
                            6.63303312732947,
                            46.7818006885662
                        ],
                        [
                            6.63338940568208,
                            46.7819618024744
                        ],
                        [
                            6.63353119158024,
                            46.7820257747952
                        ],
                        [
                            6.63392546601587,
                            46.7822033477362
                        ],
                        [
                            6.63420940273909,
                            46.7823332722584
                        ],
                        [
                            6.63432190569908,
                            46.7823851623813
                        ],
                        [
                            6.63481355574685,
                            46.7826107374271
                        ],
                        [
                            6.63481609084726,
                            46.7826119879483
                        ],
                        [
                            6.6348185594771,
                            46.7826133005948
                        ],
                        [
                            6.63482096189057,
                            46.7826146583473
                        ],
                        [
                            6.6348232978417,
                            46.7826160776759
                        ],
                        [
                            6.63482556743705,
                            46.7826175514437
                        ],
                        [
                            6.6348277580449,
                            46.7826190691293
                        ],
                        [
                            6.6348298823134,
                            46.7826206401559
                        ],
                        [
                            6.63483192757798,
                            46.7826222561985
                        ],
                        [
                            6.63483389292465,
                            46.7826239249374
                        ],
                        [
                            6.6348357794068,
                            46.7826256293589
                        ],
                        [
                            6.63483757409754,
                            46.7826273787062
                        ],
                        [
                            6.63483928900151,
                            46.7826291719658
                        ],
                        [
                            6.63484091146242,
                            46.7826310002632
                        ],
                        [
                            6.63484245505879,
                            46.7826328642434
                        ],
                        [
                            6.63484389341633,
                            46.7826347637205
                        ],
                        [
                            6.63484525304868,
                            46.782636689547
                        ],
                        [
                            6.63484650745043,
                            46.7826386503214
                        ],
                        [
                            6.63484768232775,
                            46.7826406374398
                        ],
                        [
                            6.63484873930986,
                            46.7826426511808
                        ],
                        [
                            6.63484971676755,
                            46.7826446912656
                        ],
                        [
                            6.63485059006434,
                            46.7826467481867
                        ],
                        [
                            6.63485135758539,
                            46.7826488230306
                        ],
                        [
                            6.63485202094549,
                            46.7826509147108
                        ],
                        [
                            6.63485259132558,
                            46.782653023855
                        ],
                        [
                            6.6348530576759,
                            46.7826551410512
                        ],
                        [
                            6.63485341918901,
                            46.7826572668428
                        ],
                        [
                            6.63485368786141,
                            46.7826594007653
                        ],
                        [
                            6.63485383971649,
                            46.7826615426497
                        ],
                        [
                            6.63485389886202,
                            46.7826636838809
                        ],
                        [
                            6.63485384131315,
                            46.7826658248388
                        ],
                        [
                            6.63485369106294,
                            46.7826679645944
                        ],
                        [
                            6.63485339868684,
                            46.7826700407548
                        ],
                        [
                            6.6348530008136,
                            46.7826721161718
                        ],
                        [
                            6.63485249851299,
                            46.7826741727338
                        ],
                        [
                            6.63485190444135,
                            46.7826762193149
                        ],
                        [
                            6.63485120660216,
                            46.7826782563797
                        ],
                        [
                            6.63485041725428,
                            46.7826802658954
                        ],
                        [
                            6.6348495361271,
                            46.7826822659793
                        ],
                        [
                            6.63484855057252,
                            46.782684247208
                        ],
                        [
                            6.63484747364856,
                            46.7826861915545
                        ],
                        [
                            6.63484630494531,
                            46.7826881264692
                        ],
                        [
                            6.63484504567193,
                            46.7826900245071
                        ],
                        [
                            6.63484369568081,
                            46.7826918955506
                        ],
                        [
                            6.63484225352927,
                            46.7826937291571
                        ],
                        [
                            6.63484072065998,
                            46.7826955357691
                        ],
                        [
                            6.63483751416465,
                            46.7826988866449
                        ],
                        [
                            6.63477011183799,
                            46.7827663307682
                        ],
                        [
                            6.63466204699146,
                            46.7828731605881
                        ],
                        [
                            6.63462975241821,
                            46.7829046882863
                        ],
                        [
                            6.63456236569785,
                            46.7829710529321
                        ],
                        [
                            6.6345169046484,
                            46.7830160722669
                        ],
                        [
                            6.63437575371258,
                            46.7831547835371
                        ],
                        [
                            6.6342766936782,
                            46.7832548394984
                        ],
                        [
                            6.6344397160212,
                            46.7832914328953
                        ],
                        [
                            6.63444029850233,
                            46.783293640959
                        ],
                        [
                            6.63444099874096,
                            46.7832958317336
                        ],
                        [
                            6.63444179115357,
                            46.7832980055878
                        ],
                        [
                            6.63444268933527,
                            46.7833001620685
                        ],
                        [
                            6.63444370447529,
                            46.7833023012545
                        ],
                        [
                            6.63444481286743,
                            46.7833044048595
                        ],
                        [
                            6.63444602542203,
                            46.7833064916287
                        ],
                        [
                            6.63444734401645,
                            46.783308542907
                        ],
                        [
                            6.63444875412512,
                            46.7833105679261
                        ],
                        [
                            6.63445026946619,
                            46.7833125579977
                        ],
                        [
                            6.63445186461196,
                            46.7833145030593
                        ],
                        [
                            6.63445355153449,
                            46.7833164042935
                        ],
                        [
                            6.63445534449688,
                            46.7833182700367
                        ],
                        [
                            6.63445720286962,
                            46.7833200912175
                        ],
                        [
                            6.63445916647483,
                            46.7833218774508
                        ],
                        [
                            6.63446121001599,
                            46.7833236098899
                        ],
                        [
                            6.63446333254624,
                            46.7833252984113
                        ],
                        [
                            6.63446553408199,
                            46.7833269419171
                        ],
                        [
                            6.63446781567673,
                            46.7833285233935
                        ],
                        [
                            6.63447017626879,
                            46.7833300604033
                        ],
                        [
                            6.63500299939187,
                            46.7836668441113
                        ],
                        [
                            6.63500510161907,
                            46.7836681278166
                        ],
                        [
                            6.63500725741561,
                            46.7836693569925
                        ],
                        [
                            6.63500949220125,
                            46.7836705422504
                        ],
                        [
                            6.63501176708401,
                            46.7836716651971
                        ],
                        [
                            6.63501412124274,
                            46.7836727250104
                        ],
                        [
                            6.63501651602732,
                            46.7836737406354
                        ],
                        [
                            6.63501896384426,
                            46.783674684157
                        ],
                        [
                            6.63502145161891,
                            46.7836755747005
                        ],
                        [
                            6.63502399322519,
                            46.7836763931464
                        ],
                        [
                            6.63502657479735,
                            46.7836771580651
                        ],
                        [
                            6.63502919727398,
                            46.7836778601291
                        ],
                        [
                            6.63503185918776,
                            46.7836784905431
                        ],
                        [
                            6.63503454841903,
                            46.7836790580067
                        ],
                        [
                            6.63503725137251,
                            46.7836795629733
                        ],
                        [
                            6.63503999536159,
                            46.783679996301
                        ],
                        [
                            6.63504275322043,
                            46.7836803572494
                        ],
                        [
                            6.63504553838851,
                            46.7836806557965
                        ],
                        [
                            6.63504832449923,
                            46.7836808912074
                        ],
                        [
                            6.63505112446328,
                            46.783681055337
                        ],
                        [
                            6.63505392550931,
                            46.7836811469974
                        ],
                        [
                            6.63505674121606,
                            46.783681166833
                        ],
                        [
                            6.6350595570662,
                            46.7836811235268
                        ],
                        [
                            6.6350623612023,
                            46.7836810082103
                        ],
                        [
                            6.63506515362433,
                            46.7836808208833
                        ],
                        [
                            6.63506794698075,
                            46.7836805709691
                        ],
                        [
                            6.63507071490494,
                            46.783680257733
                        ],
                        [
                            6.63507347125438,
                            46.7836798631532
                        ],
                        [
                            6.63507620123302,
                            46.783679414579
                        ],
                        [
                            6.63507890764016,
                            46.7836788851258
                        ],
                        [
                            6.63508158768469,
                            46.7836783011291
                        ],
                        [
                            6.6350842296403,
                            46.7836776449362
                        ],
                        [
                            6.63508684695468,
                            46.783676925976
                        ],
                        [
                            6.63508941167097,
                            46.7836761429534
                        ],
                        [
                            6.63509193895006,
                            46.7836752976224
                        ],
                        [
                            6.63509442788613,
                            46.7836743971144
                        ],
                        [
                            6.63509685155107,
                            46.7836734247679
                        ],
                        [
                            6.63509923765585,
                            46.7836723983481
                        ],
                        [
                            6.63510155823539,
                            46.783671317109
                        ],
                        [
                            6.63510382860634,
                            46.7836701723734
                        ],
                        [
                            6.63510604609229,
                            46.7836689827908
                        ],
                        [
                            6.6351081861956,
                            46.7836677295203
                        ],
                        [
                            6.63511026223282,
                            46.7836664307749
                        ],
                        [
                            6.63524411893224,
                            46.7837431515024
                        ],
                        [
                            6.63532043110814,
                            46.7837868906667
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "70",
                "nomsquart": "Quartier 4",
                "character": "2",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [
        {
            "id": "46",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64116439963354,
                    46.7799326878571
                ]
            }
        },
        {
            "id": "47",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63804918169705,
                    46.7808199135915
                ]
            }
        },
        {
            "id": "48",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64173202717023,
                    46.774764940858
                ]
            }
        },
        {
            "id": "49",
            "type": "Feature",
            "properties": {
                "type": "affiche",
                "name": "Placarder une affiche de la resistance",
                "description": "Vise à saboter la campagne d'affichage de la mafia",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.638277,
                    46.779019
                ]
            }
        },
        {
            "id": "50",
            "type": "Feature",
            "properties": {
                "type": "affiche",
                "name": "Placarder une affiche de la resistance",
                "description": "Vise à saboter la campagne d'affichage de la mafia",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.642084,
                    46.778156
                ]
            }
        },
        {
            "id": "51",
            "type": "Feature",
            "properties": {
                "type": "affiche",
                "name": "Placarder une affiche de la resistance",
                "description": "Vise à saboter la campagne d'affichage de la mafia",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.640830338001251,
                    46.77759379132261
                ]
            }
        },
        {
            "id": "52",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64476841168727,
                    46.7736449552019
                ]
            }
        },
        {
            "id": "53",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64385630474514,
                    46.7773970077788
                ]
            }
        },
        {
            "id": "54",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64735202288094,
                    46.7767195414461
                ]
            }
        },
        {
            "id": "55",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64645890117389,
                    46.7797775304184
                ]
            }
        },
        {
            "id": "56",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63317426015192,
                    46.7807792067148
                ]
            }
        },
        {
            "id": "57",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64369273526751,
                    46.7805196099554
                ]
            }
        },
        {
            "id": "58",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63651335514418,
                    46.7825338223498
                ]
            }
        },
        {
            "id": "59",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63997860833989,
                    46.7802608996626
                ]
            }
        },
        {
            "id": "60",
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64007174937204,
                    46.7762466765479
                ]
            }
        }
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.63304780614004,
                            46.7797261516129
                        ],
                        [
                            6.63320928503799,
                            46.7795850663868
                        ],
                        [
                            6.63324589250954,
                            46.7795977393043
                        ],
                        [
                            6.63328776338767,
                            46.7795999237423
                        ],
                        [
                            6.63332743708527,
                            46.7795914780721
                        ],
                        [
                            6.63335848491073,
                            46.7795731656864
                        ],
                        [
                            6.6334098261115,
                            46.7795288181
                        ],
                        [
                            6.63345921361815,
                            46.7794837374204
                        ],
                        [
                            6.63350808969636,
                            46.7794378432347
                        ],
                        [
                            6.63352711164129,
                            46.779420714262
                        ],
                        [
                            6.63356238026268,
                            46.7793889289376
                        ],
                        [
                            6.63376063319366,
                            46.7791528353818
                        ],
                        [
                            6.63398602677087,
                            46.7788442462558
                        ],
                        [
                            6.63401362723905,
                            46.7788024301346
                        ],
                        [
                            6.63405181607232,
                            46.7787355897082
                        ],
                        [
                            6.6340788621031,
                            46.7786782963786
                        ],
                        [
                            6.63408175187147,
                            46.7786514190256
                        ],
                        [
                            6.63407642965426,
                            46.7786307810057
                        ],
                        [
                            6.63472959011063,
                            46.7781403403033
                        ],
                        [
                            6.63504325538068,
                            46.7779354647791
                        ],
                        [
                            6.63506579340885,
                            46.7779169118856
                        ],
                        [
                            6.63507931315805,
                            46.7779059423203
                        ],
                        [
                            6.63505945005889,
                            46.7778944674222
                        ],
                        [
                            6.6351364657933,
                            46.7778317683661
                        ],
                        [
                            6.63540675127659,
                            46.7776115626567
                        ],
                        [
                            6.63550124523176,
                            46.7775358527419
                        ],
                        [
                            6.63550400767243,
                            46.7775341179219
                        ],
                        [
                            6.63550684748711,
                            46.7775324467896
                        ],
                        [
                            6.63550974017259,
                            46.777530821053
                        ],
                        [
                            6.63551270944116,
                            46.7775292584494
                        ],
                        [
                            6.63551574342849,
                            46.777527750659
                        ],
                        [
                            6.63551882935646,
                            46.7775262970431
                        ],
                        [
                            6.63552197974109,
                            46.7775249158087
                        ],
                        [
                            6.63552518126722,
                            46.777523588743
                        ],
                        [
                            6.63552844737291,
                            46.7775223258239
                        ],
                        [
                            6.63553175251011,
                            46.7775211252241
                        ],
                        [
                            6.63553510864141,
                            46.7775199886752
                        ],
                        [
                            6.63553851578317,
                            46.7775189150791
                        ],
                        [
                            6.63554196180908,
                            46.7775179136846
                        ],
                        [
                            6.63554544605098,
                            46.7775169757018
                        ],
                        [
                            6.63554895479241,
                            46.7775161098193
                        ],
                        [
                            6.63555251533534,
                            46.7775153074443
                        ],
                        [
                            6.63555610118516,
                            46.7775145766262
                        ],
                        [
                            6.63555972511178,
                            46.777513918553
                        ],
                        [
                            6.63556336075168,
                            46.7775133324901
                        ],
                        [
                            6.63556702182139,
                            46.7775128097489
                        ],
                        [
                            6.63557070819801,
                            46.7775123585646
                        ],
                        [
                            6.63557440693968,
                            46.7775119892783
                        ],
                        [
                            6.63557811674296,
                            46.7775116821145
                        ],
                        [
                            6.635581852636,
                            46.7775114476112
                        ],
                        [
                            6.63558558665692,
                            46.7775112850225
                        ],
                        [
                            6.63558932040408,
                            46.7775111943596
                        ],
                        [
                            6.63559306492624,
                            46.7775111850345
                        ],
                        [
                            6.63559679652758,
                            46.7775112382121
                        ],
                        [
                            6.63560053971129,
                            46.777511372184
                        ],
                        [
                            6.63560426835956,
                            46.7775115697454
                        ],
                        [
                            6.63560799661126,
                            46.7775118474677
                        ],
                        [
                            6.6356117103275,
                            46.7775121887795
                        ],
                        [
                            6.63561540925443,
                            46.7775126106999
                        ],
                        [
                            6.63561909526063,
                            46.7775130951231
                        ],
                        [
                            6.63562275288391,
                            46.7775136606083
                        ],
                        [
                            6.63562638399282,
                            46.7775142890495
                        ],
                        [
                            6.63562998765723,
                            46.7775149892253
                        ],
                        [
                            6.63563356387711,
                            46.7775157611356
                        ],
                        [
                            6.63563711345165,
                            46.7775166047861
                        ],
                        [
                            6.63564062213546,
                            46.7775175107424
                        ],
                        [
                            6.63564409058033,
                            46.7775184888922
                        ],
                        [
                            6.6356475187944,
                            46.7775195386865
                        ],
                        [
                            6.6356508933315,
                            46.7775206506966
                        ],
                        [
                            6.63565422856803,
                            46.7775218255727
                        ],
                        [
                            6.63565752290572,
                            46.7775230633035
                        ],
                        [
                            6.63566075077193,
                            46.7775243637092
                        ],
                        [
                            6.63566392576033,
                            46.7775257263361
                        ],
                        [
                            6.63566704706359,
                            46.7775271517278
                        ],
                        [
                            6.6356701154809,
                            46.77752863989
                        ],
                        [
                            6.63567311663579,
                            46.7775301901722
                        ],
                        [
                            6.63567605225763,
                            46.7775317938016
                        ],
                        [
                            6.63567890875276,
                            46.7775334512317
                        ],
                        [
                            6.63568171170199,
                            46.7775351620933
                        ],
                        [
                            6.63568443472539,
                            46.77753692675
                        ],
                        [
                            6.63568709208468,
                            46.777538753538
                        ],
                        [
                            6.63568966965734,
                            46.7775406247878
                        ],
                        [
                            6.63569216824251,
                            46.7775425405051
                        ],
                        [
                            6.63569458770101,
                            46.777544510023
                        ],
                        [
                            6.63569692818018,
                            46.7775465234593
                        ],
                        [
                            6.63569917608639,
                            46.7775485812675
                        ],
                        [
                            6.63582543136787,
                            46.7774240667634
                        ],
                        [
                            6.63582264939387,
                            46.777421806985
                        ],
                        [
                            6.63581993374403,
                            46.7774194944139
                        ],
                        [
                            6.63581729775813,
                            46.7774171456158
                        ],
                        [
                            6.63581475340692,
                            46.7774147617733
                        ],
                        [
                            6.63581227605617,
                            46.7774123333788
                        ],
                        [
                            6.63580989047932,
                            46.7774098606066
                        ],
                        [
                            6.63580758375085,
                            46.7774073527001
                        ],
                        [
                            6.63580536946439,
                            46.7774048092056
                        ],
                        [
                            6.6358032338953,
                            46.7774022393609
                        ],
                        [
                            6.63580119089919,
                            46.7773996251442
                        ],
                        [
                            6.6357992402059,
                            46.7773969846728
                        ],
                        [
                            6.63579736836913,
                            46.777394308518
                        ],
                        [
                            6.63579558803599,
                            46.7773916061029
                        ],
                        [
                            6.635793913591,
                            46.7773888775289
                        ],
                        [
                            6.63579231786334,
                            46.7773861226045
                        ],
                        [
                            6.63579081443842,
                            46.7773833414255
                        ],
                        [
                            6.63578941517231,
                            46.7773805428605
                        ],
                        [
                            6.63578808370904,
                            46.7773776459405
                        ],
                        [
                            6.63578685720368,
                            46.77737473164
                        ],
                        [
                            6.63578573578729,
                            46.777371791175
                        ],
                        [
                            6.63578470561239,
                            46.777368842018
                        ],
                        [
                            6.63578378118636,
                            46.7773658760352
                        ],
                        [
                            6.63578296091909,
                            46.7773628926664
                        ],
                        [
                            6.63578224640882,
                            46.7773598919227
                        ],
                        [
                            6.63578163672542,
                            46.7773568825828
                        ],
                        [
                            6.63578113172145,
                            46.7773538745288
                        ],
                        [
                            6.63578071808992,
                            46.7773508489988
                        ],
                        [
                            6.63578042286239,
                            46.7773478155171
                        ],
                        [
                            6.63578021954436,
                            46.7773447821333
                        ],
                        [
                            6.63578013369198,
                            46.7773417501254
                        ],
                        [
                            6.63578013988008,
                            46.7773387094312
                        ],
                        [
                            6.63578026340276,
                            46.7773356788972
                        ],
                        [
                            6.63578164947732,
                            46.7773322882768
                        ],
                        [
                            6.63578314063713,
                            46.7773289253004
                        ],
                        [
                            6.63578472276786,
                            46.7773255717495
                        ],
                        [
                            6.63578640918467,
                            46.7773222458369
                        ],
                        [
                            6.63578817363873,
                            46.7773189391419
                        ],
                        [
                            6.63579004238703,
                            46.7773156595363
                        ],
                        [
                            6.63579200262692,
                            46.7773124080281
                        ],
                        [
                            6.63579405436658,
                            46.7773091840682
                        ],
                        [
                            6.6357961841598,
                            46.7773059782279
                        ],
                        [
                            6.63579841809983,
                            46.777302809359
                        ],
                        [
                            6.63580074353962,
                            46.7772996680386
                        ],
                        [
                            6.63580314675451,
                            46.777296563504
                        ],
                        [
                            6.63580564146913,
                            46.7772934865178
                        ],
                        [
                            6.63580828029899,
                            46.7772903924267
                        ],
                        [
                            6.63581101062854,
                            46.7772873258838
                        ],
                        [
                            6.63581381859396,
                            46.7772843054601
                        ],
                        [
                            6.63581671793624,
                            46.7772813208198
                        ],
                        [
                            6.63581970783165,
                            46.7772783736043
                        ],
                        [
                            6.63582277617843,
                            46.7772754714155
                        ],
                        [
                            6.63582593508651,
                            46.7772726061025
                        ],
                        [
                            6.63582917230678,
                            46.7772697951493
                        ],
                        [
                            6.63583248731028,
                            46.7772670204329
                        ],
                        [
                            6.63583587994963,
                            46.7772642918355
                        ],
                        [
                            6.63583935104033,
                            46.7772616082647
                        ],
                        [
                            6.63584289963589,
                            46.777258979597
                        ],
                        [
                            6.63584652587546,
                            46.7772563964992
                        ],
                        [
                            6.63585022976724,
                            46.7772538584224
                        ],
                        [
                            6.63598913470815,
                            46.7771415776062
                        ],
                        [
                            6.63608814259092,
                            46.77706158056
                        ],
                        [
                            6.63623619125755,
                            46.7769418970133
                        ],
                        [
                            6.63642267981806,
                            46.7767909078609
                        ],
                        [
                            6.63671280462075,
                            46.7765567149726
                        ],
                        [
                            6.63671501368671,
                            46.7765552101359
                        ],
                        [
                            6.63671728761057,
                            46.7765537507787
                        ],
                        [
                            6.63671963984669,
                            46.7765523457807
                        ],
                        [
                            6.63672205587167,
                            46.7765510043739
                        ],
                        [
                            6.63672453675456,
                            46.7765497084467
                        ],
                        [
                            6.63672708222547,
                            46.7765484761164
                        ],
                        [
                            6.63672967963736,
                            46.7765472979598
                        ],
                        [
                            6.63673234084632,
                            46.7765461828455
                        ],
                        [
                            6.63673505384903,
                            46.7765451317871
                        ],
                        [
                            6.63673780601485,
                            46.7765441342635
                        ],
                        [
                            6.63674060904448,
                            46.7765432095745
                        ],
                        [
                            6.63674346308512,
                            46.7765423478379
                        ],
                        [
                            6.63674634255647,
                            46.7765415494227
                        ],
                        [
                            6.63674927369077,
                            46.7765408238476
                        ],
                        [
                            6.63675222960387,
                            46.7765401517062
                        ],
                        [
                            6.63675522426303,
                            46.7765395610992
                        ],
                        [
                            6.63675825620902,
                            46.7765390426822
                        ],
                        [
                            6.63676131425403,
                            46.7765385963765
                        ],
                        [
                            6.63676438401377,
                            46.776538222081
                        ],
                        [
                            6.63676746561906,
                            46.7765379110114
                        ],
                        [
                            6.63677057239343,
                            46.7765376808317
                        ],
                        [
                            6.6367736910134,
                            46.776537513878
                        ],
                        [
                            6.63677680923032,
                            46.7765374276343
                        ],
                        [
                            6.63677992570766,
                            46.7765374045211
                        ],
                        [
                            6.63678305469073,
                            46.7765374539727
                        ],
                        [
                            6.63678616889464,
                            46.7765375834842
                        ],
                        [
                            6.63678928295726,
                            46.7765377761375
                        ],
                        [
                            6.63679238235523,
                            46.7765380411645
                        ],
                        [
                            6.63679545431885,
                            46.7765383773773
                        ],
                        [
                            6.63679852520305,
                            46.7765387860595
                        ],
                        [
                            6.63680156865295,
                            46.7765392659275
                        ],
                        [
                            6.63680458545129,
                            46.776539818085
                        ],
                        [
                            6.63680757507701,
                            46.7765404238601
                        ],
                        [
                            6.63681052460501,
                            46.776541092496
                        ],
                        [
                            6.63681344669874,
                            46.7765418323177
                        ],
                        [
                            6.63681632855575,
                            46.7765426443335
                        ],
                        [
                            6.6368191703151,
                            46.77654351921
                        ],
                        [
                            6.63682197118582,
                            46.7765444563928
                        ],
                        [
                            6.63682471917278,
                            46.7765454563466
                        ],
                        [
                            6.63682742707028,
                            46.7765465186122
                        ],
                        [
                            6.63683006849883,
                            46.7765476435532
                        ],
                        [
                            6.63683266982974,
                            46.7765488313551
                        ],
                        [
                            6.63683520482256,
                            46.7765500730483
                        ],
                        [
                            6.63683767349365,
                            46.7765513675347
                        ],
                        [
                            6.63684007569582,
                            46.7765527246967
                        ],
                        [
                            6.63684241155991,
                            46.7765541357499
                        ],
                        [
                            6.63684468109409,
                            46.7765556001454
                        ],
                        [
                            6.63684688429839,
                            46.7765571178833
                        ],
                        [
                            6.63694214161478,
                            46.7764650395061
                        ],
                        [
                            6.63694003701587,
                            46.7764630722276
                        ],
                        [
                            6.63693802404103,
                            46.7764610704526
                        ],
                        [
                            6.63693610378376,
                            46.7764590144227
                        ],
                        [
                            6.6369342622337,
                            46.7764569325907
                        ],
                        [
                            6.63693252604006,
                            46.7764548064756
                        ],
                        [
                            6.63693086856995,
                            46.7764526534605
                        ],
                        [
                            6.63692931724724,
                            46.7764504567169
                        ],
                        [
                            6.63692785742591,
                            46.7764482337123
                        ],
                        [
                            6.63692648991328,
                            46.7764459839031
                        ],
                        [
                            6.63692522748724,
                            46.7764437079282
                        ],
                        [
                            6.63692407014774,
                            46.7764414057876
                        ],
                        [
                            6.63692300510872,
                            46.7764390773915
                        ],
                        [
                            6.63692204502544,
                            46.776436731614
                        ],
                        [
                            6.63692117630449,
                            46.7764343689084
                        ],
                        [
                            6.63692042613258,
                            46.7764319883679
                        ],
                        [
                            6.63691976812212,
                            46.776429590905
                        ],
                        [
                            6.63691922785338,
                            46.7764271761505
                        ],
                        [
                            6.63691877948438,
                            46.776424762042
                        ],
                        [
                            6.63691844884891,
                            46.7764223311909
                        ],
                        [
                            6.63691821012136,
                            46.7764199004367
                        ],
                        [
                            6.63691808899646,
                            46.7764174617242
                        ],
                        [
                            6.63691807335647,
                            46.7764150237531
                        ],
                        [
                            6.63691816160309,
                            46.7764125865123
                        ],
                        [
                            6.63691835520376,
                            46.7764101587971
                        ],
                        [
                            6.63691865362098,
                            46.7764077230337
                        ],
                        [
                            6.63691905565496,
                            46.7764053061178
                        ],
                        [
                            6.63691956317377,
                            46.7764028899434
                        ],
                        [
                            6.63692018790264,
                            46.776400492163
                        ],
                        [
                            6.63692090439215,
                            46.7763981043619
                        ],
                        [
                            6.6369217254365,
                            46.7763957260807
                        ],
                        [
                            6.63692265155678,
                            46.7763933759916
                        ],
                        [
                            6.63692368130194,
                            46.776391044201
                        ],
                        [
                            6.6369248154629,
                            46.7763887312635
                        ],
                        [
                            6.63692604112277,
                            46.7763864458736
                        ],
                        [
                            6.63692737106758,
                            46.776384188121
                        ],
                        [
                            6.63692879264213,
                            46.7763819491318
                        ],
                        [
                            6.63693031757166,
                            46.7763797465584
                        ],
                        [
                            6.63693193465203,
                            46.7763775814203
                        ],
                        [
                            6.63693364244034,
                            46.776375443275
                        ],
                        [
                            6.63693545437453,
                            46.7763733421003
                        ],
                        [
                            6.63693734475993,
                            46.7763712859514
                        ],
                        [
                            6.63693932583686,
                            46.7763692578933
                        ],
                        [
                            6.63694139801203,
                            46.7763672842843
                        ],
                        [
                            6.636943561547,
                            46.7763653475558
                        ],
                        [
                            6.63694580193492,
                            46.776363455842
                        ],
                        [
                            6.63694812155679,
                            46.7763616102578
                        ],
                        [
                            6.63695051803153,
                            46.7763598096882
                        ],
                        [
                            6.63695299281029,
                            46.7763580640266
                        ],
                        [
                            6.63695554510206,
                            46.7763563727184
                        ],
                        [
                            6.63702865776985,
                            46.7763092983444
                        ],
                        [
                            6.6371033553304,
                            46.7762612450931
                        ],
                        [
                            6.63712239526379,
                            46.7762488744277
                        ],
                        [
                            6.63723530159576,
                            46.7761762612999
                        ],
                        [
                            6.63724534924339,
                            46.7761697650486
                        ],
                        [
                            6.63726915000792,
                            46.7761542794557
                        ],
                        [
                            6.63744512939094,
                            46.7760403674902
                        ],
                        [
                            6.6374721008374,
                            46.7760229252884
                        ],
                        [
                            6.6374849249819,
                            46.7760146492244
                        ],
                        [
                            6.63760100728762,
                            46.775939718471
                        ],
                        [
                            6.63762731746288,
                            46.7759227212751
                        ],
                        [
                            6.63766552521732,
                            46.775898160761
                        ],
                        [
                            6.63769196640762,
                            46.7758811644705
                        ],
                        [
                            6.63772158050614,
                            46.7758621210186
                        ],
                        [
                            6.63773321463193,
                            46.7758546458964
                        ],
                        [
                            6.63784043252777,
                            46.775785770368
                        ],
                        [
                            6.63784191242678,
                            46.7757848720515
                        ],
                        [
                            6.63784347062996,
                            46.7757840286426
                        ],
                        [
                            6.63784507917631,
                            46.7757832393958
                        ],
                        [
                            6.63784675311847,
                            46.7757825132018
                        ],
                        [
                            6.63784847806409,
                            46.7757818505087
                        ],
                        [
                            6.6378502548123,
                            46.7757812513221
                        ],
                        [
                            6.63785206977812,
                            46.7757807155466
                        ],
                        [
                            6.63785392296969,
                            46.7757802426332
                        ],
                        [
                            6.63785581490849,
                            46.7757798512538
                        ],
                        [
                            6.63785773161868,
                            46.775779513857
                        ],
                        [
                            6.63785967349928,
                            46.7757792573498
                        ],
                        [
                            6.63786164001247,
                            46.7757790641584
                        ],
                        [
                            6.6378636061161,
                            46.775778952226
                        ],
                        [
                            6.63786558407462,
                            46.7757789029706
                        ],
                        [
                            6.63786756082447,
                            46.7757789349687
                        ],
                        [
                            6.63786953663517,
                            46.775779030103
                        ],
                        [
                            6.63787149766035,
                            46.7757792058464
                        ],
                        [
                            6.63787344576779,
                            46.7757794440928
                        ],
                        [
                            6.63787536562723,
                            46.7757797546178
                        ],
                        [
                            6.63787727163097,
                            46.7757801369734
                        ],
                        [
                            6.63787913741628,
                            46.7757805904253
                        ],
                        [
                            6.6378809630975,
                            46.7757811072876
                        ],
                        [
                            6.63791835620383,
                            46.7757584303125
                        ],
                        [
                            6.63793024971224,
                            46.7757511370858
                        ],
                        [
                            6.63813387005048,
                            46.7756274327754
                        ],
                        [
                            6.63811767134785,
                            46.7756160741715
                        ],
                        [
                            6.63830539802,
                            46.7755044028329
                        ],
                        [
                            6.63847396637898,
                            46.775404291375
                        ],
                        [
                            6.63847793011308,
                            46.7754018906568
                        ],
                        [
                            6.63850804916903,
                            46.7753841101077
                        ],
                        [
                            6.63864781747133,
                            46.7753010683714
                        ],
                        [
                            6.63866803004801,
                            46.7752890658651
                        ],
                        [
                            6.63869788553177,
                            46.7752713734649
                        ],
                        [
                            6.63870184925426,
                            46.77526897219
                        ],
                        [
                            6.63871373987271,
                            46.7752618589566
                        ],
                        [
                            6.63882682311846,
                            46.7751946428521
                        ],
                        [
                            6.63892986337605,
                            46.7751335634289
                        ],
                        [
                            6.6389694966124,
                            46.7751099118521
                        ],
                        [
                            6.63899433255386,
                            46.7750951529902
                        ],
                        [
                            6.63916171566555,
                            46.7749953018116
                        ],
                        [
                            6.63919474229579,
                            46.774975652672
                        ],
                        [
                            6.63921957945069,
                            46.7749608037231
                        ],
                        [
                            6.63922103280306,
                            46.7749599139881
                        ],
                        [
                            6.63924982960654,
                            46.7749429338526
                        ],
                        [
                            6.63927479645577,
                            46.7749281752988
                        ],
                        [
                            6.63949077821955,
                            46.7748004174626
                        ],
                        [
                            6.63951772514849,
                            46.7747845938127
                        ],
                        [
                            6.63951904610159,
                            46.7747837931933
                        ],
                        [
                            6.63953278567129,
                            46.7747756133635
                        ],
                        [
                            6.63954956350253,
                            46.7747655654774
                        ],
                        [
                            6.63977863700187,
                            46.7746290829974
                        ],
                        [
                            6.63978035377754,
                            46.7746281050533
                        ],
                        [
                            6.63992155359155,
                            46.7745454319922
                        ],
                        [
                            6.63977111219005,
                            46.7744743903018
                        ],
                        [
                            6.6397466344875,
                            46.7744650428239
                        ],
                        [
                            6.63964312480663,
                            46.7744255452972
                        ],
                        [
                            6.63957281600903,
                            46.7743987847644
                        ],
                        [
                            6.63947464474927,
                            46.7743613033255
                        ],
                        [
                            6.63942329295176,
                            46.7743452906598
                        ],
                        [
                            6.63941169393215,
                            46.7743416107876
                        ],
                        [
                            6.63925194566322,
                            46.7742916702947
                        ],
                        [
                            6.63909641924923,
                            46.7742430549731
                        ],
                        [
                            6.63875787916332,
                            46.7741418154374
                        ],
                        [
                            6.63868031627263,
                            46.7741186020623
                        ],
                        [
                            6.63835937718989,
                            46.7740225230336
                        ],
                        [
                            6.63792541615116,
                            46.7738929043337
                        ],
                        [
                            6.63796189886628,
                            46.7738697707212
                        ],
                        [
                            6.63667021783204,
                            46.773482416429
                        ],
                        [
                            6.63648582336154,
                            46.7734233659237
                        ],
                        [
                            6.63600480132795,
                            46.7732717288787
                        ],
                        [
                            6.63560352325117,
                            46.7731462894961
                        ],
                        [
                            6.63521072017926,
                            46.77302333692
                        ],
                        [
                            6.63496102484586,
                            46.7729445724523
                        ],
                        [
                            6.63453448741092,
                            46.772809955334
                        ],
                        [
                            6.63438918227673,
                            46.7727640411223
                        ],
                        [
                            6.63372898490769,
                            46.7725557159938
                        ],
                        [
                            6.63348516257788,
                            46.7724785188672
                        ],
                        [
                            6.63328761475259,
                            46.7724152319478
                        ],
                        [
                            6.63294666247789,
                            46.7722929077745
                        ],
                        [
                            6.63260029511953,
                            46.7721563311127
                        ],
                        [
                            6.63228163619504,
                            46.7720230976592
                        ],
                        [
                            6.63193182501616,
                            46.771863194869
                        ],
                        [
                            6.63173794760797,
                            46.7717649368641
                        ],
                        [
                            6.63167661243814,
                            46.7717339164725
                        ],
                        [
                            6.63163255610812,
                            46.7717119247582
                        ],
                        [
                            6.63130943371061,
                            46.7715361958441
                        ],
                        [
                            6.63099483395973,
                            46.771351081275
                        ],
                        [
                            6.63072779571199,
                            46.771181325283
                        ],
                        [
                            6.63044180298903,
                            46.7709834576315
                        ],
                        [
                            6.63015853078319,
                            46.7707702247237
                        ],
                        [
                            6.62998003090635,
                            46.7706336603852
                        ],
                        [
                            6.62879328121297,
                            46.7697290632834
                        ],
                        [
                            6.6286834682054,
                            46.7699008255506
                        ],
                        [
                            6.62864550983185,
                            46.7699523726779
                        ],
                        [
                            6.6280797128967,
                            46.7707216436458
                        ],
                        [
                            6.62795387653237,
                            46.770870351787
                        ],
                        [
                            6.62786364735234,
                            46.7709933145318
                        ],
                        [
                            6.62738550157569,
                            46.7716443691542
                        ],
                        [
                            6.62687405032637,
                            46.7723412444817
                        ],
                        [
                            6.62693823157021,
                            46.7723830824163
                        ],
                        [
                            6.62664345168141,
                            46.7726554503334
                        ],
                        [
                            6.62661951996655,
                            46.7726882048528
                        ],
                        [
                            6.62657714073421,
                            46.7727461071436
                        ],
                        [
                            6.62645615053681,
                            46.7729114904422
                        ],
                        [
                            6.62613270564682,
                            46.7733563751457
                        ],
                        [
                            6.62588944124896,
                            46.7736936989504
                        ],
                        [
                            6.62587018100233,
                            46.7737205495244
                        ],
                        [
                            6.62575355058488,
                            46.7738830843915
                        ],
                        [
                            6.62570753651502,
                            46.7739474372725
                        ],
                        [
                            6.62548303510174,
                            46.7742644729955
                        ],
                        [
                            6.62526690574013,
                            46.7745732018291
                        ],
                        [
                            6.62518580814779,
                            46.774688941469
                        ],
                        [
                            6.6247719220963,
                            46.7752944739252
                        ],
                        [
                            6.62458354714505,
                            46.7755770414855
                        ],
                        [
                            6.62456049681144,
                            46.7756119613581
                        ],
                        [
                            6.62455138575144,
                            46.7756256603818
                        ],
                        [
                            6.62437524897316,
                            46.7758954502742
                        ],
                        [
                            6.62414242165738,
                            46.7762597432524
                        ],
                        [
                            6.62413909087684,
                            46.7762652678061
                        ],
                        [
                            6.62404638818745,
                            46.7764190049846
                        ],
                        [
                            6.62382865412985,
                            46.7767720696025
                        ],
                        [
                            6.62374470534839,
                            46.7769027208868
                        ],
                        [
                            6.62361320625409,
                            46.7771210123648
                        ],
                        [
                            6.6235214214199,
                            46.7772761662383
                        ],
                        [
                            6.6235140310517,
                            46.7772886179136
                        ],
                        [
                            6.62350838779716,
                            46.7772981132599
                        ],
                        [
                            6.62345328080981,
                            46.7773918166179
                        ],
                        [
                            6.62333833899005,
                            46.7775888157328
                        ],
                        [
                            6.623285345836,
                            46.777681275106
                        ],
                        [
                            6.6232467424711,
                            46.7777487388467
                        ],
                        [
                            6.62320463245848,
                            46.777822923912
                        ],
                        [
                            6.62318014318073,
                            46.7778662894293
                        ],
                        [
                            6.62315579446343,
                            46.7779090261646
                        ],
                        [
                            6.62313221628369,
                            46.7779527578258
                        ],
                        [
                            6.62305690486594,
                            46.7780921961661
                        ],
                        [
                            6.62295092732562,
                            46.7782763948629
                        ],
                        [
                            6.62282054275384,
                            46.7785157436039
                        ],
                        [
                            6.62277257107504,
                            46.7786050902975
                        ],
                        [
                            6.62269372715543,
                            46.7787527792447
                        ],
                        [
                            6.62280314406255,
                            46.778756530734
                        ],
                        [
                            6.62286661565813,
                            46.7787590535982
                        ],
                        [
                            6.62321316802187,
                            46.7787722368433
                        ],
                        [
                            6.62355303402438,
                            46.7787860010355
                        ],
                        [
                            6.62389200182479,
                            46.778798498235
                        ],
                        [
                            6.62412730044512,
                            46.7788082753233
                        ],
                        [
                            6.62441441750745,
                            46.778820490736
                        ],
                        [
                            6.62468824030282,
                            46.778828562274
                        ],
                        [
                            6.62475355759392,
                            46.7788302873825
                        ],
                        [
                            6.62507371832242,
                            46.7788395885561
                        ],
                        [
                            6.62549258336437,
                            46.7788509416062
                        ],
                        [
                            6.62605178187235,
                            46.7788651823098
                        ],
                        [
                            6.6261351615354,
                            46.7788674855413
                        ],
                        [
                            6.62623110309886,
                            46.7788704179203
                        ],
                        [
                            6.62643454172471,
                            46.7788741157373
                        ],
                        [
                            6.62646190340646,
                            46.7788745801644
                        ],
                        [
                            6.62648820787657,
                            46.7788756673878
                        ],
                        [
                            6.62652734372271,
                            46.7788768454163
                        ],
                        [
                            6.62657865642284,
                            46.7788781101259
                        ],
                        [
                            6.62677109565626,
                            46.7788818190784
                        ],
                        [
                            6.62721055712544,
                            46.778899430139
                        ],
                        [
                            6.62723921972221,
                            46.7789004433686
                        ],
                        [
                            6.62727350700051,
                            46.778901856791
                        ],
                        [
                            6.62728659236589,
                            46.7789024896067
                        ],
                        [
                            6.62744101417972,
                            46.7789089853015
                        ],
                        [
                            6.62746836503354,
                            46.7789101697878
                        ],
                        [
                            6.62747425376482,
                            46.7789103912123
                        ],
                        [
                            6.62756796668695,
                            46.7789222130543
                        ],
                        [
                            6.62760467538028,
                            46.7789280515159
                        ],
                        [
                            6.62770127821829,
                            46.778947899762
                        ],
                        [
                            6.62819504209722,
                            46.7789335161782
                        ],
                        [
                            6.62820526097228,
                            46.778933219813
                        ],
                        [
                            6.62871587921771,
                            46.7789474619042
                        ],
                        [
                            6.6287534453534,
                            46.7789485385243
                        ],
                        [
                            6.62887556531506,
                            46.778952194289
                        ],
                        [
                            6.62889860191063,
                            46.7789528975673
                        ],
                        [
                            6.62902975454084,
                            46.7789567973858
                        ],
                        [
                            6.62928748071679,
                            46.7789642933874
                        ],
                        [
                            6.62934258498304,
                            46.7789659439462
                        ],
                        [
                            6.62934376375137,
                            46.77896595231
                        ],
                        [
                            6.62955045199652,
                            46.7789712868278
                        ],
                        [
                            6.62959862197808,
                            46.7789726184819
                        ],
                        [
                            6.62960542872054,
                            46.7789727562606
                        ],
                        [
                            6.629667601312,
                            46.7789746368924
                        ],
                        [
                            6.62977872598932,
                            46.778978033611
                        ],
                        [
                            6.62979312528484,
                            46.7789784058644
                        ],
                        [
                            6.62985307142329,
                            46.7789802700573
                        ],
                        [
                            6.62989260060001,
                            46.7789814502689
                        ],
                        [
                            6.6299585695006,
                            46.7789834471579
                        ],
                        [
                            6.63003252311267,
                            46.778985590662
                        ],
                        [
                            6.63011158204498,
                            46.778987860355
                        ],
                        [
                            6.63026852005465,
                            46.7789925713089
                        ],
                        [
                            6.63028815359283,
                            46.7789931601411
                        ],
                        [
                            6.63036459368164,
                            46.7789954110988
                        ],
                        [
                            6.63038357270536,
                            46.7789959952764
                        ],
                        [
                            6.63041577226514,
                            46.778996943273
                        ],
                        [
                            6.63054614009327,
                            46.7790007451901
                        ],
                        [
                            6.63057310597379,
                            46.7790013864701
                        ],
                        [
                            6.63063266192513,
                            46.7790031574417
                        ],
                        [
                            6.63063510976953,
                            46.7790031747823
                        ],
                        [
                            6.63063754467875,
                            46.7790032551739
                        ],
                        [
                            6.63063997757741,
                            46.7790034162644
                        ],
                        [
                            6.63064241032757,
                            46.7790036404965
                        ],
                        [
                            6.63064481482656,
                            46.7790039364564
                        ],
                        [
                            6.63064720639867,
                            46.7790042949184
                        ],
                        [
                            6.63064955679289,
                            46.7790047343508
                        ],
                        [
                            6.63065189278551,
                            46.7790052280388
                        ],
                        [
                            6.63065420199348,
                            46.7790058022501
                        ],
                        [
                            6.63065645844817,
                            46.7790064298963
                        ],
                        [
                            6.63065868665174,
                            46.7790071292702
                        ],
                        [
                            6.6306608627611,
                            46.7790078914179
                        ],
                        [
                            6.63066299810464,
                            46.7790087070855
                        ],
                        [
                            6.63066507962382,
                            46.7790095942997
                        ],
                        [
                            6.63066710838147,
                            46.7790105354978
                        ],
                        [
                            6.63066907066817,
                            46.7790115388187
                        ],
                        [
                            6.63067096660754,
                            46.7790125960275
                        ],
                        [
                            6.63067280913457,
                            46.7790136973323
                        ],
                        [
                            6.63067457319493,
                            46.7790148612241
                        ],
                        [
                            6.63067627024891,
                            46.7790160696648
                        ],
                        [
                            6.63067788816889,
                            46.7790173319027
                        ],
                        [
                            6.63084081924201,
                            46.7790851455394
                        ],
                        [
                            6.63086336109357,
                            46.7790664139465
                        ],
                        [
                            6.63086639682123,
                            46.7790639525596
                        ],
                        [
                            6.63086951085875,
                            46.7790615455359
                        ],
                        [
                            6.63087270173958,
                            46.7790591840799
                        ],
                        [
                            6.63087597092202,
                            46.779056877536
                        ],
                        [
                            6.63087931775518,
                            46.7790546160165
                        ],
                        [
                            6.6308827293041,
                            46.7790524093129
                        ],
                        [
                            6.63088621929468,
                            46.7790502481884
                        ],
                        [
                            6.63088977307827,
                            46.7790481501093
                        ],
                        [
                            6.63089340516348,
                            46.7790461069423
                        ],
                        [
                            6.6308970883869,
                            46.779044117946
                        ],
                        [
                            6.63090084912097,
                            46.7790421833071
                        ],
                        [
                            6.63090466165238,
                            46.7790403121778
                        ],
                        [
                            6.63090853890781,
                            46.7790384953153
                        ],
                        [
                            6.63091248074725,
                            46.779036742053
                        ],
                        [
                            6.63091647371665,
                            46.7790350435103
                        ],
                        [
                            6.63092051835983,
                            46.7790334167122
                        ],
                        [
                            6.63092461413301,
                            46.7790318446338
                        ],
                        [
                            6.63092876158001,
                            46.7790303443001
                        ],
                        [
                            6.63093296095619,
                            46.7790288986916
                        ],
                        [
                            6.63093719841212,
                            46.7790275252807
                        ],
                        [
                            6.63094148686629,
                            46.7790262153735
                        ],
                        [
                            6.63094586654886,
                            46.7790249511357
                        ],
                        [
                            6.63095029709788,
                            46.7790237591858
                        ],
                        [
                            6.6309547665341,
                            46.7790226388901
                        ],
                        [
                            6.6309592605879,
                            46.7790215824603
                        ],
                        [
                            6.63096379258975,
                            46.7790206070122
                        ],
                        [
                            6.6309683636024,
                            46.7790196949829
                        ],
                        [
                            6.63097294633071,
                            46.7790188544152
                        ],
                        [
                            6.63097756726246,
                            46.7790180778098
                        ],
                        [
                            6.63098221335566,
                            46.7790173820953
                        ],
                        [
                            6.63098688474214,
                            46.7790167584877
                        ],
                        [
                            6.63099156770429,
                            46.7790162156749
                        ],
                        [
                            6.63099626250575,
                            46.7790157360885
                        ],
                        [
                            6.63100098339966,
                            46.7790153286146
                        ],
                        [
                            6.63100571506194,
                            46.7790150024789
                        ],
                        [
                            6.63101045937093,
                            46.7790147390262
                        ],
                        [
                            6.63101520246082,
                            46.7790145568268
                        ],
                        [
                            6.63101994433983,
                            46.7790144553316
                        ],
                        [
                            6.63102469885741,
                            46.7790144170686
                        ],
                        [
                            6.63102945135677,
                            46.7790144600531
                        ],
                        [
                            6.63103420278535,
                            46.7790145744087
                        ],
                        [
                            6.63103895392586,
                            46.7790147612391
                        ],
                        [
                            6.6311338456187,
                            46.7790178616046
                        ],
                        [
                            6.63115360888815,
                            46.7790185412534
                        ],
                        [
                            6.63119837101254,
                            46.7790200276511
                        ],
                        [
                            6.63127580626676,
                            46.7790257935876
                        ],
                        [
                            6.63135360100276,
                            46.7790338109985
                        ],
                        [
                            6.6314355466773,
                            46.7790444663547
                        ],
                        [
                            6.63145906228679,
                            46.7790481413165
                        ],
                        [
                            6.63150777012218,
                            46.7790572117897
                        ],
                        [
                            6.6316422194844,
                            46.7790857806933
                        ],
                        [
                            6.63173498490015,
                            46.7791084771255
                        ],
                        [
                            6.63177227453608,
                            46.779119266004
                        ],
                        [
                            6.63185610203257,
                            46.7791441480919
                        ],
                        [
                            6.63187693548367,
                            46.7791520318191
                        ],
                        [
                            6.63215936636981,
                            46.7792587418851
                        ],
                        [
                            6.6321652222586,
                            46.7792612123663
                        ],
                        [
                            6.6321803169509,
                            46.7792676158048
                        ],
                        [
                            6.63238694996387,
                            46.7793554378521
                        ],
                        [
                            6.63240607864268,
                            46.7793634895252
                        ],
                        [
                            6.63241674814679,
                            46.779368062906
                        ],
                        [
                            6.63240968958697,
                            46.7793759294751
                        ],
                        [
                            6.6326311358655,
                            46.7794715015494
                        ],
                        [
                            6.6329440606326,
                            46.7796145889336
                        ],
                        [
                            6.63294825876378,
                            46.7796166968098
                        ],
                        [
                            6.63295240414362,
                            46.7796188581218
                        ],
                        [
                            6.63295649584147,
                            46.7796210816483
                        ],
                        [
                            6.63296050773928,
                            46.7796233501836
                        ],
                        [
                            6.63296446688577,
                            46.7796256721547
                        ],
                        [
                            6.63296834677666,
                            46.7796280561597
                        ],
                        [
                            6.6329721740395,
                            46.7796304853654
                        ],
                        [
                            6.63297592071956,
                            46.7796329584763
                        ],
                        [
                            6.63297960251278,
                            46.7796354948206
                        ],
                        [
                            6.63298320386292,
                            46.779638065737
                        ],
                        [
                            6.63298673966673,
                            46.779640690548
                        ],
                        [
                            6.6329901963464,
                            46.7796433686086
                        ],
                        [
                            6.63299358615257,
                            46.7796460824353
                        ],
                        [
                            6.63299688404782,
                            46.7796488494213
                        ],
                        [
                            6.63300011586869,
                            46.779651652179
                        ],
                        [
                            6.63300326869692,
                            46.7796544994023
                        ],
                        [
                            6.63300632895473,
                            46.7796573904461
                        ],
                        [
                            6.63300931035135,
                            46.7796603171713
                        ],
                        [
                            6.63301221195611,
                            46.7796632883564
                        ],
                        [
                            6.63301487942306,
                            46.7796661497214
                        ],
                        [
                            6.63301746882793,
                            46.7796690467734
                        ],
                        [
                            6.6330199649864,
                            46.7796719794052
                        ],
                        [
                            6.63302236950499,
                            46.7796749470791
                        ],
                        [
                            6.63302468158453,
                            46.7796779497895
                        ],
                        [
                            6.633026902016,
                            46.779680988091
                        ],
                        [
                            6.63302902934067,
                            46.7796840526392
                        ],
                        [
                            6.63303106501724,
                            46.7796871527785
                        ],
                        [
                            6.63303300931682,
                            46.7796902703916
                        ],
                        [
                            6.63303484745981,
                            46.7796934317294
                        ],
                        [
                            6.63303659422581,
                            46.7796966105411
                        ],
                        [
                            6.63303823522961,
                            46.779699806725
                        ],
                        [
                            6.63303978458521,
                            46.7797030385
                        ],
                        [
                            6.63304122898599,
                            46.7797062871039
                        ],
                        [
                            6.63304258121051,
                            46.779709553176
                        ],
                        [
                            6.63304382834047,
                            46.7797128454102
                        ],
                        [
                            6.63304497063879,
                            46.779716146238
                        ],
                        [
                            6.63304602076903,
                            46.7797194639851
                        ],
                        [
                            6.63304696593611,
                            46.7797227991101
                        ],
                        [
                            6.63304780614004,
                            46.7797261516129
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "90",
                "nomsquart": "Quartier 5",
                "character": "10",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [
        {
            "id": "61",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6295594892296,
                    46.7747629606645
                ]
            }
        },
        {
            "id": "62",
            "type": "Feature",
            "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63376056297372,
                    46.778658147106
                ]
            }
        },
        {
            "id": "63",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6317064449929,
                    46.7734210447742
                ]
            }
        },
        {
            "id": "64",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63439242420791,
                    46.7744137361421
                ]
            }
        },
        {
            "id": "65",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63195317209343,
                    46.7753579955709
                ]
            }
        },
        {
            "id": "66",
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63381926311875,
                    46.7755289670547
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63710536364384,
                    46.7751323581909
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.62828380182243,
                    46.7766646414328
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63250573291362,
                    46.7778329941426
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6245531239175,
                    46.7782120038337
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63119604340743,
                    46.7783369477162
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6292333321904,
                    46.7707837566137
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.62969368920437,
                    46.7781490626284
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.6328396519174,
                    46.7727527818063
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.63504014278821,
                    46.7768785478284
                ]
            }
        }
    ]
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.64320379088288,
                            46.7702202812635
                        ],
                        [
                            6.64331055300446,
                            46.7700214957452
                        ],
                        [
                            6.64347090081043,
                            46.7697935779733
                        ],
                        [
                            6.64357686010929,
                            46.769649032313
                        ],
                        [
                            6.64369460569171,
                            46.7695220213853
                        ],
                        [
                            6.64438951331958,
                            46.7688063793462
                        ],
                        [
                            6.64498935279,
                            46.7682150250965
                        ],
                        [
                            6.64517561342876,
                            46.7680313650196
                        ],
                        [
                            6.64554114256255,
                            46.7676709042587
                        ],
                        [
                            6.64533386408481,
                            46.7676693905499
                        ],
                        [
                            6.64492251400227,
                            46.7676779531824
                        ],
                        [
                            6.64389271399966,
                            46.7677203479429
                        ],
                        [
                            6.64285923884582,
                            46.7677633381044
                        ],
                        [
                            6.64182724497516,
                            46.7678033604563
                        ],
                        [
                            6.64144536499161,
                            46.7678109469652
                        ],
                        [
                            6.64104169148271,
                            46.7678048858713
                        ],
                        [
                            6.64068804072043,
                            46.7677892775328
                        ],
                        [
                            6.64064918535959,
                            46.7677873864386
                        ],
                        [
                            6.64025968094654,
                            46.7677529042247
                        ],
                        [
                            6.64015120532006,
                            46.7677400904777
                        ],
                        [
                            6.63987282231248,
                            46.7677077345767
                        ],
                        [
                            6.6394126391318,
                            46.7676367706341
                        ],
                        [
                            6.63914370263214,
                            46.7675854978638
                        ],
                        [
                            6.63896014129699,
                            46.7675508362128
                        ],
                        [
                            6.63878695795549,
                            46.7675139074773
                        ],
                        [
                            6.63861860285481,
                            46.7674780023203
                        ],
                        [
                            6.63842591946223,
                            46.767440576588
                        ],
                        [
                            6.63840398862763,
                            46.7674362843638
                        ],
                        [
                            6.63828720562061,
                            46.7673835586117
                        ],
                        [
                            6.63820278640453,
                            46.7673642543866
                        ],
                        [
                            6.63783616150911,
                            46.7672530093161
                        ],
                        [
                            6.63745588358472,
                            46.7671179182775
                        ],
                        [
                            6.63708447200307,
                            46.7669677746204
                        ],
                        [
                            6.63672224050521,
                            46.7668079790767
                        ],
                        [
                            6.6363784583696,
                            46.7666313997548
                        ],
                        [
                            6.63615787095238,
                            46.7665076826388
                        ],
                        [
                            6.63612780782925,
                            46.7665220444502
                        ],
                        [
                            6.63596753327432,
                            46.7663747323911
                        ],
                        [
                            6.63582034914834,
                            46.7664559192941
                        ],
                        [
                            6.63658940115565,
                            46.7671917112288
                        ],
                        [
                            6.6367857763793,
                            46.7673766990809
                        ],
                        [
                            6.63688312321095,
                            46.7674685124332
                        ],
                        [
                            6.63703560348395,
                            46.7676120802649
                        ],
                        [
                            6.63737206641007,
                            46.7679291225759
                        ],
                        [
                            6.63742525939302,
                            46.7679791518652
                        ],
                        [
                            6.63736902582693,
                            46.7680018280602
                        ],
                        [
                            6.637369028045001,
                            46.76800183011401
                        ],
                        [
                            6.63393900085925,
                            46.7693847807479
                        ],
                        [
                            6.63358343056601,
                            46.7692518300615
                        ],
                        [
                            6.63355717384103,
                            46.7692916767386
                        ],
                        [
                            6.63367148319777,
                            46.7693346746438
                        ],
                        [
                            6.63213948249831,
                            46.7712601364081
                        ],
                        [
                            6.63173794760797,
                            46.7717649368641
                        ],
                        [
                            6.63193182501616,
                            46.771863194869
                        ],
                        [
                            6.63228163619504,
                            46.7720230976592
                        ],
                        [
                            6.63260029511953,
                            46.7721563311127
                        ],
                        [
                            6.63294666247789,
                            46.7722929077745
                        ],
                        [
                            6.63328761475259,
                            46.7724152319478
                        ],
                        [
                            6.63348516257788,
                            46.7724785188672
                        ],
                        [
                            6.63372898490769,
                            46.7725557159938
                        ],
                        [
                            6.63438918227673,
                            46.7727640411223
                        ],
                        [
                            6.63453448741092,
                            46.772809955334
                        ],
                        [
                            6.63496102484586,
                            46.7729445724523
                        ],
                        [
                            6.63521072017926,
                            46.77302333692
                        ],
                        [
                            6.63560352325117,
                            46.7731462894961
                        ],
                        [
                            6.63600480132795,
                            46.7732717288787
                        ],
                        [
                            6.63648582336154,
                            46.7734233659237
                        ],
                        [
                            6.63667021783204,
                            46.773482416429
                        ],
                        [
                            6.63796189886628,
                            46.7738697707212
                        ],
                        [
                            6.63792541615116,
                            46.7738929043337
                        ],
                        [
                            6.63835937718989,
                            46.7740225230336
                        ],
                        [
                            6.63868031627263,
                            46.7741186020623
                        ],
                        [
                            6.63875787916332,
                            46.7741418154374
                        ],
                        [
                            6.63909641924923,
                            46.7742430549731
                        ],
                        [
                            6.63925194566322,
                            46.7742916702947
                        ],
                        [
                            6.63941169393215,
                            46.7743416107876
                        ],
                        [
                            6.63942329295176,
                            46.7743452906598
                        ],
                        [
                            6.63947464474927,
                            46.7743613033255
                        ],
                        [
                            6.63957281600903,
                            46.7743987847644
                        ],
                        [
                            6.63964312480663,
                            46.7744255452972
                        ],
                        [
                            6.6397466344875,
                            46.7744650428239
                        ],
                        [
                            6.63977111219005,
                            46.7744743903018
                        ],
                        [
                            6.63992155359155,
                            46.7745454319922
                        ],
                        [
                            6.64000698603012,
                            46.7744971824512
                        ],
                        [
                            6.64001741764465,
                            46.7744913184285
                        ],
                        [
                            6.64003181073566,
                            46.7744831425665
                        ],
                        [
                            6.64005636931677,
                            46.7744693709543
                        ],
                        [
                            6.64015949381537,
                            46.774411259834
                        ],
                        [
                            6.64018973481013,
                            46.774394019434
                        ],
                        [
                            6.64029840963511,
                            46.774332438504
                        ],
                        [
                            6.64031874373852,
                            46.7743209757443
                        ],
                        [
                            6.64040668785827,
                            46.7742711242882
                        ],
                        [
                            6.64064040347486,
                            46.7741391705529
                        ],
                        [
                            6.64116151131142,
                            46.7737959326935
                        ],
                        [
                            6.64118479396141,
                            46.7737798848192
                        ],
                        [
                            6.6412081415942,
                            46.7737638730839
                        ],
                        [
                            6.64123155313424,
                            46.7737479161485
                        ],
                        [
                            6.6412550304562,
                            46.7737319953576
                        ],
                        [
                            6.64130174545475,
                            46.7737003596338
                        ],
                        [
                            6.64134840899438,
                            46.7736686872929
                        ],
                        [
                            6.64138715151052,
                            46.773642276184
                        ],
                        [
                            6.64142578957424,
                            46.7736157924042
                        ],
                        [
                            6.64146432478371,
                            46.7735892359647
                        ],
                        [
                            6.64150278164233,
                            46.7735626251561
                        ],
                        [
                            6.64154101392723,
                            46.7735361741911
                        ],
                        [
                            6.6415792461665,
                            46.7735097237621
                        ],
                        [
                            6.64159848120876,
                            46.7734963999928
                        ],
                        [
                            6.64161763871962,
                            46.7734830224188
                        ],
                        [
                            6.64163671872346,
                            46.7734695893933
                        ],
                        [
                            6.64165572039678,
                            46.7734561025577
                        ],
                        [
                            6.64168644740721,
                            46.7734342502486
                        ],
                        [
                            6.64171725189835,
                            46.7734124528305
                        ],
                        [
                            6.64173782799822,
                            46.7733978788476
                        ],
                        [
                            6.64175833908222,
                            46.7733832692664
                        ],
                        [
                            6.6417787859738,
                            46.7733686224454
                        ],
                        [
                            6.64179841578246,
                            46.7733542675067
                        ],
                        [
                            6.64181795528968,
                            46.773339857576
                        ],
                        [
                            6.64183742992799,
                            46.7733254021652
                        ],
                        [
                            6.6418567812294,
                            46.7733112879586
                        ],
                        [
                            6.64187604222972,
                            46.7732971187603
                        ],
                        [
                            6.64189523835331,
                            46.773282904631
                        ],
                        [
                            6.64191434337676,
                            46.7732686355045
                        ],
                        [
                            6.64192636723471,
                            46.7732594803397
                        ],
                        [
                            6.64193831436576,
                            46.7732502713782
                        ],
                        [
                            6.64195018305802,
                            46.7732410162948
                        ],
                        [
                            6.64196198674965,
                            46.7732317250668
                        ],
                        [
                            6.64197369933908,
                            46.7732223793925
                        ],
                        [
                            6.64198533508788,
                            46.7732129876077
                        ],
                        [
                            6.64199690516701,
                            46.7732035508885
                        ],
                        [
                            6.64200838401396,
                            46.7731940685074
                        ],
                        [
                            6.64201978601225,
                            46.7731845405647
                        ],
                        [
                            6.64203110943368,
                            46.7731749758337
                        ],
                        [
                            6.64204235453829,
                            46.7731653567458
                        ],
                        [
                            6.64205785909637,
                            46.7731519623689
                        ],
                        [
                            6.64207325977146,
                            46.7731385129066
                        ],
                        [
                            6.64208858199611,
                            46.7731250178708
                        ],
                        [
                            6.64210380099071,
                            46.7731114776375
                        ],
                        [
                            6.64211892888774,
                            46.7730978824083
                        ],
                        [
                            6.64213396554907,
                            46.7730842415163
                        ],
                        [
                            6.64214891096668,
                            46.7730705555107
                        ],
                        [
                            6.64216376608586,
                            46.7730568145148
                        ],
                        [
                            6.64217546301026,
                            46.7730458758654
                        ],
                        [
                            6.64218706936294,
                            46.773034900893
                        ],
                        [
                            6.64219858448292,
                            46.7730238802587
                        ],
                        [
                            6.64221002114734,
                            46.7730128146009
                        ],
                        [
                            6.64222135460107,
                            46.7730017026486
                        ],
                        [
                            6.64223260960741,
                            46.7729905451238
                        ],
                        [
                            6.64224377404216,
                            46.7729793512761
                        ],
                        [
                            6.64225483366003,
                            46.7729681116718
                        ],
                        [
                            6.64226581549974,
                            46.772956835285
                        ],
                        [
                            6.64227670689787,
                            46.772945513791
                        ],
                        [
                            6.64228903621372,
                            46.7729325556826
                        ],
                        [
                            6.64230127415768,
                            46.7729195612454
                        ],
                        [
                            6.64231342166694,
                            46.772906521152
                        ],
                        [
                            6.64232547781251,
                            46.7728934441809
                        ],
                        [
                            6.64233744259447,
                            46.7728803303322
                        ],
                        [
                            6.64234931599658,
                            46.7728671807038
                        ],
                        [
                            6.64236109897226,
                            46.7728539848702
                        ],
                        [
                            6.64237279058445,
                            46.7728407521591
                        ],
                        [
                            6.64238311311964,
                            46.7728289319734
                        ],
                        [
                            6.64239333070832,
                            46.7728170748156
                        ],
                        [
                            6.64240345773387,
                            46.7728051807861
                        ],
                        [
                            6.64241348074201,
                            46.7727932410061
                        ],
                        [
                            6.64242339959469,
                            46.7727812648085
                        ],
                        [
                            6.64243322708531,
                            46.7727692517338
                        ],
                        [
                            6.64244296333572,
                            46.7727571935469
                        ],
                        [
                            6.64245258252384,
                            46.7727451070884
                        ],
                        [
                            6.64246211047993,
                            46.7727329749687
                        ],
                        [
                            6.64247246838031,
                            46.7727196253195
                        ],
                        [
                            6.64248274849408,
                            46.7727062394368
                        ],
                        [
                            6.64249293711528,
                            46.7726928254611
                        ],
                        [
                            6.64250304701288,
                            46.7726793845797
                        ],
                        [
                            6.64251307993934,
                            46.7726659063726
                        ],
                        [
                            6.64252302042813,
                            46.7726524099493
                        ],
                        [
                            6.64253288392961,
                            46.7726388772982
                        ],
                        [
                            6.64254265593877,
                            46.7726253165542
                        ],
                        [
                            6.64255237653566,
                            46.7726116654035
                        ],
                        [
                            6.64256201921639,
                            46.7725979868037
                        ],
                        [
                            6.64257155680445,
                            46.7725842811143
                        ],
                        [
                            6.6425810038374,
                            46.7725705380045
                        ],
                        [
                            6.64259036016919,
                            46.7725567673565
                        ],
                        [
                            6.64259962499268,
                            46.7725429697137
                        ],
                        [
                            6.64260878474,
                            46.7725291438835
                        ],
                        [
                            6.6426178675085,
                            46.7725152812767
                        ],
                        [
                            6.6426268320018,
                            46.7725014183928
                        ],
                        [
                            6.64263570500327,
                            46.7724875274161
                        ],
                        [
                            6.64264448663475,
                            46.7724736001117
                        ],
                        [
                            6.6426531646505,
                            46.7724596539642
                        ],
                        [
                            6.6426617503674,
                            46.7724456802675
                        ],
                        [
                            6.64267024631265,
                            46.7724316702542
                        ],
                        [
                            6.64267864983741,
                            46.772417640927
                        ],
                        [
                            6.64268694906937,
                            46.772403584516
                        ],
                        [
                            6.64273093833261,
                            46.7723419094661
                        ],
                        [
                            6.64289646374035,
                            46.771906042342
                        ],
                        [
                            6.64296593084837,
                            46.771688465888
                        ],
                        [
                            6.64301501289078,
                            46.7714681385545
                        ],
                        [
                            6.64305676523213,
                            46.7711855979096
                        ],
                        [
                            6.64307071982833,
                            46.7707108900212
                        ],
                        [
                            6.64311391163552,
                            46.7704726197311
                        ],
                        [
                            6.64320379088288,
                            46.7702202812635
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "50",
                "nomsquart": "Quartier 6",
                "character": "4",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63810035575523,
                46.7682216553361
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63979058490426,
                46.7684324089972
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64346298510624,
                46.768414534768
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64277054252588,
                46.7703889893638
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63767947207408,
                46.7726812222895
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64122716002016,
                46.7718565082103
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63972357128073,
                46.7741131383942
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64102970962186,
                46.7731737499843
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63813519218226,
                46.7707184347304
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.6352352392868,
                46.7706913745406
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63578847949773,
                46.7700959342442
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "hydrant",
                "name": "Protéger l'hydrant",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.63379491646622,
                46.7722169145084
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "WC publics",
                "name": "Remplacer les robinets des WC publics par des installations écologiques",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64118826098474,
                46.7688145047192
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "fontaine",
                "name": "Libérer une fontaine détournée par la mafia",
                "description": "Vise à éviter le sabotage et le vol d'eau",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64185880395769,
                46.7690106422369
              ]
            
          }
        },
        {
          "type": "Feature",
          "properties": {
                "type": "arrosage",
                "name": "Régler le débit d'un arrosage communal",
                "description": "Vise à limiter l'utilisation inutile de l'eau potable",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
          },
          "geometry": {
            "type": "Point",
            "coordinates": 
              [
                6.64067804166853,
                46.7691237343131
              ]
            
          }
        }
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.65206936872842,
                            46.7702866319151
                        ],
                        [
                            6.65190358448784,
                            46.7701094381774
                        ],
                        [
                            6.65185936593481,
                            46.770062264191
                        ],
                        [
                            6.65171967761283,
                            46.7699092697036
                        ],
                        [
                            6.65156879097742,
                            46.7697610553471
                        ],
                        [
                            6.65132941621211,
                            46.7695489883397
                        ],
                        [
                            6.65112468980429,
                            46.7693850184398
                        ],
                        [
                            6.65092224801182,
                            46.7692350075059
                        ],
                        [
                            6.65080965305226,
                            46.7691544359446
                        ],
                        [
                            6.65058782590554,
                            46.7690140962694
                        ],
                        [
                            6.65052153740189,
                            46.7689721671096
                        ],
                        [
                            6.65032507937266,
                            46.768860788739
                        ],
                        [
                            6.65002708124943,
                            46.7686919441913
                        ],
                        [
                            6.64997321157861,
                            46.7686602660203
                        ],
                        [
                            6.64991934277821,
                            46.7686285872803
                        ],
                        [
                            6.6496578840606,
                            46.7685038045522
                        ],
                        [
                            6.64950486577027,
                            46.7684391445378
                        ],
                        [
                            6.64938346894907,
                            46.7683876573234
                        ],
                        [
                            6.64902673520039,
                            46.7682605044332
                        ],
                        [
                            6.6489961182222,
                            46.7682503070884
                        ],
                        [
                            6.64881944952096,
                            46.7681915094865
                        ],
                        [
                            6.64866987723112,
                            46.768141985837
                        ],
                        [
                            6.64836022349063,
                            46.7680542890139
                        ],
                        [
                            6.64833709144815,
                            46.7680960494636
                        ],
                        [
                            6.64822728350307,
                            46.7680668615335
                        ],
                        [
                            6.64825094160975,
                            46.7680249246574
                        ],
                        [
                            6.64792102837223,
                            46.7679439231996
                        ],
                        [
                            6.64790092156394,
                            46.7679401851889
                        ],
                        [
                            6.64758625249337,
                            46.7678820928855
                        ],
                        [
                            6.64734901122551,
                            46.7678383010344
                        ],
                        [
                            6.64731754460711,
                            46.7678325052542
                        ],
                        [
                            6.64714010251665,
                            46.7677997880616
                        ],
                        [
                            6.64678740676071,
                            46.7677547889656
                        ],
                        [
                            6.64645907091592,
                            46.7677181440521
                        ],
                        [
                            6.64643541231165,
                            46.7677155506223
                        ],
                        [
                            6.6458451881051,
                            46.7676731266139
                        ],
                        [
                            6.6455411425383,
                            46.7676709059057
                        ],
                        [
                            6.64517561342876,
                            46.7680313650196
                        ],
                        [
                            6.64498935279,
                            46.7682150250965
                        ],
                        [
                            6.64438951331958,
                            46.7688063793462
                        ],
                        [
                            6.64369460569171,
                            46.7695220213853
                        ],
                        [
                            6.64357686010929,
                            46.769649032313
                        ],
                        [
                            6.64347090081043,
                            46.7697935779733
                        ],
                        [
                            6.64331055300446,
                            46.7700214957452
                        ],
                        [
                            6.64320379088288,
                            46.7702202812635
                        ],
                        [
                            6.64311391163552,
                            46.7704726197311
                        ],
                        [
                            6.64307071982833,
                            46.7707108900212
                        ],
                        [
                            6.64305676523213,
                            46.7711855979096
                        ],
                        [
                            6.64333661264094,
                            46.7711645202837
                        ],
                        [
                            6.64338193343391,
                            46.7713759704321
                        ],
                        [
                            6.64345417487325,
                            46.7715820313853
                        ],
                        [
                            6.6435548967301,
                            46.7717746163151
                        ],
                        [
                            6.64365421344802,
                            46.7719116872018
                        ],
                        [
                            6.64366217225551,
                            46.7719224478529
                        ],
                        [
                            6.6437421119509,
                            46.7720329349951
                        ],
                        [
                            6.64378894852929,
                            46.7720974924678
                        ],
                        [
                            6.64409642414851,
                            46.7724403106209
                        ],
                        [
                            6.64422502977781,
                            46.7725625614436
                        ],
                        [
                            6.64490796546711,
                            46.7733093900543
                        ],
                        [
                            6.6449372168123,
                            46.7733413494958
                        ],
                        [
                            6.64505834559039,
                            46.7734736226905
                        ],
                        [
                            6.64512290485039,
                            46.7735441504716
                        ],
                        [
                            6.64526993386762,
                            46.7737048509583
                        ],
                        [
                            6.64587143188802,
                            46.7743643861687
                        ],
                        [
                            6.64593984933334,
                            46.7744397978821
                        ],
                        [
                            6.646272004897,
                            46.774806800368
                        ],
                        [
                            6.64631824887015,
                            46.774858668074
                        ],
                        [
                            6.64650409882752,
                            46.7750867463232
                        ],
                        [
                            6.64652146329156,
                            46.7751080071123
                        ],
                        [
                            6.64666725664558,
                            46.7752642892157
                        ],
                        [
                            6.64677791009176,
                            46.7753793958409
                        ],
                        [
                            6.64688879886898,
                            46.7754963027318
                        ],
                        [
                            6.64717446754338,
                            46.7757931718868
                        ],
                        [
                            6.6472975092751,
                            46.7759207778116
                        ],
                        [
                            6.64755569243121,
                            46.776190377466
                        ],
                        [
                            6.64761857042912,
                            46.7762866202898
                        ],
                        [
                            6.64761241451232,
                            46.7762867571399
                        ],
                        [
                            6.64761328424917,
                            46.7762988179395
                        ],
                        [
                            6.64761329132316,
                            46.776300131357
                        ],
                        [
                            6.64761320649751,
                            46.7763014441371
                        ],
                        [
                            6.64761301711524,
                            46.776302747407
                        ],
                        [
                            6.64761272318441,
                            46.7763040406176
                        ],
                        [
                            6.64761233748303,
                            46.7763053244067
                        ],
                        [
                            6.64761184803218,
                            46.7763065981421
                        ],
                        [
                            6.64761126626978,
                            46.776307844882
                        ],
                        [
                            6.64761058009596,
                            46.7763090722295
                        ],
                        [
                            6.64760981679398,
                            46.7763102726868
                        ],
                        [
                            6.64760894841048,
                            46.7763114449619
                        ],
                        [
                            6.6476079886517,
                            46.776312580914
                        ],
                        [
                            6.6476069511108,
                            46.7763136800881
                        ],
                        [
                            6.6476058221946,
                            46.7763147429391
                        ],
                        [
                            6.6476046156254,
                            46.7763157602281
                        ],
                        [
                            6.6476033449964,
                            46.7763167315002
                        ],
                        [
                            6.64760198232204,
                            46.7763176576594
                        ],
                        [
                            6.6476005557089,
                            46.7763185295666
                        ],
                        [
                            6.64759907701486,
                            46.776319356089
                        ],
                        [
                            6.64759752013489,
                            46.7763201189264
                        ],
                        [
                            6.64758960919706,
                            46.7763238421887
                        ],
                        [
                            6.64755427443638,
                            46.7763403293789
                        ],
                        [
                            6.64757730069038,
                            46.776368376754
                        ],
                        [
                            6.64770596949019,
                            46.7765052872977
                        ],
                        [
                            6.64770726208328,
                            46.7765064657743
                        ],
                        [
                            6.64777136983746,
                            46.7764923369886
                        ],
                        [
                            6.64777381392603,
                            46.7764953221927
                        ],
                        [
                            6.64778037965053,
                            46.7765029245299
                        ],
                        [
                            6.6478644367357,
                            46.7766015630431
                        ],
                        [
                            6.64847011535367,
                            46.777266060504
                        ],
                        [
                            6.64883848290935,
                            46.7776663214112
                        ],
                        [
                            6.64907370993211,
                            46.7779219044421
                        ],
                        [
                            6.64924887604718,
                            46.7781121210857
                        ],
                        [
                            6.64932819707744,
                            46.7781858068384
                        ],
                        [
                            6.64959093324808,
                            46.7781283414587
                        ],
                        [
                            6.64975476930444,
                            46.7780911520947
                        ],
                        [
                            6.65003720779101,
                            46.7780295046523
                        ],
                        [
                            6.65010317555902,
                            46.7780135881196
                        ],
                        [
                            6.65042211444855,
                            46.7779452644957
                        ],
                        [
                            6.6505821228316,
                            46.7779100268844
                        ],
                        [
                            6.65059420926342,
                            46.7779073216832
                        ],
                        [
                            6.65087639424495,
                            46.7778449500489
                        ],
                        [
                            6.65091409643362,
                            46.7778367542668
                        ],
                        [
                            6.65091540938675,
                            46.7778364937429
                        ],
                        [
                            6.65128730372901,
                            46.7777553992112
                        ],
                        [
                            6.65145243201,
                            46.7777192063121
                        ],
                        [
                            6.65156790545452,
                            46.777693735323
                        ],
                        [
                            6.65158866271626,
                            46.7776891104665
                        ],
                        [
                            6.65166984977692,
                            46.7776711391241
                        ],
                        [
                            6.65172673308857,
                            46.7776585774661
                        ],
                        [
                            6.65175734231629,
                            46.7776517721227
                        ],
                        [
                            6.65193495076651,
                            46.7776127853249
                        ],
                        [
                            6.65196844876213,
                            46.7776054595691
                        ],
                        [
                            6.65226152837255,
                            46.777541091338
                        ],
                        [
                            6.65229318858416,
                            46.7775341124551
                        ],
                        [
                            6.65229560680226,
                            46.7775334724435
                        ],
                        [
                            6.65229798771189,
                            46.7775327602469
                        ],
                        [
                            6.65230031666375,
                            46.7775319938836
                        ],
                        [
                            6.65230260751599,
                            46.7775311547807
                        ],
                        [
                            6.65230484653878,
                            46.7775302527268
                        ],
                        [
                            6.65230702081747,
                            46.7775292964181
                        ],
                        [
                            6.65230914407384,
                            46.7775282766148
                        ],
                        [
                            6.6523112161796,
                            46.7775272021013
                        ],
                        [
                            6.65231321008407,
                            46.777526064455
                        ],
                        [
                            6.65231512540229,
                            46.7775248900284
                        ],
                        [
                            6.65231696385286,
                            46.7775236705975
                        ],
                        [
                            6.6523187367682,
                            46.7775223963572
                        ],
                        [
                            6.65232043202473,
                            46.7775210765579
                        ],
                        [
                            6.65232203683618,
                            46.7775197111117
                        ],
                        [
                            6.65232357597602,
                            46.7775183001892
                        ],
                        [
                            6.65232503732078,
                            46.777516853041
                        ],
                        [
                            6.65232639543409,
                            46.7775153601577
                        ],
                        [
                            6.65232768761122,
                            46.7775138399154
                        ],
                        [
                            6.65232887562942,
                            46.7775122827167
                        ],
                        [
                            6.65232997306623,
                            46.7775106892042
                        ],
                        [
                            6.6523309780667,
                            46.7775090769352
                        ],
                        [
                            6.65233189249379,
                            46.7775074278034
                        ],
                        [
                            6.65233271608287,
                            46.7775057599261
                        ],
                        [
                            6.65233343444127,
                            46.7775040737532
                        ],
                        [
                            6.65233400763824,
                            46.7775024766265
                        ],
                        [
                            6.65233448986888,
                            46.7775008695385
                        ],
                        [
                            6.65233486674062,
                            46.7774992529392
                        ],
                        [
                            6.65233515277438,
                            46.7774976175943
                        ],
                        [
                            6.65233532053456,
                            46.7774959814341
                        ],
                        [
                            6.65233539732047,
                            46.7774943358616
                        ],
                        [
                            6.65233536861916,
                            46.777492689562
                        ],
                        [
                            6.65233523510149,
                            46.7774910513247
                        ],
                        [
                            6.65233499756661,
                            46.7774894211555
                        ],
                        [
                            6.65233465453653,
                            46.777487790808
                        ],
                        [
                            6.65233422014728,
                            46.7774861774007
                        ],
                        [
                            6.6523336923996,
                            46.7774846083734
                        ],
                        [
                            6.6523330604984,
                            46.7774830567472
                        ],
                        [
                            6.65233232351624,
                            46.7774815313008
                        ],
                        [
                            6.65233148158146,
                            46.7774800232501
                        ],
                        [
                            6.65233054721572,
                            46.7774785508005
                        ],
                        [
                            6.65232950697794,
                            46.7774771039763
                        ],
                        [
                            6.65232837590749,
                            46.7774756927642
                        ],
                        [
                            6.65232715160699,
                            46.7774743171478
                        ],
                        [
                            6.6523258355544,
                            46.7774729853732
                        ],
                        [
                            6.65232444064834,
                            46.7774716898424
                        ],
                        [
                            6.65232295226363,
                            46.7774704469266
                        ],
                        [
                            6.65232138570429,
                            46.7774692484953
                        ],
                        [
                            6.65231973923571,
                            46.7774681038707
                        ],
                        [
                            6.65231801366506,
                            46.7774670125092
                        ],
                        [
                            6.65231622177865,
                            46.7774659744991
                        ],
                        [
                            6.65231436356848,
                            46.7774649903893
                        ],
                        [
                            6.65251377960771,
                            46.7774390171238
                        ],
                        [
                            6.65275176978509,
                            46.7776051026729
                        ],
                        [
                            6.65293713315772,
                            46.7777165796091
                        ],
                        [
                            6.6530104791387,
                            46.7777513592306
                        ],
                        [
                            6.65304521214401,
                            46.7777670711659
                        ],
                        [
                            6.65312251627377,
                            46.7777998090943
                        ],
                        [
                            6.65314481732437,
                            46.7778059897855
                        ],
                        [
                            6.65319437685929,
                            46.7778197349
                        ],
                        [
                            6.65333001241279,
                            46.7778572822753
                        ],
                        [
                            6.65333160716323,
                            46.7778556740584
                        ],
                        [
                            6.65332839682659,
                            46.7778513340949
                        ],
                        [
                            6.65339055509227,
                            46.777791309279
                        ],
                        [
                            6.65348558664629,
                            46.7776949879228
                        ],
                        [
                            6.65355726143493,
                            46.7776199154712
                        ],
                        [
                            6.65359985912183,
                            46.7775722608906
                        ],
                        [
                            6.65365126974173,
                            46.7775128817851
                        ],
                        [
                            6.6536912655219,
                            46.7774640392023
                        ],
                        [
                            6.6536997384869,
                            46.7774577102231
                        ],
                        [
                            6.65371386775274,
                            46.7774406255213
                        ],
                        [
                            6.65371765147707,
                            46.7774325550252
                        ],
                        [
                            6.65372338899482,
                            46.7774252183501
                        ],
                        [
                            6.65363456400401,
                            46.777374409719
                        ],
                        [
                            6.65377496836879,
                            46.7771656814285
                        ],
                        [
                            6.65383577478983,
                            46.7770635462934
                        ],
                        [
                            6.65390089491124,
                            46.776952985181
                        ],
                        [
                            6.65400594719431,
                            46.7767349274136
                        ],
                        [
                            6.65409284590019,
                            46.7765135957798
                        ],
                        [
                            6.65411382240395,
                            46.7764399740713
                        ],
                        [
                            6.65415676446248,
                            46.7762876986605
                        ],
                        [
                            6.65420682244669,
                            46.7760604466142
                        ],
                        [
                            6.65418421532198,
                            46.7760573223208
                        ],
                        [
                            6.65421832690693,
                            46.7758100794302
                        ],
                        [
                            6.65421292225831,
                            46.7755609455471
                        ],
                        [
                            6.65418877950521,
                            46.7753127622401
                        ],
                        [
                            6.6541872071793,
                            46.7752948496558
                        ],
                        [
                            6.65418890621673,
                            46.7752681437577
                        ],
                        [
                            6.6541808351601,
                            46.7749054631912
                        ],
                        [
                            6.65418579426937,
                            46.774861687269
                        ],
                        [
                            6.6541890853343,
                            46.774824556758
                        ],
                        [
                            6.65417586014341,
                            46.7747346862482
                        ],
                        [
                            6.65411715896912,
                            46.7745937664141
                        ],
                        [
                            6.65397478817345,
                            46.7743270480156
                        ],
                        [
                            6.65380508740995,
                            46.774084969601
                        ],
                        [
                            6.65368368187789,
                            46.7738802869845
                        ],
                        [
                            6.65366446977043,
                            46.7738419221322
                        ],
                        [
                            6.65363156715875,
                            46.7737726971825
                        ],
                        [
                            6.65341086646616,
                            46.773301950816
                        ],
                        [
                            6.65336330083022,
                            46.7731877353107
                        ],
                        [
                            6.65333508888007,
                            46.7731200717137
                        ],
                        [
                            6.65327181437724,
                            46.7729697637984
                        ],
                        [
                            6.65315974556172,
                            46.7726639408478
                        ],
                        [
                            6.653144371344,
                            46.7726228136189
                        ],
                        [
                            6.65305853446021,
                            46.7723857200307
                        ],
                        [
                            6.6530563930577,
                            46.772379947764
                        ],
                        [
                            6.65303804981053,
                            46.7723270154424
                        ],
                        [
                            6.65303394057375,
                            46.7723125038476
                        ],
                        [
                            6.65292353497659,
                            46.7719197912476
                        ],
                        [
                            6.65290574715215,
                            46.7718557073324
                        ],
                        [
                            6.65289398037314,
                            46.7718186531882
                        ],
                        [
                            6.65283683535084,
                            46.7716432888182
                        ],
                        [
                            6.65277930281416,
                            46.7714675621041
                        ],
                        [
                            6.65275261880008,
                            46.7713850659374
                        ],
                        [
                            6.65271470799015,
                            46.771291336999
                        ],
                        [
                            6.65266179994266,
                            46.7711576528502
                        ],
                        [
                            6.65262350888235,
                            46.7710810137137
                        ],
                        [
                            6.65254971178229,
                            46.7709343214372
                        ],
                        [
                            6.65252823284016,
                            46.7708989095473
                        ],
                        [
                            6.65241567255961,
                            46.7707169557249
                        ],
                        [
                            6.6523962785788,
                            46.7706911833286
                        ],
                        [
                            6.65226164705672,
                            46.7705054791364
                        ],
                        [
                            6.65224490812335,
                            46.7704862023657
                        ],
                        [
                            6.65206936872842,
                            46.7702866319151
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "30",
                "nomsquart": "Quartier 7",
                "character": "3",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [{
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6535579701, 46.7752255816
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65169982872, 46.7759906986
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65025157146, 46.7768104669
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65180913115, 46.774077906
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64986901294, 46.7754988377
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Arrosages",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 150
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64850273251, 46.7758540706
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64858470933, 46.7744604645
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64896726785, 46.7734767426
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65126261898, 46.7727389512
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65153587506, 46.7706075537
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Fontaine",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 150
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64792889473, 46.7700200531
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"WC public",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64891261664, 46.7724110439
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64637133503, 46.7736680219
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                 6.64560621799, 46.7718645317
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64691784721, 46.7707715074
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                 6.6465899399, 46.7692412733
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64522365947, 46.7697058086
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64451319365, 46.7713180196
                ]
            }
        }, {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                 6.64945912881, 46.7693915641
                ]
            }
        }

    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.66114364015512,
                            46.7785588785429
                        ],
                        [
                            6.6610553601311,
                            46.7785059205428
                        ],
                        [
                            6.6610553603412,
                            46.7785059201065
                        ],
                        [
                            6.66105535763528,
                            46.7785059184832
                        ],
                        [
                            6.66105536686567,
                            46.7785059065569
                        ],
                        [
                            6.66112569383391,
                            46.778359856509
                        ],
                        [
                            6.66117140286904,
                            46.7783230149955
                        ],
                        [
                            6.66099720787221,
                            46.7773646642733
                        ],
                        [
                            6.66098641771673,
                            46.7773229396509
                        ],
                        [
                            6.66096932962233,
                            46.7772821615023
                        ],
                        [
                            6.66094594589861,
                            46.7772420602492
                        ],
                        [
                            6.66091881986729,
                            46.7772072412943
                        ],
                        [
                            6.6608802238357,
                            46.7771687455377
                        ],
                        [
                            6.66083738987488,
                            46.7771335493053
                        ],
                        [
                            6.65958008491952,
                            46.7762363527519
                        ],
                        [
                            6.65896784135839,
                            46.7757995564234
                        ],
                        [
                            6.65831407273201,
                            46.7753917087525
                        ],
                        [
                            6.65809005782131,
                            46.7753178489715
                        ],
                        [
                            6.6580467361086,
                            46.7753074771056
                        ],
                        [
                            6.65793998379347,
                            46.7752829070482
                        ],
                        [
                            6.65778656560658,
                            46.7752618861211
                        ],
                        [
                            6.65762784024058,
                            46.7752546821388
                        ],
                        [
                            6.65760999175204,
                            46.7752213650023
                        ],
                        [
                            6.65758232873294,
                            46.775169628653
                        ],
                        [
                            6.6573992276099,
                            46.7750736479709
                        ],
                        [
                            6.65706876498824,
                            46.7749003715815
                        ],
                        [
                            6.65672011129822,
                            46.7747176139562
                        ],
                        [
                            6.65666904188303,
                            46.7746908158281
                        ],
                        [
                            6.6566071452411,
                            46.7747422979759
                        ],
                        [
                            6.65651726350399,
                            46.7748184164194
                        ],
                        [
                            6.65538631906662,
                            46.7741543134563
                        ],
                        [
                            6.65482572540735,
                            46.7738251702399
                        ],
                        [
                            6.65527406353513,
                            46.7732934437493
                        ],
                        [
                            6.65495872349545,
                            46.7729909937823
                        ],
                        [
                            6.65486732105647,
                            46.7729017561663
                        ],
                        [
                            6.65457165378581,
                            46.77260636731
                        ],
                        [
                            6.65429934461755,
                            46.7723345274526
                        ],
                        [
                            6.65414439847491,
                            46.7723381397555
                        ],
                        [
                            6.65400830817583,
                            46.7723417014849
                        ],
                        [
                            6.65391567981683,
                            46.7723457416607
                        ],
                        [
                            6.65379669452045,
                            46.7723524796855
                        ],
                        [
                            6.65369145901109,
                            46.7723591321306
                        ],
                        [
                            6.65368540768002,
                            46.7723520734052
                        ],
                        [
                            6.65365722687325,
                            46.7723541284148
                        ],
                        [
                            6.65305853446021,
                            46.7723857200307
                        ],
                        [
                            6.653144371344,
                            46.7726228136189
                        ],
                        [
                            6.65315974556172,
                            46.7726639408478
                        ],
                        [
                            6.65327181437724,
                            46.7729697637984
                        ],
                        [
                            6.65333508888007,
                            46.7731200717137
                        ],
                        [
                            6.65336330083022,
                            46.7731877353107
                        ],
                        [
                            6.65341086646616,
                            46.773301950816
                        ],
                        [
                            6.65363156715875,
                            46.7737726971825
                        ],
                        [
                            6.65366446977043,
                            46.7738419221322
                        ],
                        [
                            6.65368368187789,
                            46.7738802869845
                        ],
                        [
                            6.65380508740995,
                            46.774084969601
                        ],
                        [
                            6.65397478817345,
                            46.7743270480156
                        ],
                        [
                            6.65411715896912,
                            46.7745937664141
                        ],
                        [
                            6.65417586014341,
                            46.7747346862482
                        ],
                        [
                            6.6541890853343,
                            46.774824556758
                        ],
                        [
                            6.65418579426937,
                            46.774861687269
                        ],
                        [
                            6.6541808351601,
                            46.7749054631912
                        ],
                        [
                            6.65418890621673,
                            46.7752681437577
                        ],
                        [
                            6.6541872071793,
                            46.7752948496558
                        ],
                        [
                            6.65418877950521,
                            46.7753127622401
                        ],
                        [
                            6.65421292225831,
                            46.7755609455471
                        ],
                        [
                            6.65421832690693,
                            46.7758100794302
                        ],
                        [
                            6.65418421532198,
                            46.7760573223208
                        ],
                        [
                            6.65420682244669,
                            46.7760604466142
                        ],
                        [
                            6.65415676446248,
                            46.7762876986605
                        ],
                        [
                            6.65411382240395,
                            46.7764399740713
                        ],
                        [
                            6.65409284590019,
                            46.7765135957798
                        ],
                        [
                            6.65400594719431,
                            46.7767349274136
                        ],
                        [
                            6.65390089491124,
                            46.776952985181
                        ],
                        [
                            6.65383577478983,
                            46.7770635462934
                        ],
                        [
                            6.65377496836879,
                            46.7771656814285
                        ],
                        [
                            6.65363456400401,
                            46.777374409719
                        ],
                        [
                            6.65372338899482,
                            46.7774252183501
                        ],
                        [
                            6.65371765147707,
                            46.7774325550252
                        ],
                        [
                            6.65371386775274,
                            46.7774406255213
                        ],
                        [
                            6.6536997384869,
                            46.7774577102231
                        ],
                        [
                            6.6536912655219,
                            46.7774640392023
                        ],
                        [
                            6.65365126974173,
                            46.7775128817851
                        ],
                        [
                            6.65359985912183,
                            46.7775722608906
                        ],
                        [
                            6.65355726143493,
                            46.7776199154712
                        ],
                        [
                            6.65348558664629,
                            46.7776949879228
                        ],
                        [
                            6.65339055509227,
                            46.777791309279
                        ],
                        [
                            6.65332839682659,
                            46.7778513340949
                        ],
                        [
                            6.65333160716323,
                            46.7778556740584
                        ],
                        [
                            6.65333001241279,
                            46.7778572822753
                        ],
                        [
                            6.65319437685929,
                            46.7778197349
                        ],
                        [
                            6.65314481732437,
                            46.7778059897855
                        ],
                        [
                            6.65312251627377,
                            46.7777998090943
                        ],
                        [
                            6.65309745202804,
                            46.7779290877014
                        ],
                        [
                            6.65275620531273,
                            46.7781713356513
                        ],
                        [
                            6.65237348164637,
                            46.7784110477006
                        ],
                        [
                            6.65197713080813,
                            46.7786153100982
                        ],
                        [
                            6.65174707603945,
                            46.77871240856
                        ],
                        [
                            6.6517831139335,
                            46.7791763960807
                        ],
                        [
                            6.6518003328907,
                            46.7792257227628
                        ],
                        [
                            6.65194157531832,
                            46.7792024079797
                        ],
                        [
                            6.65201924214761,
                            46.7793000092756
                        ],
                        [
                            6.65230926809049,
                            46.7792122301268
                        ],
                        [
                            6.65264802604082,
                            46.7791589704061
                        ],
                        [
                            6.65296277913094,
                            46.7791354108054
                        ],
                        [
                            6.65360432635238,
                            46.7791335309498
                        ],
                        [
                            6.6542864156636,
                            46.7791172645724
                        ],
                        [
                            6.65434304828463,
                            46.779121970217
                        ],
                        [
                            6.65465354697295,
                            46.7791476740815
                        ],
                        [
                            6.65502960330127,
                            46.779185702171
                        ],
                        [
                            6.65524158143285,
                            46.7792056898474
                        ],
                        [
                            6.65535270901842,
                            46.7792269656259
                        ],
                        [
                            6.65536576136771,
                            46.7792301119128
                        ],
                        [
                            6.65539215126628,
                            46.7792341618575
                        ],
                        [
                            6.65585435510942,
                            46.779318477553
                        ],
                        [
                            6.65637772125746,
                            46.7794382956398
                        ],
                        [
                            6.65679445488669,
                            46.7795519820057
                        ],
                        [
                            6.65706614828507,
                            46.7796260814027
                        ],
                        [
                            6.65715920688746,
                            46.7796743971922
                        ],
                        [
                            6.6572734356703,
                            46.779734822633
                        ],
                        [
                            6.65802893657885,
                            46.7800114918397
                        ],
                        [
                            6.65844769007303,
                            46.7801850994678
                        ],
                        [
                            6.65913350735227,
                            46.7804908809018
                        ],
                        [
                            6.65918269543038,
                            46.7805124472316
                        ],
                        [
                            6.65954562300059,
                            46.7806712754977
                        ],
                        [
                            6.65989581688547,
                            46.7808414406183
                        ],
                        [
                            6.66054392718403,
                            46.7811750231419
                        ],
                        [
                            6.66135217348431,
                            46.7816376151647
                        ],
                        [
                            6.66204525120637,
                            46.7820689216346
                        ],
                        [
                            6.6621147812855,
                            46.7821148241434
                        ],
                        [
                            6.6621268143695,
                            46.7820977236005
                        ],
                        [
                            6.66214244986877,
                            46.7821032279049
                        ],
                        [
                            6.66212827404061,
                            46.7821236417494
                        ],
                        [
                            6.66266351318225,
                            46.7824764147102
                        ],
                        [
                            6.66294361798104,
                            46.7826770373179
                        ],
                        [
                            6.66309045973718,
                            46.7826016607797
                        ],
                        [
                            6.66340358650763,
                            46.7824401990895
                        ],
                        [
                            6.66344655825626,
                            46.7824180463905
                        ],
                        [
                            6.66348036365548,
                            46.78239857513
                        ],
                        [
                            6.6634803639115,
                            46.782398574982
                        ],
                        [
                            6.66354097735424,
                            46.7823635432241
                        ],
                        [
                            6.66384311381721,
                            46.7821893664347
                        ],
                        [
                            6.6640780431529,
                            46.7820624107147
                        ],
                        [
                            6.66422168138477,
                            46.7820092307545
                        ],
                        [
                            6.66422286634415,
                            46.7820087890051
                        ],
                        [
                            6.66424236240555,
                            46.7820008250676
                        ],
                        [
                            6.66434364439121,
                            46.7819334137571
                        ],
                        [
                            6.66436990648527,
                            46.7819193785226
                        ],
                        [
                            6.66460100661,
                            46.7818035506481
                        ],
                        [
                            6.66486338933727,
                            46.7816887441578
                        ],
                        [
                            6.66498837231405,
                            46.7816669222997
                        ],
                        [
                            6.66511797890944,
                            46.7815967337788
                        ],
                        [
                            6.66558616826821,
                            46.7813396567953
                        ],
                        [
                            6.66566617376996,
                            46.7812945898448
                        ],
                        [
                            6.66603645222014,
                            46.7809794537095
                        ],
                        [
                            6.6661946086521,
                            46.7808267851458
                        ],
                        [
                            6.66630494667151,
                            46.7807576342677
                        ],
                        [
                            6.66631033457799,
                            46.780756321367
                        ],
                        [
                            6.66648406104542,
                            46.7806591731574
                        ],
                        [
                            6.66614056990709,
                            46.7805136338575
                        ],
                        [
                            6.66575226854263,
                            46.780406111525
                        ],
                        [
                            6.66518297649387,
                            46.7801903994191
                        ],
                        [
                            6.66474950617841,
                            46.7800552194765
                        ],
                        [
                            6.6636832372769,
                            46.7797868289133
                        ],
                        [
                            6.66319448963761,
                            46.7796623327467
                        ],
                        [
                            6.66283143532627,
                            46.7795393187101
                        ],
                        [
                            6.66249569399815,
                            46.7793748388816
                        ],
                        [
                            6.66114364015512,
                            46.7785588785429
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "70",
                "nomsquart": "Quartier 8",
                "character": "7",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint":  [
     {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66502106292, 46.7810459362
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 150
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6633542008, 46.7797616326
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66056698872, 46.7792424461
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65911873146, 46.7801441911
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65939198754, 46.7778215144
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65843559124, 46.7786139571
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65728791568, 46.7786959339
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6582989632, 46.7770290718
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Fontaine",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65567570477, 46.7770290718
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65581233281, 46.7761136639
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Fontaine",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65583965842, 46.7786139571
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Fontaine",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65384488899, 46.77784884
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65461000604, 46.7767558157
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65542977429, 46.7777395376
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65655012425, 46.7792424461
                ]
            }
        }

    ]
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.66415722064223,
                            46.7781540382053
                        ],
                        [
                            6.66416095934473,
                            46.7781522948581
                        ],
                        [
                            6.66416484622542,
                            46.7781504550171
                        ],
                        [
                            6.66416906778562,
                            46.7781484408234
                        ],
                        [
                            6.66417087975794,
                            46.7781475621141
                        ],
                        [
                            6.6641765910612,
                            46.7781447743893
                        ],
                        [
                            6.6641795475162,
                            46.7781433008725
                        ],
                        [
                            6.6641830255048,
                            46.7781415645681
                        ],
                        [
                            6.66418761715497,
                            46.7781392319486
                        ],
                        [
                            6.66419074487435,
                            46.7781376358746
                        ],
                        [
                            6.66419316497314,
                            46.7781363770915
                        ],
                        [
                            6.66419813710004,
                            46.778133782939
                        ],
                        [
                            6.66420501316818,
                            46.7781301147943
                        ],
                        [
                            6.66420708290335,
                            46.7781289878584
                        ],
                        [
                            6.66421207053958,
                            46.7781262688194
                        ],
                        [
                            6.66432476805192,
                            46.778074947743
                        ],
                        [
                            6.66450054728723,
                            46.7779986863132
                        ],
                        [
                            6.664668468183,
                            46.7778678561751
                        ],
                        [
                            6.66474088072648,
                            46.7776857308993
                        ],
                        [
                            6.66478734465012,
                            46.7776052630372
                        ],
                        [
                            6.66479059330817,
                            46.7775999864976
                        ],
                        [
                            6.66479314109662,
                            46.7775957114101
                        ],
                        [
                            6.66479382849615,
                            46.7775945537492
                        ],
                        [
                            6.66479616377489,
                            46.7775905038366
                        ],
                        [
                            6.66479689956782,
                            46.7775892233311
                        ],
                        [
                            6.66479890772389,
                            46.7775856210032
                        ],
                        [
                            6.66480005287461,
                            46.7775835513041
                        ],
                        [
                            6.66480173573032,
                            46.777580426547
                        ],
                        [
                            6.66480294815009,
                            46.777578158391
                        ],
                        [
                            6.6648048721153,
                            46.7775744542531
                        ],
                        [
                            6.66480573871119,
                            46.7775727691057
                        ],
                        [
                            6.66480748169516,
                            46.777569289441
                        ],
                        [
                            6.66480867704968,
                            46.7775668675049
                        ],
                        [
                            6.66481010432594,
                            46.7775639077292
                        ],
                        [
                            6.66481119871914,
                            46.7775616087785
                        ],
                        [
                            6.66481293497401,
                            46.7775578656357
                        ],
                        [
                            6.66481372259246,
                            46.7775561366786
                        ],
                        [
                            6.66481536947362,
                            46.7775524407226
                        ],
                        [
                            6.66481627843533,
                            46.7775503565212
                        ],
                        [
                            6.66481771669154,
                            46.7775469918189
                        ],
                        [
                            6.66481867385072,
                            46.7775446992884
                        ],
                        [
                            6.66482005300553,
                            46.7775413289427
                        ],
                        [
                            6.66482101895897,
                            46.7775389018948
                        ],
                        [
                            6.6648222380821,
                            46.7775357873894
                        ],
                        [
                            6.66482313330568,
                            46.7775334332636
                        ],
                        [
                            6.66482448037247,
                            46.7775298270092
                        ],
                        [
                            6.66482505046004,
                            46.7775282491767
                        ],
                        [
                            6.66482652310931,
                            46.7775241129606
                        ],
                        [
                            6.66482701134606,
                            46.7775226864366
                        ],
                        [
                            6.66482843896105,
                            46.7775184648321
                        ],
                        [
                            6.66482895546889,
                            46.7775168685213
                        ],
                        [
                            6.6648302272143,
                            46.7775129034182
                        ],
                        [
                            6.66483123893043,
                            46.7775095835477
                        ],
                        [
                            6.66483190756199,
                            46.7775073783013
                        ],
                        [
                            6.66483255723559,
                            46.7775051291914
                        ],
                        [
                            6.66483362908718,
                            46.7775013812255
                        ],
                        [
                            6.6648351426106,
                            46.7774957474704
                        ],
                        [
                            6.66483656261582,
                            46.777490151763
                        ],
                        [
                            6.66483788981403,
                            46.7774845446308
                        ],
                        [
                            6.66483869721193,
                            46.7774808707121
                        ],
                        [
                            6.6648392535313,
                            46.7774782895911
                        ],
                        [
                            6.66483978804659,
                            46.7774756520438
                        ],
                        [
                            6.66484035765313,
                            46.7774728004745
                        ],
                        [
                            6.66484095143336,
                            46.7774696102721
                        ],
                        [
                            6.66484150267371,
                            46.7774665465711
                        ],
                        [
                            6.66484191066233,
                            46.7774641349675
                        ],
                        [
                            6.66484239840401,
                            46.7774611661164
                        ],
                        [
                            6.66484294880376,
                            46.7774575516153
                        ],
                        [
                            6.66484326370368,
                            46.7774553746656
                        ],
                        [
                            6.66484372424199,
                            46.7774519806338
                        ],
                        [
                            6.66484404579982,
                            46.7774494543994
                        ],
                        [
                            6.66484444506031,
                            46.7774460967208
                        ],
                        [
                            6.6648447011514,
                            46.7774437635055
                        ],
                        [
                            6.66484507332672,
                            46.7774401293222
                        ],
                        [
                            6.66484524599457,
                            46.77743825886
                        ],
                        [
                            6.6648455885152,
                            46.7774342630402
                        ],
                        [
                            6.66484576709454,
                            46.7774318084961
                        ],
                        [
                            6.66484597286451,
                            46.777428829063
                        ],
                        [
                            6.66484612057625,
                            46.7774262685787
                        ],
                        [
                            6.66484631623106,
                            46.7774225533928
                        ],
                        [
                            6.66484636836498,
                            46.7774211853047
                        ],
                        [
                            6.66484652282241,
                            46.7774168728336
                        ],
                        [
                            6.66484656797332,
                            46.7774147067443
                        ],
                        [
                            6.6648466381091,
                            46.7774111001264
                        ],
                        [
                            6.6648466457462,
                            46.7774089583988
                        ],
                        [
                            6.66484665609428,
                            46.7774053268917
                        ],
                        [
                            6.66484888394576,
                            46.7772503427544
                        ],
                        [
                            6.66484892168777,
                            46.7772467602081
                        ],
                        [
                            6.66484897524501,
                            46.7772412984376
                        ],
                        [
                            6.66484899178193,
                            46.7772355085524
                        ],
                        [
                            6.66484898160794,
                            46.7772298687567
                        ],
                        [
                            6.66484896533853,
                            46.7772264960477
                        ],
                        [
                            6.66484887311363,
                            46.7772180561586
                        ],
                        [
                            6.66484885039696,
                            46.7772162390925
                        ],
                        [
                            6.66484880128749,
                            46.7772138062843
                        ],
                        [
                            6.66484864789208,
                            46.7772066229118
                        ],
                        [
                            6.66484851614625,
                            46.7772018963068
                        ],
                        [
                            6.6648483458053,
                            46.7771965210568
                        ],
                        [
                            6.66484817558209,
                            46.7771917337691
                        ],
                        [
                            6.66484787656655,
                            46.7771846303062
                        ],
                        [
                            6.66484776913804,
                            46.7771821463143
                        ],
                        [
                            6.66484473595664,
                            46.7771198741486
                        ],
                        [
                            6.66480988610986,
                            46.7766201856452
                        ],
                        [
                            6.66481039202525,
                            46.776594100983
                        ],
                        [
                            6.66481050947321,
                            46.7765894832875
                        ],
                        [
                            6.66481071330912,
                            46.7765848679773
                        ],
                        [
                            6.6648107641742,
                            46.7765840520223
                        ],
                        [
                            6.66481078006233,
                            46.7765837152681
                        ],
                        [
                            6.66481084848836,
                            46.7765826994922
                        ],
                        [
                            6.66481100092725,
                            46.7765802541352
                        ],
                        [
                            6.66481107467333,
                            46.7765793418036
                        ],
                        [
                            6.66481112957661,
                            46.776578526771
                        ],
                        [
                            6.66481123707546,
                            46.7765773326853
                        ],
                        [
                            6.66481137361103,
                            46.7765756435689
                        ],
                        [
                            6.66481153902542,
                            46.7765739786578
                        ],
                        [
                            6.6648115965555,
                            46.7765733396199
                        ],
                        [
                            6.66481165545215,
                            46.7765728068118
                        ],
                        [
                            6.66481183136042,
                            46.7765710362786
                        ],
                        [
                            6.66481214781727,
                            46.7765683526354
                        ],
                        [
                            6.66481216889356,
                            46.7765681619688
                        ],
                        [
                            6.66481218322043,
                            46.7765680524065
                        ],
                        [
                            6.66481237416251,
                            46.7765664331637
                        ],
                        [
                            6.66481300200428,
                            46.7765618351237
                        ],
                        [
                            6.66481371356354,
                            46.7765572430492
                        ],
                        [
                            6.66481451013658,
                            46.7765526578487
                        ],
                        [
                            6.66481539041417,
                            46.7765480795133
                        ],
                        [
                            6.66481543388731,
                            46.7765478736694
                        ],
                        [
                            6.66481550354397,
                            46.7765475117157
                        ],
                        [
                            6.66481585950198,
                            46.7765458583976
                        ],
                        [
                            6.66481635569254,
                            46.7765435089512
                        ],
                        [
                            6.66481650715575,
                            46.77654285024
                        ],
                        [
                            6.6648166117127,
                            46.7765423646042
                        ],
                        [
                            6.66481686392509,
                            46.7765412986557
                        ],
                        [
                            6.66481740464952,
                            46.7765389470532
                        ],
                        [
                            6.66481771769067,
                            46.7765376903065
                        ],
                        [
                            6.66481782510629,
                            46.7765372363259
                        ],
                        [
                            6.66481799398723,
                            46.776536581076
                        ],
                        [
                            6.66481853858143,
                            46.7765343947275
                        ],
                        [
                            6.66481904198772,
                            46.7765325148847
                        ],
                        [
                            6.6648191421343,
                            46.7765321263207
                        ],
                        [
                            6.66481924426285,
                            46.7765317595396
                        ],
                        [
                            6.66481975485676,
                            46.7765298528561
                        ],
                        [
                            6.66482044650706,
                            46.7765274418381
                        ],
                        [
                            6.66482056463967,
                            46.7765270175802
                        ],
                        [
                            6.66482064441217,
                            46.7765267519621
                        ],
                        [
                            6.66482105478471,
                            46.7765253214477
                        ],
                        [
                            6.66482206635348,
                            46.7765220173304
                        ],
                        [
                            6.66482209064526,
                            46.7765219364462
                        ],
                        [
                            6.66482210076963,
                            46.7765219049159
                        ],
                        [
                            6.6648224383395,
                            46.7765208023013
                        ],
                        [
                            6.66482366289649,
                            46.7765170399927
                        ],
                        [
                            6.66482372214391,
                            46.7765168554788
                        ],
                        [
                            6.6648237375261,
                            46.776516810702
                        ],
                        [
                            6.66482390553396,
                            46.7765162945174
                        ],
                        [
                            6.66482545502001,
                            46.7765118007857
                        ],
                        [
                            6.66482711132184,
                            46.7765072547029
                        ],
                        [
                            6.66482727966068,
                            46.7765068163051
                        ],
                        [
                            6.66482728405138,
                            46.7765068042871
                        ],
                        [
                            6.66482730651971,
                            46.7765067463573
                        ],
                        [
                            6.66482885121156,
                            46.7765027235806
                        ],
                        [
                            6.66483067598554,
                            46.7764982083273
                        ],
                        [
                            6.6648309385745,
                            46.7764975897557
                        ],
                        [
                            6.66483123770988,
                            46.776496854585
                        ],
                        [
                            6.6648318412972,
                            46.7764954632433
                        ],
                        [
                            6.66483258563084,
                            46.7764937098424
                        ],
                        [
                            6.66483325523721,
                            46.7764922039405
                        ],
                        [
                            6.66483337777662,
                            46.7764919214723
                        ],
                        [
                            6.66483354160588,
                            46.7764915599156
                        ],
                        [
                            6.66483457885101,
                            46.7764892272174
                        ],
                        [
                            6.66483533308553,
                            46.7764876062783
                        ],
                        [
                            6.66483560881774,
                            46.7764869977618
                        ],
                        [
                            6.66483593439422,
                            46.776486313995
                        ],
                        [
                            6.66483665559441,
                            46.7764847640505
                        ],
                        [
                            6.66483751459733,
                            46.7764829952956
                        ],
                        [
                            6.66483794428426,
                            46.7764820928789
                        ],
                        [
                            6.66483827227374,
                            46.77648143518
                        ],
                        [
                            6.66483881457753,
                            46.7764803185337
                        ],
                        [
                            6.66483974043309,
                            46.7764784911627
                        ],
                        [
                            6.66484037192879,
                            46.7764772248597
                        ],
                        [
                            6.66484068263871,
                            46.7764766315212
                        ],
                        [
                            6.6648410570838,
                            46.7764758924749
                        ],
                        [
                            6.66484271732769,
                            46.7764727460341
                        ],
                        [
                            6.66484291611982,
                            46.7764723664162
                        ],
                        [
                            6.66484295996378,
                            46.7764722861979
                        ],
                        [
                            6.66484338179093,
                            46.7764714867647
                        ],
                        [
                            6.66484578868605,
                            46.7764671023027
                        ],
                        [
                            6.66484827645975,
                            46.7764627390798
                        ],
                        [
                            6.66485084640849,
                            46.7764583980046
                        ],
                        [
                            6.66485107262638,
                            46.776458029398
                        ],
                        [
                            6.66485111042261,
                            46.776457965656
                        ],
                        [
                            6.66485138200689,
                            46.7764575252835
                        ],
                        [
                            6.66485349588772,
                            46.7764540808582
                        ],
                        [
                            6.66485384002447,
                            46.7764535396199
                        ],
                        [
                            6.66485403332523,
                            46.7764532261836
                        ],
                        [
                            6.66485472750673,
                            46.7764521438392
                        ],
                        [
                            6.66485622621969,
                            46.7764497867501
                        ],
                        [
                            6.6648567327654,
                            46.7764490173071
                        ],
                        [
                            6.66485706064522,
                            46.7764485060879
                        ],
                        [
                            6.66485784561816,
                            46.7764473268836
                        ],
                        [
                            6.66485903739147,
                            46.7764455165796
                        ],
                        [
                            6.66485963904685,
                            46.7764446327539
                        ],
                        [
                            6.66486017855269,
                            46.7764438222958
                        ],
                        [
                            6.66486091071171,
                            46.7764427646909
                        ],
                        [
                            6.6648619267585,
                            46.7764412721282
                        ],
                        [
                            6.66486298480201,
                            46.7764397686637
                        ],
                        [
                            6.66486340155035,
                            46.77643916667
                        ],
                        [
                            6.66486380703067,
                            46.7764386002887
                        ],
                        [
                            6.66486489563019,
                            46.7764370534045
                        ],
                        [
                            6.66486614698596,
                            46.7764353318023
                        ],
                        [
                            6.66486671526958,
                            46.7764345380147
                        ],
                        [
                            6.66486715322811,
                            46.7764339474248
                        ],
                        [
                            6.66486794268416,
                            46.7764328612993
                        ],
                        [
                            6.6648693188127,
                            46.7764310271196
                        ],
                        [
                            6.66487012036745,
                            46.7764299462176
                        ],
                        [
                            6.66487050885403,
                            46.7764294409671
                        ],
                        [
                            6.66487106792057,
                            46.7764286958125
                        ],
                        [
                            6.66487317572213,
                            46.7764259725419
                        ],
                        [
                            6.66487362976425,
                            46.7764253820323
                        ],
                        [
                            6.66487375019652,
                            46.7764252303234
                        ],
                        [
                            6.66487427000408,
                            46.7764245587342
                        ],
                        [
                            6.66487661634209,
                            46.7764216198313
                        ],
                        [
                            6.66487721682815,
                            46.7764208633971
                        ],
                        [
                            6.66487733555539,
                            46.7764207189815
                        ],
                        [
                            6.66487755024405,
                            46.7764204500734
                        ],
                        [
                            6.66488090600899,
                            46.7764163707117
                        ],
                        [
                            6.66498841352921,
                            46.7762885486812
                        ],
                        [
                            6.66511507121051,
                            46.776131080021
                        ],
                        [
                            6.66523512397401,
                            46.7759867004398
                        ],
                        [
                            6.66539607909868,
                            46.775793300547
                        ],
                        [
                            6.66544831374473,
                            46.7757302336166
                        ],
                        [
                            6.66575090345746,
                            46.775366421536
                        ],
                        [
                            6.66575472444255,
                            46.7753612118189
                        ],
                        [
                            6.6657579763429,
                            46.7753566527321
                        ],
                        [
                            6.66575853857536,
                            46.7753558612573
                        ],
                        [
                            6.66576142314038,
                            46.7753516971791
                        ],
                        [
                            6.66576220226629,
                            46.7753505685118
                        ],
                        [
                            6.66576559488181,
                            46.7753455265267
                        ],
                        [
                            6.66576568759461,
                            46.7753453880758
                        ],
                        [
                            6.6657688766628,
                            46.7753405068514
                        ],
                        [
                            6.66576925082636,
                            46.7753399293345
                        ],
                        [
                            6.6657718799847,
                            46.7753357800358
                        ],
                        [
                            6.66577292384086,
                            46.7753341134251
                        ],
                        [
                            6.66577488381462,
                            46.7753309223422
                        ],
                        [
                            6.66577649643916,
                            46.775328262468
                        ],
                        [
                            6.66577826303618,
                            46.7753252938634
                        ],
                        [
                            6.66577947564515,
                            46.7753232328124
                        ],
                        [
                            6.66578168160158,
                            46.775319403752
                        ],
                        [
                            6.66578286273953,
                            46.7753173136423
                        ],
                        [
                            6.6657844411822,
                            46.7753144817535
                        ],
                        [
                            6.6657861990367,
                            46.7753112660007
                        ],
                        [
                            6.66578754185011,
                            46.7753087723167
                        ],
                        [
                            6.66578888134637,
                            46.7753062372237
                        ],
                        [
                            6.66579078033267,
                            46.7753025853509
                        ],
                        [
                            6.66579145654067,
                            46.7753012539013
                        ],
                        [
                            6.66579358615565,
                            46.7752970081248
                        ],
                        [
                            6.66579481360415,
                            46.7752944836259
                        ],
                        [
                            6.66579606714818,
                            46.775291890386
                        ],
                        [
                            6.66579720832935,
                            46.7752894696824
                        ],
                        [
                            6.66579904475402,
                            46.7752855238312
                        ],
                        [
                            6.66580150161623,
                            46.7752800331408
                        ],
                        [
                            6.66580357463158,
                            46.7752752082171
                        ],
                        [
                            6.66580380506728,
                            46.7752746714846
                        ],
                        [
                            6.66580531286067,
                            46.7752710239917
                        ],
                        [
                            6.66580625298502,
                            46.7752687413567
                        ],
                        [
                            6.66580735130423,
                            46.7752659131692
                        ],
                        [
                            6.66580845405417,
                            46.7752630647203
                        ],
                        [
                            6.66580876717617,
                            46.7752622212531
                        ],
                        [
                            6.66581059951925,
                            46.7752572625764
                        ],
                        [
                            6.66581087187186,
                            46.7752564945765
                        ],
                        [
                            6.66581250224838,
                            46.7752518785318
                        ],
                        [
                            6.66581338049019,
                            46.7752492773269
                        ],
                        [
                            6.66581444934667,
                            46.7752460781217
                        ],
                        [
                            6.66581530111341,
                            46.7752434223136
                        ],
                        [
                            6.66581616410093,
                            46.7752407054577
                        ],
                        [
                            6.66581719272208,
                            46.77523732381
                        ],
                        [
                            6.6658179184741,
                            46.7752348958734
                        ],
                        [
                            6.66581887901798,
                            46.7752315551212
                        ],
                        [
                            6.66581945594407,
                            46.7752295147811
                        ],
                        [
                            6.66582052396864,
                            46.775225573497
                        ],
                        [
                            6.66582099843741,
                            46.7752237767575
                        ],
                        [
                            6.66582185098379,
                            46.7752204270293
                        ],
                        [
                            6.6658226236202,
                            46.7752172843025
                        ],
                        [
                            6.66582316163502,
                            46.7752150250974
                        ],
                        [
                            6.66582377302743,
                            46.775212392178
                        ],
                        [
                            6.66582466062524,
                            46.7752083922361
                        ],
                        [
                            6.66582501441728,
                            46.7752067216444
                        ],
                        [
                            6.66582576942325,
                            46.7752030472671
                        ],
                        [
                            6.66582620425634,
                            46.7752008279652
                        ],
                        [
                            6.66582687408848,
                            46.7751972902209
                        ],
                        [
                            6.66582731737865,
                            46.7751948009183
                        ],
                        [
                            6.66582785772048,
                            46.7751916782997
                        ],
                        [
                            6.66582823395376,
                            46.7751893602703
                        ],
                        [
                            6.66582882748721,
                            46.7751855752622
                        ],
                        [
                            6.66582902749265,
                            46.775184191306
                        ],
                        [
                            6.66582962510631,
                            46.7751799491296
                        ],
                        [
                            6.6658300254934,
                            46.7751767873623
                        ],
                        [
                            6.66583029537195,
                            46.77517462783
                        ],
                        [
                            6.66583074081621,
                            46.775170627069
                        ],
                        [
                            6.66583095900267,
                            46.7751686192343
                        ],
                        [
                            6.66583142064822,
                            46.7751636859331
                        ],
                        [
                            6.66583149142483,
                            46.7751629216713
                        ],
                        [
                            6.66583175141308,
                            46.7751595902453
                        ],
                        [
                            6.6658319499142,
                            46.775157006548
                        ],
                        [
                            6.66583692512283,
                            46.7751570402602
                        ],
                        [
                            6.66583700516157,
                            46.7751553932084
                        ],
                        [
                            6.66583720628799,
                            46.7751510857155
                        ],
                        [
                            6.66583728829764,
                            46.7751486750832
                        ],
                        [
                            6.66583738539534,
                            46.7751454962985
                        ],
                        [
                            6.66583745441385,
                            46.7751419484046
                        ],
                        [
                            6.66583747997265,
                            46.775139863314
                        ],
                        [
                            6.6658374974625,
                            46.7751358936864
                        ],
                        [
                            6.66583748929678,
                            46.7751344747545
                        ],
                        [
                            6.66583744489021,
                            46.7751301025171
                        ],
                        [
                            6.6658374233392,
                            46.7751292115688
                        ],
                        [
                            6.6658373111777,
                            46.7751246756452
                        ],
                        [
                            6.66583716191837,
                            46.775120899782
                        ],
                        [
                            6.6658370939693,
                            46.7751192082069
                        ],
                        [
                            6.66583685225184,
                            46.7751147609691
                        ],
                        [
                            6.66583678081097,
                            46.7751135400936
                        ],
                        [
                            6.66583648883847,
                            46.7751093065645
                        ],
                        [
                            6.66583635529912,
                            46.7751075674264
                        ],
                        [
                            6.66583604915106,
                            46.7751039045526
                        ],
                        [
                            6.66583573619957,
                            46.7751006128732
                        ],
                        [
                            6.66583550599582,
                            46.7750982812586
                        ],
                        [
                            6.66583499064076,
                            46.7750936567237
                        ],
                        [
                            6.66583484226208,
                            46.7750923456601
                        ],
                        [
                            6.66583469532158,
                            46.7750912207899
                        ],
                        [
                            6.66583404755693,
                            46.775086336182
                        ],
                        [
                            6.66583379709731,
                            46.7750846118549
                        ],
                        [
                            6.66583320541712,
                            46.7750806425452
                        ],
                        [
                            6.66583276934772,
                            46.7750779196507
                        ],
                        [
                            6.66583219401556,
                            46.7750744922869
                        ],
                        [
                            6.66583179504462,
                            46.775072207089
                        ],
                        [
                            6.66583113465332,
                            46.7750686278258
                        ],
                        [
                            6.66583064237559,
                            46.7750660312373
                        ],
                        [
                            6.66582985798531,
                            46.7750621672349
                        ],
                        [
                            6.66582948780535,
                            46.7750603559578
                        ],
                        [
                            6.66582896681418,
                            46.7750579804718
                        ],
                        [
                            6.66582827209868,
                            46.7750548277514
                        ],
                        [
                            6.66582752003768,
                            46.7750516142058
                        ],
                        [
                            6.665826869156,
                            46.7750488884885
                        ],
                        [
                            6.66582611711269,
                            46.775045869157
                        ],
                        [
                            6.66582541814816,
                            46.7750431427166
                        ],
                        [
                            6.66582458415367,
                            46.7750399851983
                        ],
                        [
                            6.66582377631963,
                            46.775037047609
                        ],
                        [
                            6.66582302188084,
                            46.7750343443413
                        ],
                        [
                            6.66582178028065,
                            46.7750301037933
                        ],
                        [
                            6.66582135332843,
                            46.7750286532777
                        ],
                        [
                            6.6657752994168,
                            46.7748801788004
                        ],
                        [
                            6.66572110238324,
                            46.7747061007696
                        ],
                        [
                            6.66572060245353,
                            46.7747045079095
                        ],
                        [
                            6.66571961849572,
                            46.7747013863932
                        ],
                        [
                            6.66571914913964,
                            46.7746999739861
                        ],
                        [
                            6.66571806624218,
                            46.7746967380712
                        ],
                        [
                            6.66571733190684,
                            46.7746946455633
                        ],
                        [
                            6.66571645369556,
                            46.7746921701603
                        ],
                        [
                            6.66571551982639,
                            46.7746896419292
                        ],
                        [
                            6.66571477866102,
                            46.774687664839
                        ],
                        [
                            6.66571378010179,
                            46.7746850932323
                        ],
                        [
                            6.66571280465002,
                            46.774682637853
                        ],
                        [
                            6.66571208151616,
                            46.7746808617044
                        ],
                        [
                            6.66571094832671,
                            46.7746781372662
                        ],
                        [
                            6.66570996733078,
                            46.7746758359524
                        ],
                        [
                            6.66570915934544,
                            46.7746739849943
                        ],
                        [
                            6.66570791016031,
                            46.774671178907
                        ],
                        [
                            6.6657067428625,
                            46.7746686427656
                        ],
                        [
                            6.66570600787655,
                            46.7746670611113
                        ],
                        [
                            6.66570434007599,
                            46.7746635821749
                        ],
                        [
                            6.66570378251538,
                            46.7746624301257
                        ],
                        [
                            6.66570201520862,
                            46.774658898964
                        ],
                        [
                            6.66570145886776,
                            46.7746577940308
                        ],
                        [
                            6.66569974830926,
                            46.774654516101
                        ],
                        [
                            6.66569907818817,
                            46.7746532355576
                        ],
                        [
                            6.66569840183627,
                            46.7746519876801
                        ],
                        [
                            6.66569660837285,
                            46.7746486877056
                        ],
                        [
                            6.66569597286654,
                            46.7746475573447
                        ],
                        [
                            6.66569406473715,
                            46.7746441799784
                        ],
                        [
                            6.66569275144225,
                            46.7746419251303
                        ],
                        [
                            6.66569169898077,
                            46.7746401268768
                        ],
                        [
                            6.66569010958986,
                            46.774637491515
                        ],
                        [
                            6.66568857440239,
                            46.774634985349
                        ],
                        [
                            6.66568799360998,
                            46.7746340543693
                        ],
                        [
                            6.66568579367385,
                            46.7746305729991
                        ],
                        [
                            6.66568497844133,
                            46.7746293089732
                        ],
                        [
                            6.66568279387157,
                            46.7746259778735
                        ],
                        [
                            6.665682088058,
                            46.7746249179957
                        ],
                        [
                            6.66568018900153,
                            46.7746221125897
                        ],
                        [
                            6.66567865882803,
                            46.7746198878406
                        ],
                        [
                            6.66567767946871,
                            46.7746184913148
                        ],
                        [
                            6.66567550153835,
                            46.7746154206677
                        ],
                        [
                            6.66567473127663,
                            46.7746143617037
                        ],
                        [
                            6.66567253342952,
                            46.7746113557485
                        ],
                        [
                            6.66567164757763,
                            46.7746101734217
                        ],
                        [
                            6.66566929432394,
                            46.7746070502778
                        ],
                        [
                            6.66566614849844,
                            46.774602995197
                        ],
                        [
                            6.6656194980389,
                            46.7745599485033
                        ],
                        [
                            6.66561251850059,
                            46.7745536040685
                        ],
                        [
                            6.66561867997188,
                            46.7745074968841
                        ],
                        [
                            6.66569488008447,
                            46.7740519214017
                        ],
                        [
                            6.66569735438039,
                            46.7740366986706
                        ],
                        [
                            6.66569746511556,
                            46.7740360164481
                        ],
                        [
                            6.66570231050621,
                            46.7740070305823
                        ],
                        [
                            6.6657132216969,
                            46.7739417560165
                        ],
                        [
                            6.66571493225955,
                            46.7739320520411
                        ],
                        [
                            6.66572353155642,
                            46.7738802939554
                        ],
                        [
                            6.66572484792391,
                            46.7738723206084
                        ],
                        [
                            6.6657261126974,
                            46.7738646587856
                        ],
                        [
                            6.665726160723,
                            46.7738643944775
                        ],
                        [
                            6.66572715102771,
                            46.7738589262428
                        ],
                        [
                            6.66588954329384,
                            46.7728871024229
                        ],
                        [
                            6.66899450240324,
                            46.774087100713
                        ],
                        [
                            6.66899450308994,
                            46.7740871019418
                        ],
                        [
                            6.66899450518719,
                            46.7740871027523
                        ],
                        [
                            6.66901786909909,
                            46.7741289114484
                        ],
                        [
                            6.66926610450735,
                            46.7743409989359
                        ],
                        [
                            6.66968999570828,
                            46.7745025445412
                        ],
                        [
                            6.66984475633301,
                            46.7744297316169
                        ],
                        [
                            6.67005582130998,
                            46.7744301646617
                        ],
                        [
                            6.67023103863625,
                            46.7744102049984
                        ],
                        [
                            6.67040481569356,
                            46.7743535321303
                        ],
                        [
                            6.67065731496514,
                            46.774221373857
                        ],
                        [
                            6.67111262033859,
                            46.7739524032042
                        ],
                        [
                            6.67134759692371,
                            46.7738367678906
                        ],
                        [
                            6.67156143861023,
                            46.7737800029861
                        ],
                        [
                            6.6717485019277,
                            46.7737647085892
                        ],
                        [
                            6.6720447300318,
                            46.7737702985156
                        ],
                        [
                            6.67085933172499,
                            46.7726896558258
                        ],
                        [
                            6.66907483797031,
                            46.7719939406034
                        ],
                        [
                            6.66743217792135,
                            46.7713536709532
                        ],
                        [
                            6.66738471622484,
                            46.7713307701914
                        ],
                        [
                            6.66725709323265,
                            46.7712735926045
                        ],
                        [
                            6.66707974884147,
                            46.7712233651422
                        ],
                        [
                            6.66697506008506,
                            46.7711647232019
                        ],
                        [
                            6.66692112979349,
                            46.7711455571466
                        ],
                        [
                            6.66682307212915,
                            46.771108459717
                        ],
                        [
                            6.66682307059745,
                            46.7711084586453
                        ],
                        [
                            6.66682306902049,
                            46.7711084580487
                        ],
                        [
                            6.66675793871593,
                            46.7710628895638
                        ],
                        [
                            6.66674049769001,
                            46.7710506870483
                        ],
                        [
                            6.6666655049603,
                            46.7710121269497
                        ],
                        [
                            6.66666550302851,
                            46.7710121254796
                        ],
                        [
                            6.66666550204782,
                            46.7710121249753
                        ],
                        [
                            6.66661123610996,
                            46.7709708271546
                        ],
                        [
                            6.66651634869224,
                            46.7709045159865
                        ],
                        [
                            6.66651634834936,
                            46.7709045154975
                        ],
                        [
                            6.66651634591075,
                            46.7709045137933
                        ],
                        [
                            6.66646322774687,
                            46.7708287685035
                        ],
                        [
                            6.66643974515309,
                            46.7707955049406
                        ],
                        [
                            6.66618018687739,
                            46.7706354207808
                        ],
                        [
                            6.66617032443659,
                            46.7706293268771
                        ],
                        [
                            6.66617032401216,
                            46.7706293264516
                        ],
                        [
                            6.66617032139725,
                            46.770629324836
                        ],
                        [
                            6.66612153396656,
                            46.7705804181451
                        ],
                        [
                            6.66592127648735,
                            46.7705487454151
                        ],
                        [
                            6.6658256318603,
                            46.7704987098947
                        ],
                        [
                            6.66564048823156,
                            46.7704539146786
                        ],
                        [
                            6.66541153535912,
                            46.770442017571
                        ],
                        [
                            6.66521325248688,
                            46.7704369843442
                        ],
                        [
                            6.66513050606767,
                            46.7704096155107
                        ],
                        [
                            6.66503510352767,
                            46.770370106013
                        ],
                        [
                            6.66495700459595,
                            46.7703656179711
                        ],
                        [
                            6.66487563174523,
                            46.770315588422
                        ],
                        [
                            6.66479586844217,
                            46.7703084803624
                        ],
                        [
                            6.66479586726056,
                            46.7703084785124
                        ],
                        [
                            6.66479586562601,
                            46.7703084783667
                        ],
                        [
                            6.6647742262329,
                            46.7702745974198
                        ],
                        [
                            6.66474314185071,
                            46.7702559612892
                        ],
                        [
                            6.66473385816246,
                            46.7702503954997
                        ],
                        [
                            6.6646305906869,
                            46.7702389000251
                        ],
                        [
                            6.66456332022827,
                            46.7702006605273
                        ],
                        [
                            6.66435834764675,
                            46.7701237032277
                        ],
                        [
                            6.66425364106617,
                            46.7700757637733
                        ],
                        [
                            6.66417158962619,
                            46.7700638716445
                        ],
                        [
                            6.66408742678012,
                            46.7700440492265
                        ],
                        [
                            6.66408742619614,
                            46.7700440475511
                        ],
                        [
                            6.66408742428552,
                            46.7700440471011
                        ],
                        [
                            6.66408138887885,
                            46.7700267339751
                        ],
                        [
                            6.66406623310096,
                            46.7700155675249
                        ],
                        [
                            6.66404164774858,
                            46.7700045157321
                        ],
                        [
                            6.66389206561587,
                            46.7699816396318
                        ],
                        [
                            6.66381141046114,
                            46.7699546436769
                        ],
                        [
                            6.66376032576532,
                            46.7699471900078
                        ],
                        [
                            6.66370698703719,
                            46.7699598717343
                        ],
                        [
                            6.66362926740635,
                            46.7699290274251
                        ],
                        [
                            6.66351446570359,
                            46.7698820981414
                        ],
                        [
                            6.66345783634388,
                            46.7698778450421
                        ],
                        [
                            6.66338645463523,
                            46.7699160420756
                        ],
                        [
                            6.66331620950183,
                            46.7699026103924
                        ],
                        [
                            6.66327442746488,
                            46.7699128513714
                        ],
                        [
                            6.66319107919281,
                            46.7698547111877
                        ],
                        [
                            6.66313965356801,
                            46.7698527417417
                        ],
                        [
                            6.6630005001162,
                            46.7698512556341
                        ],
                        [
                            6.6630004988026,
                            46.7698512539396
                        ],
                        [
                            6.66300049735995,
                            46.7698512539242
                        ],
                        [
                            6.66299432754825,
                            46.769843295564
                        ],
                        [
                            6.66297161711981,
                            46.7697747722216
                        ],
                        [
                            6.66300109189898,
                            46.7697372799529
                        ],
                        [
                            6.66299973445239,
                            46.769736356442
                        ],
                        [
                            6.66299668368318,
                            46.7697342812296
                        ],
                        [
                            6.66295507826714,
                            46.7697066039682
                        ],
                        [
                            6.66291757946965,
                            46.7696816587684
                        ],
                        [
                            6.6627624804119,
                            46.7695784102858
                        ],
                        [
                            6.66229416388498,
                            46.7696506988265
                        ],
                        [
                            6.6620982903591,
                            46.7696512539844
                        ],
                        [
                            6.6620205041445,
                            46.7696070043041
                        ],
                        [
                            6.661840389432,
                            46.7695770805872
                        ],
                        [
                            6.66127051277087,
                            46.7695015001893
                        ],
                        [
                            6.6606792133536,
                            46.7695223861978
                        ],
                        [
                            6.66067921113728,
                            46.7695223843443
                        ],
                        [
                            6.66067921024744,
                            46.7695223843757
                        ],
                        [
                            6.66048736859909,
                            46.7693619396184
                        ],
                        [
                            6.65990220847713,
                            46.7693296084485
                        ],
                        [
                            6.65978507370072,
                            46.7693537267939
                        ],
                        [
                            6.65965191972807,
                            46.7693810645856
                        ],
                        [
                            6.6593107614138,
                            46.7694511505916
                        ],
                        [
                            6.65926124825394,
                            46.7694617875049
                        ],
                        [
                            6.65926124671711,
                            46.7694617852678
                        ],
                        [
                            6.65926124588642,
                            46.7694617854462
                        ],
                        [
                            6.65883401164736,
                            46.7688398584215
                        ],
                        [
                            6.65856149146501,
                            46.7688626431141
                        ],
                        [
                            6.65833408716296,
                            46.7689251381475
                        ],
                        [
                            6.65815335869129,
                            46.7689378449083
                        ],
                        [
                            6.65809152379908,
                            46.7689404805352
                        ],
                        [
                            6.65786803059904,
                            46.7689589212318
                        ],
                        [
                            6.6576322630493,
                            46.7689570371775
                        ],
                        [
                            6.65753396340463,
                            46.7689643698522
                        ],
                        [
                            6.6575058615895,
                            46.7693311209345
                        ],
                        [
                            6.65711708448468,
                            46.7692811386516
                        ],
                        [
                            6.65698990005208,
                            46.7694112474125
                        ],
                        [
                            6.6568111043959,
                            46.7695972266544
                        ],
                        [
                            6.6566675355135,
                            46.7697465641606
                        ],
                        [
                            6.65659565327798,
                            46.769764872384
                        ],
                        [
                            6.65628808162247,
                            46.7695503693817
                        ],
                        [
                            6.65639490291812,
                            46.7696595028013
                        ],
                        [
                            6.65640936442128,
                            46.7698716357067
                        ],
                        [
                            6.65631451760817,
                            46.7700196877673
                        ],
                        [
                            6.6561800470741,
                            46.77011933943
                        ],
                        [
                            6.65600776690766,
                            46.7701810385703
                        ],
                        [
                            6.65581291900599,
                            46.7702009314222
                        ],
                        [
                            6.65550708763091,
                            46.7701639274467
                        ],
                        [
                            6.65535352103888,
                            46.7701361551752
                        ],
                        [
                            6.65522875067084,
                            46.7700639605937
                        ],
                        [
                            6.65513359658127,
                            46.7699359244431
                        ],
                        [
                            6.65505296975174,
                            46.7696374258614
                        ],
                        [
                            6.65499029918858,
                            46.7694905420305
                        ],
                        [
                            6.65487685872114,
                            46.7693596813194
                        ],
                        [
                            6.65473653231548,
                            46.7692410500828
                        ],
                        [
                            6.65456844080519,
                            46.7691410294739
                        ],
                        [
                            6.6543631825243,
                            46.7690669308796
                        ],
                        [
                            6.65410544870193,
                            46.7690361014301
                        ],
                        [
                            6.65384243409962,
                            46.7690351910581
                        ],
                        [
                            6.65358568152253,
                            46.7690717465063
                        ],
                        [
                            6.65335065877111,
                            46.7691534305978
                        ],
                        [
                            6.6531398885437,
                            46.7692598399402
                        ],
                        [
                            6.6529522616992,
                            46.7693861994762
                        ],
                        [
                            6.65273420068091,
                            46.7695703727425
                        ],
                        [
                            6.6525887449982,
                            46.7697405622344
                        ],
                        [
                            6.65252306355822,
                            46.7698182840195
                        ],
                        [
                            6.65244832356677,
                            46.7698169594583
                        ],
                        [
                            6.65238787670604,
                            46.7698769055155
                        ],
                        [
                            6.65224455282049,
                            46.7701251037138
                        ],
                        [
                            6.65206936872842,
                            46.7702866319151
                        ],
                        [
                            6.65224490812335,
                            46.7704862023657
                        ],
                        [
                            6.65226164705672,
                            46.7705054791364
                        ],
                        [
                            6.6523962785788,
                            46.7706911833286
                        ],
                        [
                            6.65241567255961,
                            46.7707169557249
                        ],
                        [
                            6.65252823284016,
                            46.7708989095473
                        ],
                        [
                            6.65254971178229,
                            46.7709343214372
                        ],
                        [
                            6.65262350888235,
                            46.7710810137137
                        ],
                        [
                            6.65266179994266,
                            46.7711576528502
                        ],
                        [
                            6.65271470799015,
                            46.771291336999
                        ],
                        [
                            6.65275261880008,
                            46.7713850659374
                        ],
                        [
                            6.65277930281416,
                            46.7714675621041
                        ],
                        [
                            6.65283683535084,
                            46.7716432888182
                        ],
                        [
                            6.65289398037314,
                            46.7718186531882
                        ],
                        [
                            6.65290574715215,
                            46.7718557073324
                        ],
                        [
                            6.65292353497659,
                            46.7719197912476
                        ],
                        [
                            6.65303394057375,
                            46.7723125038476
                        ],
                        [
                            6.65303804981053,
                            46.7723270154424
                        ],
                        [
                            6.6530563930577,
                            46.772379947764
                        ],
                        [
                            6.65305853446021,
                            46.7723857200307
                        ],
                        [
                            6.65365722687325,
                            46.7723541284148
                        ],
                        [
                            6.65368540768002,
                            46.7723520734052
                        ],
                        [
                            6.65369145901109,
                            46.7723591321306
                        ],
                        [
                            6.65379669452045,
                            46.7723524796855
                        ],
                        [
                            6.65391567981683,
                            46.7723457416607
                        ],
                        [
                            6.65400830817583,
                            46.7723417014849
                        ],
                        [
                            6.65414439847491,
                            46.7723381397555
                        ],
                        [
                            6.65429934461755,
                            46.7723345274526
                        ],
                        [
                            6.65457165378581,
                            46.77260636731
                        ],
                        [
                            6.65486732105647,
                            46.7729017561663
                        ],
                        [
                            6.65495872349545,
                            46.7729909937823
                        ],
                        [
                            6.65527406353513,
                            46.7732934437493
                        ],
                        [
                            6.65482572540735,
                            46.7738251702399
                        ],
                        [
                            6.65538631906662,
                            46.7741543134563
                        ],
                        [
                            6.65651726350399,
                            46.7748184164194
                        ],
                        [
                            6.6566071452411,
                            46.7747422979759
                        ],
                        [
                            6.65666904188303,
                            46.7746908158281
                        ],
                        [
                            6.65672011129822,
                            46.7747176139562
                        ],
                        [
                            6.65706876498824,
                            46.7749003715815
                        ],
                        [
                            6.6573992276099,
                            46.7750736479709
                        ],
                        [
                            6.65758232873294,
                            46.775169628653
                        ],
                        [
                            6.65760999175204,
                            46.7752213650023
                        ],
                        [
                            6.65762784024058,
                            46.7752546821388
                        ],
                        [
                            6.65778656560658,
                            46.7752618861211
                        ],
                        [
                            6.65793998379347,
                            46.7752829070482
                        ],
                        [
                            6.6580467361086,
                            46.7753074771056
                        ],
                        [
                            6.65809005782131,
                            46.7753178489715
                        ],
                        [
                            6.65831407273201,
                            46.7753917087525
                        ],
                        [
                            6.65896784135839,
                            46.7757995564234
                        ],
                        [
                            6.65958008491952,
                            46.7762363527519
                        ],
                        [
                            6.66083738987488,
                            46.7771335493053
                        ],
                        [
                            6.6608802238357,
                            46.7771687455377
                        ],
                        [
                            6.66091881986729,
                            46.7772072412943
                        ],
                        [
                            6.66094594589861,
                            46.7772420602492
                        ],
                        [
                            6.66096932962233,
                            46.7772821615023
                        ],
                        [
                            6.66098641771673,
                            46.7773229396509
                        ],
                        [
                            6.66099720787221,
                            46.7773646642733
                        ],
                        [
                            6.66117140286904,
                            46.7783230149955
                        ],
                        [
                            6.66112569383391,
                            46.778359856509
                        ],
                        [
                            6.66105536049973,
                            46.7785059147822
                        ],
                        [
                            6.66107537333395,
                            46.7784800567965
                        ],
                        [
                            6.66111283548915,
                            46.7784611509217
                        ],
                        [
                            6.66115412301456,
                            46.7784493778696
                        ],
                        [
                            6.66119585891012,
                            46.7784428254791
                        ],
                        [
                            6.66122248926876,
                            46.7784394985962
                        ],
                        [
                            6.66295298380394,
                            46.7783014089933
                        ],
                        [
                            6.66305732791007,
                            46.778293752397
                        ],
                        [
                            6.66306407489056,
                            46.7782930750062
                        ],
                        [
                            6.66307083412194,
                            46.7782924561717
                        ],
                        [
                            6.66307187657422,
                            46.7782923696236
                        ],
                        [
                            6.66307206967475,
                            46.7782923521088
                        ],
                        [
                            6.66307277051604,
                            46.7782922954054
                        ],
                        [
                            6.66307760432073,
                            46.7782918940855
                        ],
                        [
                            6.66307914550417,
                            46.7782917796196
                        ],
                        [
                            6.66307945043819,
                            46.7782917549481
                        ],
                        [
                            6.66308040644395,
                            46.7782916859678
                        ],
                        [
                            6.66308438415173,
                            46.7782913905376
                        ],
                        [
                            6.66308568667824,
                            46.7782913049741
                        ],
                        [
                            6.66308685667194,
                            46.7782912205535
                        ],
                        [
                            6.66308856663845,
                            46.7782911157882
                        ],
                        [
                            6.6630911723186,
                            46.7782909446198
                        ],
                        [
                            6.6630939664361,
                            46.778290784956
                        ],
                        [
                            6.66309426174281,
                            46.7782907668633
                        ],
                        [
                            6.6630946292714,
                            46.7782907470797
                        ],
                        [
                            6.66309796751198,
                            46.7782905563231
                        ],
                        [
                            6.66310003622781,
                            46.7782904560302
                        ],
                        [
                            6.66310167881699,
                            46.7782903676117
                        ],
                        [
                            6.66310324268389,
                            46.7782903005788
                        ],
                        [
                            6.66310476971893,
                            46.778290226547
                        ],
                        [
                            6.6631077510801,
                            46.7782901073328
                        ],
                        [
                            6.66310910831402,
                            46.7782900491568
                        ],
                        [
                            6.66310980408339,
                            46.7782900252403
                        ],
                        [
                            6.66311157633375,
                            46.7782899543741
                        ],
                        [
                            6.66311488047335,
                            46.7782898507434
                        ],
                        [
                            6.66311653610223,
                            46.7782897938324
                        ],
                        [
                            6.6631172830657,
                            46.7782897753886
                        ],
                        [
                            6.6631183886529,
                            46.778289740713
                        ],
                        [
                            6.66312223292221,
                            46.7782896531682
                        ],
                        [
                            6.66312396365334,
                            46.7782896104335
                        ],
                        [
                            6.66312438946708,
                            46.7782896040576
                        ],
                        [
                            6.6631252027483,
                            46.7782895855369
                        ],
                        [
                            6.66313201994235,
                            46.7782894879551
                        ],
                        [
                            6.66313883891272,
                            46.7782894488583
                        ],
                        [
                            6.66314627896484,
                            46.7782894733569
                        ],
                        [
                            6.66315371932853,
                            46.7782895671255
                        ],
                        [
                            6.66316115606277,
                            46.778289731037
                        ],
                        [
                            6.66316858916761,
                            46.7782899650912
                        ],
                        [
                            6.66317601603736,
                            46.778290268371
                        ],
                        [
                            6.66318343927786,
                            46.7782906417936
                        ],
                        [
                            6.66319085496095,
                            46.7782910853323
                        ],
                        [
                            6.66319826048107,
                            46.7782915980698
                        ],
                        [
                            6.6632056545288,
                            46.7782921799972
                        ],
                        [
                            6.6632130370913,
                            46.7782928320141
                        ],
                        [
                            6.66321535469865,
                            46.7782930211783
                        ],
                        [
                            6.66322047989436,
                            46.7782934356206
                        ],
                        [
                            6.66322259805338,
                            46.77829359006
                        ],
                        [
                            6.66322794443115,
                            46.7782939720489
                        ],
                        [
                            6.66323088167103,
                            46.7782941607352
                        ],
                        [
                            6.66323507441607,
                            46.7782944212919
                        ],
                        [
                            6.66323868957762,
                            46.7782946222848
                        ],
                        [
                            6.66324297426809,
                            46.7782948441952
                        ],
                        [
                            6.66324599607991,
                            46.7782949861624
                        ],
                        [
                            6.66324939292724,
                            46.7782951345779
                        ],
                        [
                            6.66325430658592,
                            46.7782953225899
                        ],
                        [
                            6.6632574594609,
                            46.7782954236519
                        ],
                        [
                            6.66326077650714,
                            46.7782955225186
                        ],
                        [
                            6.66326488727905,
                            46.7782956215161
                        ],
                        [
                            6.66326876339291,
                            46.7782957033283
                        ],
                        [
                            6.66327226898632,
                            46.7782957512524
                        ],
                        [
                            6.66327593395073,
                            46.7782957972305
                        ],
                        [
                            6.66328058766301,
                            46.7782958180982
                        ],
                        [
                            6.66328331243781,
                            46.7782958286183
                        ],
                        [
                            6.66328516321274,
                            46.7782958196881
                        ],
                        [
                            6.66329083415671,
                            46.7782957870296
                        ],
                        [
                            6.66329271269799,
                            46.7782957622614
                        ],
                        [
                            6.6632982144501,
                            46.7782956803022
                        ],
                        [
                            6.66330132062985,
                            46.7782956133609
                        ],
                        [
                            6.66330508872809,
                            46.7782955228204
                        ],
                        [
                            6.66330935361458,
                            46.7782953951784
                        ],
                        [
                            6.66331264039656,
                            46.7782952820775
                        ],
                        [
                            6.66331630597673,
                            46.7782951420833
                        ],
                        [
                            6.66332015912696,
                            46.7782949742435
                        ],
                        [
                            6.66332395348533,
                            46.7782947969456
                        ],
                        [
                            6.66332639200156,
                            46.7782946681976
                        ],
                        [
                            6.66333147713853,
                            46.7782943883387
                        ],
                        [
                            6.66333833716202,
                            46.7782939536897
                        ],
                        [
                            6.66333833742956,
                            46.7782939555817
                        ],
                        [
                            6.66333834027036,
                            46.778293955402
                        ],
                        [
                            6.66334012212553,
                            46.7783065598849
                        ],
                        [
                            6.66340278016558,
                            46.7783018583167
                        ],
                        [
                            6.66340278051493,
                            46.7783018603817
                        ],
                        [
                            6.6634027831758,
                            46.778301860182
                        ],
                        [
                            6.66340579970856,
                            46.7783196904521
                        ],
                        [
                            6.66346637281617,
                            46.778314255075
                        ],
                        [
                            6.66346347132958,
                            46.7782975029918
                        ],
                        [
                            6.66351840785839,
                            46.7782926587319
                        ],
                        [
                            6.6635202788,
                            46.7782925063745
                        ],
                        [
                            6.66352554301611,
                            46.7782920713477
                        ],
                        [
                            6.66352813132111,
                            46.7782918393305
                        ],
                        [
                            6.66353301895775,
                            46.7782913855486
                        ],
                        [
                            6.66353579164422,
                            46.7782911141179
                        ],
                        [
                            6.66353932349869,
                            46.778290753013
                        ],
                        [
                            6.66354366883928,
                            46.7782902917385
                        ],
                        [
                            6.66354580802693,
                            46.7782900478861
                        ],
                        [
                            6.66355011552324,
                            46.7782895547259
                        ],
                        [
                            6.66355534846524,
                            46.7782889116845
                        ],
                        [
                            6.66355647775256,
                            46.7782887724476
                        ],
                        [
                            6.66356102586565,
                            46.7782881759944
                        ],
                        [
                            6.6635641416645,
                            46.7782877550516
                        ],
                        [
                            6.6635674627472,
                            46.7782872908236
                        ],
                        [
                            6.66357135751031,
                            46.7782867268218
                        ],
                        [
                            6.6635747019508,
                            46.7782862316273
                        ],
                        [
                            6.66357920406534,
                            46.7782855310092
                        ],
                        [
                            6.66358150114684,
                            46.7782851711059
                        ],
                        [
                            6.66358395680894,
                            46.7782847665874
                        ],
                        [
                            6.6635880763416,
                            46.7782840838496
                        ],
                        [
                            6.6635918541548,
                            46.7782834294261
                        ],
                        [
                            6.66359458250994,
                            46.7782829490251
                        ],
                        [
                            6.66359873229299,
                            46.7782821951365
                        ],
                        [
                            6.66360172795307,
                            46.7782816335975
                        ],
                        [
                            6.66360520976831,
                            46.7782809711138
                        ],
                        [
                            6.66360927265727,
                            46.7782801683229
                        ],
                        [
                            6.66361176356832,
                            46.77827967335
                        ],
                        [
                            6.66361458826067,
                            46.7782790877533
                        ],
                        [
                            6.66361816780342,
                            46.7782783420888
                        ],
                        [
                            6.66362147389857,
                            46.7782776277489
                        ],
                        [
                            6.66362547053984,
                            46.7782767490588
                        ],
                        [
                            6.66362800600994,
                            46.778276179122
                        ],
                        [
                            6.66363160965264,
                            46.778275351973
                        ],
                        [
                            6.66363542720304,
                            46.7782744599307
                        ],
                        [
                            6.66363795684975,
                            46.778273848319
                        ],
                        [
                            6.66364151934187,
                            46.7782729846855
                        ],
                        [
                            6.66364845153477,
                            46.778271175036
                        ],
                        [
                            6.66364900449988,
                            46.7782710361036
                        ],
                        [
                            6.66364922488856,
                            46.7782709786615
                        ],
                        [
                            6.66365045214372,
                            46.7782706723832
                        ],
                        [
                            6.66365541691542,
                            46.7782694249845
                        ],
                        [
                            6.6636564340348,
                            46.7782691795201
                        ],
                        [
                            6.66365697816466,
                            46.778269043725
                        ],
                        [
                            6.66365851924792,
                            46.7782686762893
                        ],
                        [
                            6.66366241414847,
                            46.7782677363212
                        ],
                        [
                            6.66366409130563,
                            46.7782673477609
                        ],
                        [
                            6.6636647566584,
                            46.7782671891229
                        ],
                        [
                            6.66366595639587,
                            46.7782669156607
                        ],
                        [
                            6.66366944193767,
                            46.7782661081375
                        ],
                        [
                            6.66367164815567,
                            46.7782656183089
                        ],
                        [
                            6.66367257406619,
                            46.7782654072614
                        ],
                        [
                            6.66367372748167,
                            46.7782651566531
                        ],
                        [
                            6.66367649896066,
                            46.7782645413241
                        ],
                        [
                            6.66367922300848,
                            46.7782639626125
                        ],
                        [
                            6.66368044238333,
                            46.7782636976728
                        ],
                        [
                            6.66368146767286,
                            46.7782634857438
                        ],
                        [
                            6.66368358521744,
                            46.778263035881
                        ],
                        [
                            6.66368689321023,
                            46.7782623642758
                        ],
                        [
                            6.66368832232463,
                            46.7782620688754
                        ],
                        [
                            6.66368909692732,
                            46.7782619168662
                        ],
                        [
                            6.66369069808946,
                            46.7782615917903
                        ],
                        [
                            6.6636947321312,
                            46.7782608110053
                        ],
                        [
                            6.66369625397447,
                            46.7782605123564
                        ],
                        [
                            6.66369675590852,
                            46.778260419305
                        ],
                        [
                            6.66369783756374,
                            46.7782602099517
                        ],
                        [
                            6.66370500234386,
                            46.7782588894565
                        ],
                        [
                            6.66371218978534,
                            46.7782576320862
                        ],
                        [
                            6.66371867931217,
                            46.7782565543895
                        ],
                        [
                            6.66371952257288,
                            46.7782564213907
                        ],
                        [
                            6.66371997613491,
                            46.778256346344
                        ],
                        [
                            6.66372146136154,
                            46.7782561156055
                        ],
                        [
                            6.66372518643137,
                            46.7782555280885
                        ],
                        [
                            6.66372671274683,
                            46.7782552997727
                        ],
                        [
                            6.66372779816948,
                            46.778255131146
                        ],
                        [
                            6.6637291097952,
                            46.778254941207
                        ],
                        [
                            6.6637317098466,
                            46.7782545522749
                        ],
                        [
                            6.66373530210472,
                            46.7782540444871
                        ],
                        [
                            6.66373563182843,
                            46.7782539967392
                        ],
                        [
                            6.663735856579,
                            46.7782539661087
                        ],
                        [
                            6.66373824954494,
                            46.7782536278482
                        ],
                        [
                            6.66374200720899,
                            46.7782531278613
                        ],
                        [
                            6.66374349095038,
                            46.7782529256474
                        ],
                        [
                            6.66374412664702,
                            46.7782528458532
                        ],
                        [
                            6.66374480420413,
                            46.7782527556989
                        ],
                        [
                            6.66375137254073,
                            46.7782519340191
                        ],
                        [
                            6.66375795321951,
                            46.7782511645991
                        ],
                        [
                            6.66375883038774,
                            46.778251069065
                        ],
                        [
                            6.66375927135755,
                            46.7782510177865
                        ],
                        [
                            6.66376077037851,
                            46.7782508577769
                        ],
                        [
                            6.66376454625346,
                            46.7782504465391
                        ],
                        [
                            6.66376595596379,
                            46.7782503042533
                        ],
                        [
                            6.66376719276929,
                            46.7782501722332
                        ],
                        [
                            6.6637687788848,
                            46.7782500193283
                        ],
                        [
                            6.66377115164256,
                            46.7782497798394
                        ],
                        [
                            6.66377420971291,
                            46.7782494957845
                        ],
                        [
                            6.66377512580559,
                            46.7782494074711
                        ],
                        [
                            6.66377569073995,
                            46.7782493582163
                        ],
                        [
                            6.66377776675527,
                            46.7782491653815
                        ],
                        [
                            6.66378286345926,
                            46.7782487328503
                        ],
                        [
                            6.66378307139205,
                            46.7782487147213
                        ],
                        [
                            6.66378314181029,
                            46.778248709228
                        ],
                        [
                            6.66378439159154,
                            46.7782486031655
                        ],
                        [
                            6.66379102616434,
                            46.7782480922917
                        ],
                        [
                            6.66379989062924,
                            46.7782473176937
                        ],
                        [
                            6.66380586960397,
                            46.7782467500191
                        ],
                        [
                            6.6638092932991,
                            46.7782464208271
                        ],
                        [
                            6.6638103664141,
                            46.7782463109087
                        ],
                        [
                            6.66381830137205,
                            46.7782454927148
                        ],
                        [
                            6.66382387867062,
                            46.7782448795671
                        ],
                        [
                            6.66382652191187,
                            46.7782445880808
                        ],
                        [
                            6.66383275763282,
                            46.7782438553633
                        ],
                        [
                            6.66383591410177,
                            46.7782434791159
                        ],
                        [
                            6.66384070343722,
                            46.7782428798862
                        ],
                        [
                            6.66384477825172,
                            46.7782423641993
                        ],
                        [
                            6.66384949531266,
                            46.7782417384358
                        ],
                        [
                            6.66385394690617,
                            46.7782411388688
                        ],
                        [
                            6.66385922049054,
                            46.778240398688
                        ],
                        [
                            6.66386208265682,
                            46.7782399926886
                        ],
                        [
                            6.66386826476911,
                            46.7782390772048
                        ],
                        [
                            6.66387162569189,
                            46.7782385691517
                        ],
                        [
                            6.66387692628167,
                            46.7782377438943
                        ],
                        [
                            6.66387962630419,
                            46.7782373184468
                        ],
                        [
                            6.66388661803842,
                            46.7782361750106
                        ],
                        [
                            6.66388854987527,
                            46.7782358523139
                        ],
                        [
                            6.66389459755814,
                            46.7782348166531
                        ],
                        [
                            6.66389761176308,
                            46.7782342904748
                        ],
                        [
                            6.6639031888362,
                            46.7782332914561
                        ],
                        [
                            6.66390675573424,
                            46.7782326384711
                        ],
                        [
                            6.6639117994963,
                            46.7782316948681
                        ],
                        [
                            6.66391515888961,
                            46.7782310542049
                        ],
                        [
                            6.66392092004652,
                            46.7782299310763
                        ],
                        [
                            6.66392374547815,
                            46.7782293679537
                        ],
                        [
                            6.66392968838418,
                            46.7782281618182
                        ],
                        [
                            6.66393207466202,
                            46.7782276671026
                        ],
                        [
                            6.66393856087382,
                            46.778226298654
                        ],
                        [
                            6.66394062965746,
                            46.7782258516574
                        ],
                        [
                            6.66394716054086,
                            46.7782244212853
                        ],
                        [
                            6.66394884401279,
                            46.7782240444335
                        ],
                        [
                            6.66395601220656,
                            46.7782224167198
                        ],
                        [
                            6.66395709805968,
                            46.7782221636609
                        ],
                        [
                            6.66396435174997,
                            46.7782204561138
                        ],
                        [
                            6.66396585068623,
                            46.778220094441
                        ],
                        [
                            6.66397278355504,
                            46.7782184057086
                        ],
                        [
                            6.66397488963846,
                            46.7782178785506
                        ],
                        [
                            6.66398090030599,
                            46.778216364271
                        ],
                        [
                            6.66398439128354,
                            46.7782154612386
                        ],
                        [
                            6.66398936969893,
                            46.7782141652545
                        ],
                        [
                            6.66399242394923,
                            46.7782133492708
                        ],
                        [
                            6.66399807950069,
                            46.7782118294242
                        ],
                        [
                            6.66399907271521,
                            46.778211555569
                        ],
                        [
                            6.66400654933197,
                            46.7782094822497
                        ],
                        [
                            6.66401480017847,
                            46.7782071237886
                        ],
                        [
                            6.66402292074909,
                            46.7782047318518
                        ],
                        [
                            6.66402471037441,
                            46.7782041898738
                        ],
                        [
                            6.66403118793992,
                            46.7782022252733
                        ],
                        [
                            6.66403925250458,
                            46.7781997081172
                        ],
                        [
                            6.66404727601101,
                            46.7781971322083
                        ],
                        [
                            6.66405291606213,
                            46.778195271294
                        ],
                        [
                            6.66405566485325,
                            46.7781943606879
                        ],
                        [
                            6.6640613794241,
                            46.778192423495
                        ],
                        [
                            6.66406342271791,
                            46.7781917288461
                        ],
                        [
                            6.66406900609959,
                            46.7781897854075
                        ],
                        [
                            6.66407173682765,
                            46.7781888291072
                        ],
                        [
                            6.66407689514451,
                            46.7781869862385
                        ],
                        [
                            6.6640794797074,
                            46.7781860580173
                        ],
                        [
                            6.66408463692743,
                            46.7781841670454
                        ],
                        [
                            6.66408787508482,
                            46.7781829694715
                        ],
                        [
                            6.66409167058699,
                            46.7781815423314
                        ],
                        [
                            6.66409590143926,
                            46.7781799383769
                        ],
                        [
                            6.66409990891261,
                            46.778178392726
                        ],
                        [
                            6.66410352777666,
                            46.7781769849976
                        ],
                        [
                            6.66410812497332,
                            46.7781751681459
                        ],
                        [
                            6.66411112529839,
                            46.7781739708381
                        ],
                        [
                            6.66411586472452,
                            46.7781720512354
                        ],
                        [
                            6.66411927619876,
                            46.7781706526915
                        ],
                        [
                            6.66412330786572,
                            46.7781689798452
                        ],
                        [
                            6.66412672374377,
                            46.7781675468286
                        ],
                        [
                            6.66413167112285,
                            46.778165444422
                        ],
                        [
                            6.664133681286,
                            46.7781645800749
                        ],
                        [
                            6.66413935709129,
                            46.7781621100265
                        ],
                        [
                            6.66414196373877,
                            46.7781609575106
                        ],
                        [
                            6.66414624934557,
                            46.7781590490335
                        ],
                        [
                            6.66414914656505,
                            46.7781577425149
                        ],
                        [
                            6.66415440439222,
                            46.7781553453756
                        ],
                        [
                            6.66415722064223,
                            46.7781540382053
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "20",
                "nomsquart": "Quartier 9",
                "character": "6",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [{
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65501989016, 46.7721104622
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65674140351, 46.7716186012
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6592553595, 46.7713453452
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65788907907, 46.7747883718
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.65966524363, 46.7731488353
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66040303506, 46.7746244182
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.66130478015, 46.7732854634
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.66414664345, 46.7737499987
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66196059476, 46.7760453498
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66247978132, 46.7773023278
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6630536191, 46.7763459315
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66297164227, 46.7781220961
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.66247978132, 46.7773023278
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.6649664117, 46.7760726755
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.66597745922, 46.7750343023
                ]
            }
        }
    ]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            6.6495555453609,
                            46.7616043897637
                        ],
                        [
                            6.64905314304631,
                            46.761210580164
                        ],
                        [
                            6.64873257562992,
                            46.7609593525339
                        ],
                        [
                            6.64796297262561,
                            46.7602113142354
                        ],
                        [
                            6.64774201607869,
                            46.7599879423288
                        ],
                        [
                            6.64755940074245,
                            46.759747743509
                        ],
                        [
                            6.64734882678984,
                            46.7595218336681
                        ],
                        [
                            6.64719933728956,
                            46.759361477921
                        ],
                        [
                            6.64684563065461,
                            46.7589438601143
                        ],
                        [
                            6.64630976718145,
                            46.7584872818919
                        ],
                        [
                            6.64560128785315,
                            46.7577620515183
                        ],
                        [
                            6.64537864824355,
                            46.7575121249993
                        ],
                        [
                            6.64527885711583,
                            46.7573643472832
                        ],
                        [
                            6.6452566987244,
                            46.7572246660044
                        ],
                        [
                            6.64516621477687,
                            46.7570937747563
                        ],
                        [
                            6.64388827711939,
                            46.7576172539502
                        ],
                        [
                            6.64377699658735,
                            46.7576628069561
                        ],
                        [
                            6.64325582602734,
                            46.7578624809302
                        ],
                        [
                            6.64317947411117,
                            46.7578916347525
                        ],
                        [
                            6.64316328127305,
                            46.7578979085425
                        ],
                        [
                            6.64313695294381,
                            46.7579079803506
                        ],
                        [
                            6.64312115498532,
                            46.7579140773444
                        ],
                        [
                            6.64307679190733,
                            46.7579310398503
                        ],
                        [
                            6.64304914704867,
                            46.7579416421864
                        ],
                        [
                            6.64293330177255,
                            46.7579859935575
                        ],
                        [
                            6.64290907912328,
                            46.7579952701328
                        ],
                        [
                            6.64298010334823,
                            46.7580608963198
                        ],
                        [
                            6.64300092498965,
                            46.7581400262385
                        ],
                        [
                            6.64293274258525,
                            46.758236436315
                        ],
                        [
                            6.64292943855289,
                            46.758238572743
                        ],
                        [
                            6.64194574418563,
                            46.7590696748453
                        ],
                        [
                            6.64192917569467,
                            46.7590835927164
                        ],
                        [
                            6.64162152558994,
                            46.7593423248219
                        ],
                        [
                            6.64160738018251,
                            46.759351761615
                        ],
                        [
                            6.64121987343143,
                            46.7596107442699
                        ],
                        [
                            6.64053603170666,
                            46.7600795060362
                        ],
                        [
                            6.64048554821244,
                            46.7601206238094
                        ],
                        [
                            6.64036894807181,
                            46.7602154344244
                        ],
                        [
                            6.64033409992899,
                            46.760243797467
                        ],
                        [
                            6.64021802786822,
                            46.7603382514384
                        ],
                        [
                            6.64015085018536,
                            46.7603928361223
                        ],
                        [
                            6.64012776995034,
                            46.7604132755436
                        ],
                        [
                            6.63993027109959,
                            46.7605874031325
                        ],
                        [
                            6.63956054993015,
                            46.7609787447101
                        ],
                        [
                            6.63912578285461,
                            46.7614304416798
                        ],
                        [
                            6.63877744200703,
                            46.76173880827
                        ],
                        [
                            6.63770852534196,
                            46.7626405247935
                        ],
                        [
                            6.63569036298117,
                            46.7607661498816
                        ],
                        [
                            6.63538325253869,
                            46.7611966915341
                        ],
                        [
                            6.63529242657799,
                            46.7612565947396
                        ],
                        [
                            6.63517678037008,
                            46.761277909567
                        ],
                        [
                            6.63505202002073,
                            46.761269563581
                        ],
                        [
                            6.63504787915738,
                            46.7612751123891
                        ],
                        [
                            6.63502089363731,
                            46.761311445719
                        ],
                        [
                            6.63484521648503,
                            46.7615483298525
                        ],
                        [
                            6.63450295025889,
                            46.7620180236297
                        ],
                        [
                            6.63449947434095,
                            46.7620228572784
                        ],
                        [
                            6.63447968638349,
                            46.7620505148891
                        ],
                        [
                            6.63447661293179,
                            46.7620547215934
                        ],
                        [
                            6.63411075625992,
                            46.7625520455505
                        ],
                        [
                            6.63353934377594,
                            46.7632608510567
                        ],
                        [
                            6.63324187863071,
                            46.7636658169161
                        ],
                        [
                            6.63316195485176,
                            46.7637753626558
                        ],
                        [
                            6.63314618385685,
                            46.7637969312372
                        ],
                        [
                            6.63307762798397,
                            46.7638903646294
                        ],
                        [
                            6.63306146005179,
                            46.7639122905843
                        ],
                        [
                            6.63315020458188,
                            46.7639919922162
                        ],
                        [
                            6.63346903588375,
                            46.7642857122547
                        ],
                        [
                            6.63410516438081,
                            46.7648626141799
                        ],
                        [
                            6.63486962577207,
                            46.7655784150572
                        ],
                        [
                            6.63582034914834,
                            46.7664559192941
                        ],
                        [
                            6.63596753327432,
                            46.7663747323911
                        ],
                        [
                            6.63612780782925,
                            46.7665220444502
                        ],
                        [
                            6.63615787095238,
                            46.7665076826388
                        ],
                        [
                            6.6363784583696,
                            46.7666313997548
                        ],
                        [
                            6.63672224050521,
                            46.7668079790767
                        ],
                        [
                            6.63708447200307,
                            46.7669677746204
                        ],
                        [
                            6.63745588358472,
                            46.7671179182775
                        ],
                        [
                            6.63783616150911,
                            46.7672530093161
                        ],
                        [
                            6.63820278640453,
                            46.7673642543866
                        ],
                        [
                            6.63828720562061,
                            46.7673835586117
                        ],
                        [
                            6.63840398862763,
                            46.7674362843638
                        ],
                        [
                            6.63842591946223,
                            46.767440576588
                        ],
                        [
                            6.63861860285481,
                            46.7674780023203
                        ],
                        [
                            6.63878695795549,
                            46.7675139074773
                        ],
                        [
                            6.63896014129699,
                            46.7675508362128
                        ],
                        [
                            6.63914370263214,
                            46.7675854978638
                        ],
                        [
                            6.6394126391318,
                            46.7676367706341
                        ],
                        [
                            6.63987282231248,
                            46.7677077345767
                        ],
                        [
                            6.64015120532006,
                            46.7677400904777
                        ],
                        [
                            6.64025968094654,
                            46.7677529042247
                        ],
                        [
                            6.64064918535959,
                            46.7677873864386
                        ],
                        [
                            6.64068804072043,
                            46.7677892775328
                        ],
                        [
                            6.64104169148271,
                            46.7678048858713
                        ],
                        [
                            6.64144536499161,
                            46.7678109469652
                        ],
                        [
                            6.64182724497516,
                            46.7678033604563
                        ],
                        [
                            6.64285923884582,
                            46.7677633381044
                        ],
                        [
                            6.64389271399966,
                            46.7677203479429
                        ],
                        [
                            6.64492251400227,
                            46.7676779531824
                        ],
                        [
                            6.64533386408481,
                            46.7676693905499
                        ],
                        [
                            6.6455411425383,
                            46.7676709059057
                        ],
                        [
                            6.6458451881051,
                            46.7676731266139
                        ],
                        [
                            6.64643541231165,
                            46.7677155506223
                        ],
                        [
                            6.64645907091592,
                            46.7677181440521
                        ],
                        [
                            6.64678740676071,
                            46.7677547889656
                        ],
                        [
                            6.64714010251665,
                            46.7677997880616
                        ],
                        [
                            6.64731754460711,
                            46.7678325052542
                        ],
                        [
                            6.64734901122551,
                            46.7678383010344
                        ],
                        [
                            6.64758625249337,
                            46.7678820928855
                        ],
                        [
                            6.64790092156394,
                            46.7679401851889
                        ],
                        [
                            6.64792102837223,
                            46.7679439231996
                        ],
                        [
                            6.64825094160975,
                            46.7680249246574
                        ],
                        [
                            6.64822728350307,
                            46.7680668615335
                        ],
                        [
                            6.64833709144815,
                            46.7680960494636
                        ],
                        [
                            6.64836022349063,
                            46.7680542890139
                        ],
                        [
                            6.64866987723112,
                            46.768141985837
                        ],
                        [
                            6.64881944952096,
                            46.7681915094865
                        ],
                        [
                            6.6489961182222,
                            46.7682503070884
                        ],
                        [
                            6.64902673520039,
                            46.7682605044332
                        ],
                        [
                            6.64938346894907,
                            46.7683876573234
                        ],
                        [
                            6.64950486577027,
                            46.7684391445378
                        ],
                        [
                            6.6496578840606,
                            46.7685038045522
                        ],
                        [
                            6.64991934277821,
                            46.7686285872803
                        ],
                        [
                            6.64997321157861,
                            46.7686602660203
                        ],
                        [
                            6.65002708124943,
                            46.7686919441913
                        ],
                        [
                            6.65032507937266,
                            46.768860788739
                        ],
                        [
                            6.65052153740189,
                            46.7689721671096
                        ],
                        [
                            6.65058782590554,
                            46.7690140962694
                        ],
                        [
                            6.65080965305226,
                            46.7691544359446
                        ],
                        [
                            6.65092224801182,
                            46.7692350075059
                        ],
                        [
                            6.65112468980429,
                            46.7693850184398
                        ],
                        [
                            6.65132941621211,
                            46.7695489883397
                        ],
                        [
                            6.65156879097742,
                            46.7697610553471
                        ],
                        [
                            6.65171967761283,
                            46.7699092697036
                        ],
                        [
                            6.65185936593481,
                            46.770062264191
                        ],
                        [
                            6.65190358448784,
                            46.7701094381774
                        ],
                        [
                            6.65206936872842,
                            46.7702866319151
                        ],
                        [
                            6.65224455282049,
                            46.7701251037138
                        ],
                        [
                            6.65238787670604,
                            46.7698769055155
                        ],
                        [
                            6.65244832356677,
                            46.7698169594583
                        ],
                        [
                            6.65252306355822,
                            46.7698182840195
                        ],
                        [
                            6.6525887449982,
                            46.7697405622344
                        ],
                        [
                            6.65273420068091,
                            46.7695703727425
                        ],
                        [
                            6.6529522616992,
                            46.7693861994762
                        ],
                        [
                            6.6531398885437,
                            46.7692598399402
                        ],
                        [
                            6.65335065877111,
                            46.7691534305978
                        ],
                        [
                            6.65358568152253,
                            46.7690717465063
                        ],
                        [
                            6.65384243409962,
                            46.7690351910581
                        ],
                        [
                            6.65410544870193,
                            46.7690361014301
                        ],
                        [
                            6.6543631825243,
                            46.7690669308796
                        ],
                        [
                            6.65456844080519,
                            46.7691410294739
                        ],
                        [
                            6.65473653231548,
                            46.7692410500828
                        ],
                        [
                            6.65487685872114,
                            46.7693596813194
                        ],
                        [
                            6.65499029918858,
                            46.7694905420305
                        ],
                        [
                            6.65505296975174,
                            46.7696374258614
                        ],
                        [
                            6.65513359658127,
                            46.7699359244431
                        ],
                        [
                            6.65522875067084,
                            46.7700639605937
                        ],
                        [
                            6.65535352103888,
                            46.7701361551752
                        ],
                        [
                            6.65550708763091,
                            46.7701639274467
                        ],
                        [
                            6.65581291900599,
                            46.7702009314222
                        ],
                        [
                            6.65600776690766,
                            46.7701810385703
                        ],
                        [
                            6.6561800470741,
                            46.77011933943
                        ],
                        [
                            6.65631451760817,
                            46.7700196877673
                        ],
                        [
                            6.65640936442128,
                            46.7698716357067
                        ],
                        [
                            6.65639490291812,
                            46.7696595028013
                        ],
                        [
                            6.65628808162247,
                            46.7695503693817
                        ],
                        [
                            6.65659565327798,
                            46.769764872384
                        ],
                        [
                            6.6566675355135,
                            46.7697465641606
                        ],
                        [
                            6.6568111043959,
                            46.7695972266544
                        ],
                        [
                            6.65698990005208,
                            46.7694112474125
                        ],
                        [
                            6.65711708448468,
                            46.7692811386516
                        ],
                        [
                            6.6575058615895,
                            46.7693311209345
                        ],
                        [
                            6.65753396340463,
                            46.7689643698522
                        ],
                        [
                            6.6576322630493,
                            46.7689570371775
                        ],
                        [
                            6.65786803059904,
                            46.7689589212318
                        ],
                        [
                            6.65809152379908,
                            46.7689404805352
                        ],
                        [
                            6.65815335869129,
                            46.7689378449083
                        ],
                        [
                            6.658153359643,
                            46.7689378427863
                        ],
                        [
                            6.65815335568144,
                            46.7689378430648
                        ],
                        [
                            6.65817419146759,
                            46.7688913868486
                        ],
                        [
                            6.6582973815042,
                            46.7687384897783
                        ],
                        [
                            6.65842951390565,
                            46.7685737791567
                        ],
                        [
                            6.65846991104705,
                            46.7685235000882
                        ],
                        [
                            6.6581438679763,
                            46.7684906830659
                        ],
                        [
                            6.65780437592566,
                            46.7684551640405
                        ],
                        [
                            6.65767953436515,
                            46.7684420748392
                        ],
                        [
                            6.65755476699138,
                            46.7684328541853
                        ],
                        [
                            6.65749539153321,
                            46.7684284892564
                        ],
                        [
                            6.65747890587527,
                            46.7684277465488
                        ],
                        [
                            6.65739569426161,
                            46.7684239381113
                        ],
                        [
                            6.65739569492243,
                            46.7684239363247
                        ],
                        [
                            6.65739569128537,
                            46.7684239361582
                        ],
                        [
                            6.65741626792686,
                            46.7683683024686
                        ],
                        [
                            6.65745932168378,
                            46.7682523702226
                        ],
                        [
                            6.65746760473649,
                            46.768231916284
                        ],
                        [
                            6.65751499394101,
                            46.768114934206
                        ],
                        [
                            6.65752395001254,
                            46.7680119923563
                        ],
                        [
                            6.65752614292148,
                            46.7679871786589
                        ],
                        [
                            6.6575283253884,
                            46.7679630845628
                        ],
                        [
                            6.6575390402309,
                            46.7678472006434
                        ],
                        [
                            6.65751102981113,
                            46.7678115378939
                        ],
                        [
                            6.65744442991929,
                            46.7677267269954
                        ],
                        [
                            6.65740558866124,
                            46.7676786926081
                        ],
                        [
                            6.65733893246573,
                            46.7676168858585
                        ],
                        [
                            6.65731987020469,
                            46.767613336798
                        ],
                        [
                            6.65731986844945,
                            46.7676133349564
                        ],
                        [
                            6.65731986726205,
                            46.7676133347353
                        ],
                        [
                            6.65720793233143,
                            46.7674958907478
                        ],
                        [
                            6.65708848318222,
                            46.7674002571704
                        ],
                        [
                            6.65690749412467,
                            46.7673812690545
                        ],
                        [
                            6.65679324053506,
                            46.7673692832854
                        ],
                        [
                            6.65674442429577,
                            46.7673641639022
                        ],
                        [
                            6.65652452482554,
                            46.7673429548298
                        ],
                        [
                            6.65652452642616,
                            46.7673429533296
                        ],
                        [
                            6.65652452172157,
                            46.7673429528758
                        ],
                        [
                            6.65655491632611,
                            46.7673144643706
                        ],
                        [
                            6.65663455636392,
                            46.7671314039324
                        ],
                        [
                            6.65662720314212,
                            46.7670337478337
                        ],
                        [
                            6.65656655691192,
                            46.7668934364499
                        ],
                        [
                            6.65649197796563,
                            46.7667209050531
                        ],
                        [
                            6.65641784302973,
                            46.7665493841891
                        ],
                        [
                            6.65631130877646,
                            46.7663029119236
                        ],
                        [
                            6.65629560561705,
                            46.7662664630209
                        ],
                        [
                            6.65619579551678,
                            46.7662880875865
                        ],
                        [
                            6.65609307485548,
                            46.7663116717896
                        ],
                        [
                            6.65588879737679,
                            46.766359837328
                        ],
                        [
                            6.65574088157953,
                            46.7663943558676
                        ],
                        [
                            6.65564171037405,
                            46.7663196071724
                        ],
                        [
                            6.65545132064805,
                            46.7661761034928
                        ],
                        [
                            6.65535818424262,
                            46.7660898226463
                        ],
                        [
                            6.65438309274635,
                            46.7652462302482
                        ],
                        [
                            6.65418844113981,
                            46.7650831447013
                        ],
                        [
                            6.65406861667336,
                            46.7649868736102
                        ],
                        [
                            6.65401633013606,
                            46.7649454924483
                        ],
                        [
                            6.65327291815155,
                            46.7643973025976
                        ],
                        [
                            6.65311331054915,
                            46.7642796064457
                        ],
                        [
                            6.65274027479624,
                            46.7640687802025
                        ],
                        [
                            6.65269725878565,
                            46.7640919629435
                        ],
                        [
                            6.65252457022919,
                            46.7641826211048
                        ],
                        [
                            6.65252456776471,
                            46.7641826191551
                        ],
                        [
                            6.65190972158134,
                            46.7636683997922
                        ],
                        [
                            6.65179335237717,
                            46.7635690914713
                        ],
                        [
                            6.65094046628598,
                            46.7628262566706
                        ],
                        [
                            6.65082972253495,
                            46.7627453378822
                        ],
                        [
                            6.65032657777092,
                            46.7622934135291
                        ],
                        [
                            6.64962338259228,
                            46.7616650419695
                        ],
                        [
                            6.6495555453609,
                            46.7616043897637
                        ]
                    ]
                ]
            },
            "properties": {
                "nbActions": "",
                "influence": "10",
                "nomsquart": "Quartier 10",
                "character": "11",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [{
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64441755402, 46.7604970785
                ]
            }
        },
    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64138441146, 46.7622732431
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64045534077, 46.7632296394
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64149371389, 46.7654976649
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64299662237, 46.7642953381
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64742337097, 46.7616447541
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64529197349, 46.7638034772
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Fontaine",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64428092597, 46.7660168515
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                    6.64698616123, 46.7649784784
                ]
            }
        },

    {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64982802453, 46.7647325479
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65130360739, 46.7673831319
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.65368093534, 46.7685581331
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                 6.65589430964, 46.7674651087
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                   6.64982802453, 46.7647325479
                ]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.65559372795, 46.7694325526
                ]
            }
        },
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64775127827, 46.7659622003
                ]
            }
        }
        ,
         {
            "type": "Feature",
            "properties": {
                "type":"Hydrant",
                "name": "Protéger une bouche d'égoût",
                "description": "Vise à éviter la pollution des égoûts",
                "smallIcon": "http://...",
                "bigIcon": "http://...",
                "accessLevel": "5",
                "maxXp": "10",
                "coolDown": "3600",
                "lastPerformed": "",
                "actionRadius": 50
            },
            "geometry": {
                "type": "Point",
                "coordinates": [
                  6.64656261429, 46.766959585
                ]
            }
        }]
            }
        },{
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                [
                    [
                        6.625752069214194,
                        46.78564144134963
                    ],
                    [
                        6.631494745196198,
                        46.78117491558585
                    ],
                    [
                        6.631520100336561,
                        46.781168746085825
                    ],
                    [
                        6.63150060877465,
                        46.7811592398024
                    ],
                    [
                        6.63167504172691,
                        46.7810106020576
                    ],
                    [
                        6.63168950604082,
                        46.7809979303219
                    ],
                    [
                        6.63183039804292,
                        46.7808765820225
                    ],
                    [
                        6.63184538440643,
                        46.7808640040071
                    ],
                    [
                        6.63187814813702,
                        46.7808360784459
                    ],
                    [
                        6.63190414156,
                        46.7808143122042
                    ],
                    [
                        6.63191860496807,
                        46.7808016404335
                    ],
                    [
                        6.63200203412589,
                        46.7807309823107
                    ],
                    [
                        6.6320267000505,
                        46.7807103761683
                    ],
                    [
                        6.63203227610722,
                        46.7807052884038
                    ],
                    [
                        6.63204820601498,
                        46.7806909171899
                    ],
                    [
                        6.63214594953768,
                        46.7806087561846
                    ],
                    [
                        6.63216996351313,
                        46.7805879653077
                    ],
                    [
                        6.63226705482583,
                        46.7805056194947
                    ],
                    [
                        6.63231057046276,
                        46.7804680540653
                    ],
                    [
                        6.63242890221969,
                        46.7803664267539
                    ],
                    [
                        6.63244137214991,
                        46.7803557196684
                    ],
                    [
                        6.63247360775043,
                        46.7803280603475
                    ],
                    [
                        6.63258384678056,
                        46.780233392768
                    ],
                    [
                        6.6325926028535,
                        46.7802258077765
                    ],
                    [
                        6.63266596297633,
                        46.7801628149361
                    ],
                    [
                        6.63264764570288,
                        46.7801529702968
                    ],
                    [
                        6.63292645795689,
                        46.7799157381394
                    ],
                    [
                        6.63299782865458,
                        46.7798543502373
                    ],
                    [
                        6.63300092017266,
                        46.7798516821897
                    ],
                    [
                        6.63300393310585,
                        46.7798489778975
                    ],
                    [
                        6.63300685480701,
                        46.7798462279374
                    ],
                    [
                        6.63300969887039,
                        46.7798434318562
                    ],
                    [
                        6.63301245235301,
                        46.7798405999948
                    ],
                    [
                        6.63301512739867,
                        46.7798377220067
                    ],
                    [
                        6.63301769828578,
                        46.7798348075934
                    ],
                    [
                        6.63302019125579,
                        46.7798318657254
                    ],
                    [
                        6.63302259300199,
                        46.7798288776405
                    ],
                    [
                        6.63302490403604,
                        46.7798258625595
                    ],
                    [
                        6.63302712290745,
                        46.7798228105891
                    ],
                    [
                        6.6330292382881,
                        46.7798197309833
                    ],
                    [
                        6.63303126216564,
                        46.7798166238269
                    ],
                    [
                        6.63303319467976,
                        46.7798134797867
                    ],
                    [
                        6.63303503635855,
                        46.7798103169857
                    ],
                    [
                        6.63303677294002,
                        46.7798071270871
                    ],
                    [
                        6.63303840603901,
                        46.7798039090042
                    ],
                    [
                        6.63303994763498,
                        46.7798006633707
                    ],
                    [
                        6.63304138387895,
                        46.7797974076589
                    ],
                    [
                        6.63304272941093,
                        46.7797941249512
                    ],
                    [
                        6.63304397079274,
                        46.7797908052694
                    ],
                    [
                        6.63304512133929,
                        46.7797874668267
                    ],
                    [
                        6.63304616652575,
                        46.7797841188549
                    ],
                    [
                        6.63304709384466,
                        46.7797807425972
                    ],
                    [
                        6.63304793004895,
                        46.779777366245
                    ],
                    [
                        6.6330486618321,
                        46.7797739710361
                    ],
                    [
                        6.63304928892292,
                        46.7797705750877
                    ],
                    [
                        6.63304981159256,
                        46.7797671602826
                    ],
                    [
                        6.63305021678311,
                        46.7797637446478
                    ],
                    [
                        6.63305052940872,
                        46.7797603190251
                    ],
                    [
                        6.63305073799339,
                        46.7797569025507
                    ],
                    [
                        6.63305082857918,
                        46.7797534665747
                    ],
                    [
                        6.6330508143331,
                        46.7797500391924
                    ],
                    [
                        6.63305070818988,
                        46.779746610612
                    ],
                    [
                        6.63305048442801,
                        46.779743190535
                    ],
                    [
                        6.63305015597399,
                        46.7797397697187
                    ],
                    [
                        6.63304973561467,
                        46.7797363482532
                    ],
                    [
                        6.63304919750532,
                        46.7797329440753
                    ],
                    [
                        6.63304855470385,
                        46.779729539158
                    ],
                    [
                        6.63304780614004,
                        46.7797261516129
                    ],
                    [
                        6.63304696593611,
                        46.7797227991101
                    ],
                    [
                        6.63304602076903,
                        46.7797194639851
                    ],
                    [
                        6.63304497063879,
                        46.779716146238
                    ],
                    [
                        6.63304382834047,
                        46.7797128454102
                    ],
                    [
                        6.63304258121051,
                        46.779709553176
                    ],
                    [
                        6.63304122898599,
                        46.7797062871039
                    ],
                    [
                        6.63303978458521,
                        46.7797030385
                    ],
                    [
                        6.63303823522961,
                        46.779699806725
                    ],
                    [
                        6.63303659422581,
                        46.7796966105411
                    ],
                    [
                        6.63303484745981,
                        46.7796934317294
                    ],
                    [
                        6.63303300931682,
                        46.7796902703916
                    ],
                    [
                        6.63303106501724,
                        46.7796871527785
                    ],
                    [
                        6.63302902934067,
                        46.7796840526392
                    ],
                    [
                        6.633026902016,
                        46.779680988091
                    ],
                    [
                        6.63302468158453,
                        46.7796779497895
                    ],
                    [
                        6.63302236950499,
                        46.7796749470791
                    ],
                    [
                        6.6330199649864,
                        46.7796719794052
                    ],
                    [
                        6.63301746882793,
                        46.7796690467734
                    ],
                    [
                        6.63301487942306,
                        46.7796661497214
                    ],
                    [
                        6.63301221195611,
                        46.7796632883564
                    ],
                    [
                        6.63300931035135,
                        46.7796603171713
                    ],
                    [
                        6.63300632895473,
                        46.7796573904461
                    ],
                    [
                        6.63300326869692,
                        46.7796544994023
                    ],
                    [
                        6.63300011586869,
                        46.779651652179
                    ],
                    [
                        6.63299688404782,
                        46.7796488494213
                    ],
                    [
                        6.63299358615257,
                        46.7796460824353
                    ],
                    [
                        6.6329901963464,
                        46.7796433686086
                    ],
                    [
                        6.63298673966673,
                        46.779640690548
                    ],
                    [
                        6.63298320386292,
                        46.779638065737
                    ],
                    [
                        6.63297960251278,
                        46.7796354948206
                    ],
                    [
                        6.63297592071956,
                        46.7796329584763
                    ],
                    [
                        6.6329721740395,
                        46.7796304853654
                    ],
                    [
                        6.63296834677666,
                        46.7796280561597
                    ],
                    [
                        6.63296446688577,
                        46.7796256721547
                    ],
                    [
                        6.63296050773928,
                        46.7796233501836
                    ],
                    [
                        6.63295649584147,
                        46.7796210816483
                    ],
                    [
                        6.63295240414362,
                        46.7796188581218
                    ],
                    [
                        6.63294825876378,
                        46.7796166968098
                    ],
                    [
                        6.6329440606326,
                        46.7796145889336
                    ],
                    [
                        6.6326311358655,
                        46.7794715015494
                    ],
                    [
                        6.63240968958697,
                        46.7793759294751
                    ],
                    [
                        6.63241674814679,
                        46.779368062906
                    ],
                    [
                        6.63240607864268,
                        46.7793634895252
                    ],
                    [
                        6.63238694996387,
                        46.7793554378521
                    ],
                    [
                        6.6321803169509,
                        46.7792676158048
                    ],
                    [
                        6.6321652222586,
                        46.7792612123663
                    ],
                    [
                        6.63215936636981,
                        46.7792587418851
                    ],
                    [
                        6.63187693548367,
                        46.7791520318191
                    ],
                    [
                        6.63185610203257,
                        46.7791441480919
                    ],
                    [
                        6.63177227453608,
                        46.779119266004
                    ],
                    [
                        6.63173498490015,
                        46.7791084771255
                    ],
                    [
                        6.6316422194844,
                        46.7790857806933
                    ],
                    [
                        6.63150777012218,
                        46.7790572117897
                    ],
                    [
                        6.63145906228679,
                        46.7790481413165
                    ],
                    [
                        6.6314355466773,
                        46.7790444663547
                    ],
                    [
                        6.63135360100276,
                        46.7790338109985
                    ],
                    [
                        6.63127580626676,
                        46.7790257935876
                    ],
                    [
                        6.63119837101254,
                        46.7790200276511
                    ],
                    [
                        6.63115360888815,
                        46.7790185412534
                    ],
                    [
                        6.6311338456187,
                        46.7790178616046
                    ],
                    [
                        6.63103895392586,
                        46.7790147612391
                    ],
                    [
                        6.63103420278535,
                        46.7790145744087
                    ],
                    [
                        6.63102945135677,
                        46.7790144600531
                    ],
                    [
                        6.63102469885741,
                        46.7790144170686
                    ],
                    [
                        6.63101994433983,
                        46.7790144553316
                    ],
                    [
                        6.63101520246082,
                        46.7790145568268
                    ],
                    [
                        6.63101045937093,
                        46.7790147390262
                    ],
                    [
                        6.63100571506194,
                        46.7790150024789
                    ],
                    [
                        6.63100098339966,
                        46.7790153286146
                    ],
                    [
                        6.63099626250575,
                        46.7790157360885
                    ],
                    [
                        6.63099156770429,
                        46.7790162156749
                    ],
                    [
                        6.63098688474214,
                        46.7790167584877
                    ],
                    [
                        6.63098221335566,
                        46.7790173820953
                    ],
                    [
                        6.63097756726246,
                        46.7790180778098
                    ],
                    [
                        6.63097294633071,
                        46.7790188544152
                    ],
                    [
                        6.6309683636024,
                        46.7790196949829
                    ],
                    [
                        6.63096379258975,
                        46.7790206070122
                    ],
                    [
                        6.6309592605879,
                        46.7790215824603
                    ],
                    [
                        6.6309547665341,
                        46.7790226388901
                    ],
                    [
                        6.63095029709788,
                        46.7790237591858
                    ],
                    [
                        6.63094586654886,
                        46.7790249511357
                    ],
                    [
                        6.63094148686629,
                        46.7790262153735
                    ],
                    [
                        6.63093719841212,
                        46.7790275252807
                    ],
                    [
                        6.63093296095619,
                        46.7790288986916
                    ],
                    [
                        6.63092876158001,
                        46.7790303443001
                    ],
                    [
                        6.63092461413301,
                        46.7790318446338
                    ],
                    [
                        6.63092051835983,
                        46.7790334167122
                    ],
                    [
                        6.63091647371665,
                        46.7790350435103
                    ],
                    [
                        6.63091248074725,
                        46.779036742053
                    ],
                    [
                        6.63090853890781,
                        46.7790384953153
                    ],
                    [
                        6.63090466165238,
                        46.7790403121778
                    ],
                    [
                        6.63090084912097,
                        46.7790421833071
                    ],
                    [
                        6.6308970883869,
                        46.779044117946
                    ],
                    [
                        6.63089340516348,
                        46.7790461069423
                    ],
                    [
                        6.63088977307827,
                        46.7790481501093
                    ],
                    [
                        6.63088621929468,
                        46.7790502481884
                    ],
                    [
                        6.6308827293041,
                        46.7790524093129
                    ],
                    [
                        6.63087931775518,
                        46.7790546160165
                    ],
                    [
                        6.63087597092202,
                        46.779056877536
                    ],
                    [
                        6.63087270173958,
                        46.7790591840799
                    ],
                    [
                        6.63086951085875,
                        46.7790615455359
                    ],
                    [
                        6.63086639682123,
                        46.7790639525596
                    ],
                    [
                        6.63086336109357,
                        46.7790664139465
                    ],
                    [
                        6.63084081924201,
                        46.7790851455394
                    ],
                    [
                        6.63067788816889,
                        46.7790173319027
                    ],
                    [
                        6.63067627024891,
                        46.7790160696648
                    ],
                    [
                        6.63067457319493,
                        46.7790148612241
                    ],
                    [
                        6.63067280913457,
                        46.7790136973323
                    ],
                    [
                        6.63067096660754,
                        46.7790125960275
                    ],
                    [
                        6.63066907066817,
                        46.7790115388187
                    ],
                    [
                        6.63066710838147,
                        46.7790105354978
                    ],
                    [
                        6.63066507962382,
                        46.7790095942997
                    ],
                    [
                        6.63066299810464,
                        46.7790087070855
                    ],
                    [
                        6.6306608627611,
                        46.7790078914179
                    ],
                    [
                        6.63065868665174,
                        46.7790071292702
                    ],
                    [
                        6.63065645844817,
                        46.7790064298963
                    ],
                    [
                        6.63065420199348,
                        46.7790058022501
                    ],
                    [
                        6.63065189278551,
                        46.7790052280388
                    ],
                    [
                        6.63064955679289,
                        46.7790047343508
                    ],
                    [
                        6.63064720639867,
                        46.7790042949184
                    ],
                    [
                        6.63064481482656,
                        46.7790039364564
                    ],
                    [
                        6.63064241032757,
                        46.7790036404965
                    ],
                    [
                        6.63063997757741,
                        46.7790034162644
                    ],
                    [
                        6.63063754467875,
                        46.7790032551739
                    ],
                    [
                        6.63063510976953,
                        46.7790031747823
                    ],
                    [
                        6.63063266192513,
                        46.7790031574417
                    ],
                    [
                        6.63057310597379,
                        46.7790013864701
                    ],
                    [
                        6.63054614009327,
                        46.7790007451901
                    ],
                    [
                        6.63041577226514,
                        46.778996943273
                    ],
                    [
                        6.63038357270536,
                        46.7789959952764
                    ],
                    [
                        6.63036459368164,
                        46.7789954110988
                    ],
                    [
                        6.63028815359283,
                        46.7789931601411
                    ],
                    [
                        6.63026852005465,
                        46.7789925713089
                    ],
                    [
                        6.63011158204498,
                        46.778987860355
                    ],
                    [
                        6.63003252311267,
                        46.778985590662
                    ],
                    [
                        6.6299585695006,
                        46.7789834471579
                    ],
                    [
                        6.62989260060001,
                        46.7789814502689
                    ],
                    [
                        6.62985307142329,
                        46.7789802700573
                    ],
                    [
                        6.62979312528484,
                        46.7789784058644
                    ],
                    [
                        6.62977872598932,
                        46.778978033611
                    ],
                    [
                        6.629667601312,
                        46.7789746368924
                    ],
                    [
                        6.62960542872054,
                        46.7789727562606
                    ],
                    [
                        6.62959862197808,
                        46.7789726184819
                    ],
                    [
                        6.62955045199652,
                        46.7789712868278
                    ],
                    [
                        6.62934376375137,
                        46.77896595231
                    ],
                    [
                        6.62934258498304,
                        46.7789659439462
                    ],
                    [
                        6.62928748071679,
                        46.7789642933874
                    ],
                    [
                        6.62902975454084,
                        46.7789567973858
                    ],
                    [
                        6.62889860191063,
                        46.7789528975673
                    ],
                    [
                        6.62887556531506,
                        46.778952194289
                    ],
                    [
                        6.6287534453534,
                        46.7789485385243
                    ],
                    [
                        6.62871587921771,
                        46.7789474619042
                    ],
                    [
                        6.62820526097228,
                        46.778933219813
                    ],
                    [
                        6.62819504209722,
                        46.7789335161782
                    ],
                    [
                        6.62770127821829,
                        46.778947899762
                    ],
                    [
                        6.62760467538028,
                        46.7789280515159
                    ],
                    [
                        6.62756796668695,
                        46.7789222130543
                    ],
                    [
                        6.62747425376482,
                        46.7789103912123
                    ],
                    [
                        6.62746836503354,
                        46.7789101697878
                    ],
                    [
                        6.62744101417972,
                        46.7789089853015
                    ],
                    [
                        6.62728659236589,
                        46.7789024896067
                    ],
                    [
                        6.62727350700051,
                        46.778901856791
                    ],
                    [
                        6.62723921972221,
                        46.7789004433686
                    ],
                    [
                        6.62721055712544,
                        46.778899430139
                    ],
                    [
                        6.62677109565626,
                        46.7788818190784
                    ],
                    [
                        6.62657865642284,
                        46.7788781101259
                    ],
                    [
                        6.62652734372271,
                        46.7788768454163
                    ],
                    [
                        6.62648820787657,
                        46.7788756673878
                    ],
                    [
                        6.62646190340646,
                        46.7788745801644
                    ],
                    [
                        6.62643454172471,
                        46.7788741157373
                    ],
                    [
                        6.62623110309886,
                        46.7788704179203
                    ],
                    [
                        6.6261351615354,
                        46.7788674855413
                    ],
                    [
                        6.62605178187235,
                        46.7788651823098
                    ],
                    [
                        6.62549258336437,
                        46.7788509416062
                    ],
                    [
                        6.62507371832242,
                        46.7788395885561
                    ],
                    [
                        6.62475355759392,
                        46.7788302873825
                    ],
                    [
                        6.62468824030282,
                        46.778828562274
                    ],
                    [
                        6.62441441750745,
                        46.778820490736
                    ],
                    [
                        6.62412730044512,
                        46.7788082753233
                    ],
                    [
                        6.62389200182479,
                        46.778798498235
                    ],
                    [
                        6.62355303402438,
                        46.7787860010355
                    ],
                    [
                        6.62321316802187,
                        46.7787722368433
                    ],
                    [
                        6.62286661565813,
                        46.7787590535982
                    ],
                    [
                        6.62280314406255,
                        46.778756530734
                    ],
                    [
                        6.62269372715543,
                        46.7787527792447
                    ],
                    [
                        6.62232044422611,
                        46.7787407527267
                    ],
                    [
                        6.62186562286652,
                        46.7787258915938
                    ],
                    [
                        6.62159179885028,
                        46.7787179033154
                    ],
                    [
                        6.62042704415747,
                        46.7786812164578
                    ],
                    [
                        6.62023294078574,
                        46.778675056328
                    ],
                    [
                        6.61960089331363,
                        46.7786551362481
                    ],
                    [
                        6.61952022547703,
                        46.7786295485222
                    ],
                    [
                        6.61857353508478,
                        46.7785563558565
                    ],
                    [
                        6.61766760111022,
                        46.7784641071715
                    ],
                    [
                        6.61743194025936,
                        46.7784096045391
                    ],
                    [
                        6.61743307567622,
                        46.7784124014358
                    ],
                    [
                        6.6174310737251,
                        46.7784149061513
                    ],
                    [
                        6.61738890926854,
                        46.7784406009906
                    ],
                    [
                        6.61712174265938,
                        46.7785285464754
                    ],
                    [
                        6.617199939006,
                        46.7786130414583
                    ],
                    [
                        6.61727683674904,
                        46.7786968077532
                    ],
                    [
                        6.61729680201862,
                        46.7787185420182
                    ],
                    [
                        6.61735412104994,
                        46.7787810270136
                    ],
                    [
                        6.61737704901939,
                        46.7788060210059
                    ],
                    [
                        6.61756704253095,
                        46.7790129460199
                    ],
                    [
                        6.61829610902222,
                        46.7798074060541
                    ],
                    [
                        6.61832522115602,
                        46.7798391012347
                    ],
                    [
                        6.61827778203087,
                        46.7798757332586
                    ],
                    [
                        6.6182065324475,
                        46.7799366632594
                    ],
                    [
                        6.61806576191196,
                        46.7800653720229
                    ],
                    [
                        6.6179296335272,
                        46.780198702586
                    ],
                    [
                        6.61779713626794,
                        46.7803343976047
                    ],
                    [
                        6.61764272440655,
                        46.7804987213273
                    ],
                    [
                        6.61760010089232,
                        46.7805372770813
                    ],
                    [
                        6.61747221324644,
                        46.7806367515337
                    ],
                    [
                        6.6174356348243,
                        46.7806652747821
                    ],
                    [
                        6.6173968585293,
                        46.7806920722061
                    ],
                    [
                        6.61757869821843,
                        46.7807125421594
                    ],
                    [
                        6.61773609664961,
                        46.7807302275726
                    ],
                    [
                        6.61875435379788,
                        46.7808445129956
                    ],
                    [
                        6.61877500936938,
                        46.7808468204896
                    ],
                    [
                        6.6199436123675,
                        46.7809779187047
                    ],
                    [
                        6.62019775337789,
                        46.7810064604469
                    ],
                    [
                        6.62117300991847,
                        46.7811159176976
                    ],
                    [
                        6.62117300917989,
                        46.7811159193753
                    ],
                    [
                        6.62117301301963,
                        46.7811159198063
                    ],
                    [
                        6.6211593139056,
                        46.7811470372795
                    ],
                    [
                        6.61994085200934,
                        46.7823736211077
                    ],
                    [
                        6.61991093005971,
                        46.7824036325754
                    ],
                    [
                        6.61949159590171,
                        46.7828257702863
                    ],
                    [
                        6.61953965587018,
                        46.782894662783
                    ],
                    [
                        6.62041257392017,
                        46.7829928659547
                    ],
                    [
                        6.62076556048542,
                        46.7830325506248
                    ],
                    [
                        6.6209102671052,
                        46.7830488292466
                    ],
                    [
                        6.62155058061441,
                        46.7831208502619
                    ],
                    [
                        6.62225189978743,
                        46.7831997272221
                    ],
                    [
                        6.62231896835099,
                        46.7832072240362
                    ],
                    [
                        6.62231896780317,
                        46.783207225725
                    ],
                    [
                        6.62231897135676,
                        46.7832072261222
                    ],
                    [
                        6.62231457501582,
                        46.7832207786132
                    ],
                    [
                        6.62229380924046,
                        46.7832429397521
                    ],
                    [
                        6.62231608536606,
                        46.7832851983972
                    ],
                    [
                        6.62233203275696,
                        46.7832870215292
                    ],
                    [
                        6.62238667524991,
                        46.7832935297849
                    ],
                    [
                        6.62238667388047,
                        46.7832935312127
                    ],
                    [
                        6.62238667771521,
                        46.7832935316694
                    ],
                    [
                        6.6221519530631,
                        46.7835382506513
                    ],
                    [
                        6.62204417082277,
                        46.7836505581163
                    ],
                    [
                        6.62153053516853,
                        46.7841860056728
                    ],
                    [
                        6.62192480444758,
                        46.7843189991651
                    ],
                    [
                        6.62197340514838,
                        46.7843353598833
                    ],
                    [
                        6.62202917118065,
                        46.784354200778
                    ],
                    [
                        6.62207777194493,
                        46.7843705614517
                    ],
                    [
                        6.62207933513572,
                        46.7843711123976
                    ],
                    [
                        6.62210213644768,
                        46.784378832199
                    ],
                    [
                        6.6222332141099,
                        46.7844230408354
                    ],
                    [
                        6.62274124557868,
                        46.784594000025
                    ],
                    [
                        6.62327208055646,
                        46.7847727664666
                    ],
                    [
                        6.62381386027413,
                        46.7849554768402
                    ],
                    [
                        6.62434208065123,
                        46.7851343994893
                    ],
                    [
                        6.62487299994317,
                        46.7853134828529
                    ],
                    [
                        6.62526378407723,
                        46.7854452985393
                    ],
                    [
                        6.62550141393906,
                        46.7855254551489
                    ],
                    [
                        6.6257673069643,
                        46.785615141438
                    ],
                    [
                        6.6257673064051,
                        46.7856151424029
                    ],
                    [
                        6.62576730952373,
                        46.7856151434548
                    ],
                    [
                        6.625752069214194,
                        46.78564144134963
                    ]
                ]
               ]
            },
            "properties": {
                "nbActions": "",
                "influence": "40",
                "nomsquart": "Quartier 11",
                "character": "12",
                "actionsPolygon": ["1","2","3","4","6","7","8","9","10"],
                "actionsPoint": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62720718576, 46.7812375748
            ]
        },
        "properties": {
            "type": "Wc public",
            "name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
              6.62932015525, 46.7815924484
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62481197781, 46.7822854783
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
            6.62888196006, 46.7807697607
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62564468683, 46.7797312135
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63124909916, 46.7798528452
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62271617087, 46.7834269446
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
               6.62802218884, 46.782808438
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62671130286, 46.7837169893
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
               6.62742785685, 46.7837580029
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.6281708827, 46.7789452859
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62302492814, 46.7795815131
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62663645261, 46.7822012717
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.62549498633, 46.7846713299
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [
                6.63161399412, 46.7808726798
            ]
        },
        "properties": {
            "type": "Hydrant","name":"",
            "description": "Fermer les robinets restés ouverts",
            "smallIcon": "http://...",
            "bigIcon": "http://...",
            "accessLevel": "5",
            "maxXp": "10",
            "coolDown": "3600",
            "lastPerformed": "2015-04-21T15:35:27+02:00",
            "actionRadius": 50
        }
    }
    ]
            }
        }]

		localStorage.setItem("sectors",JSON.stringify(sectors))
		console.log('storage set!')
	}else{
    console.log('storage existing')
  };
}

//////EXEMPLE
		var yverdon = {
"type": "FeatureCollection",
"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
                                                                                
"features": [
{ "type": "Feature", "properties": { "title": null, "nbActions": null, "influence": null, "text": null }, "geometry": { "type": "MultiPolygon", "coordinates": [ [ [ [ 6.625752069214194, 46.785641441349632 ], [ 6.62538783164383, 46.786269950980497 ], [ 6.62525362076794, 46.786501898866298 ], [ 6.62519283534817, 46.7865809897011 ], [ 6.62482184828459, 46.786959141027097 ], [ 6.62467353139203, 46.787110384430903 ], [ 6.62395972502805, 46.787838817025197 ], [ 6.62378546340914, 46.7880165016117 ], [ 6.62335046293642, 46.7884604014384 ], [ 6.62326522228727, 46.788467618577599 ], [ 6.6233455395161, 46.788517218420203 ], [ 6.62410240582572, 46.788942824758003 ], [ 6.62459934931466, 46.789226594954897 ], [ 6.62490342479048, 46.789402925433599 ], [ 6.62499482953454, 46.7894559336656 ], [ 6.62549987730217, 46.789764305088603 ], [ 6.62560738310757, 46.789829945029098 ], [ 6.62569646959256, 46.789884325406497 ], [ 6.62614687431488, 46.7901592593849 ], [ 6.62700161335935, 46.790672533650103 ], [ 6.62793073595102, 46.791196405397102 ], [ 6.62806970329408, 46.791274757745398 ], [ 6.6280697030066, 46.791274758152497 ], [ 6.62806970582222, 46.791274759739999 ], [ 6.6280240688793, 46.791339385773 ], [ 6.62795213379439, 46.7914542916062 ], [ 6.62819299676636, 46.791524190947499 ], [ 6.62819299886849, 46.791524192817199 ], [ 6.62819299945374, 46.791524192987097 ], [ 6.62830402441461, 46.791622947328896 ], [ 6.62829178800131, 46.791678814776397 ], [ 6.62840143452275, 46.791773420906303 ], [ 6.62850858433616, 46.791850479947399 ], [ 6.62854280080062, 46.791875087303403 ], [ 6.6286730667118, 46.791955119376802 ], [ 6.62869153004325, 46.791966462701701 ], [ 6.62945953364062, 46.792389052747701 ], [ 6.62947295479279, 46.792376283774097 ], [ 6.6294914827642, 46.792346188895998 ], [ 6.6294914859067, 46.792346190319797 ], [ 6.62955340823853, 46.792374245538198 ], [ 6.62955505422968, 46.792369309456198 ], [ 6.62965114557202, 46.7924248659642 ], [ 6.62965114543958, 46.792424866217203 ], [ 6.62965114807157, 46.792424867738902 ], [ 6.62964791166961, 46.792431051995202 ], [ 6.62970406516031, 46.792468241682599 ], [ 6.62970406509828, 46.792468241796598 ], [ 6.62970406800763, 46.792468243723398 ], [ 6.62968318942546, 46.792506597926398 ], [ 6.62968222027671, 46.792527461172703 ], [ 6.63078731611663, 46.793146832604798 ], [ 6.63180190939843, 46.793715087376597 ], [ 6.63278993572704, 46.794256967193 ], [ 6.63283203407074, 46.794279754309699 ], [ 6.63322814515276, 46.794471735261297 ], [ 6.63364184761016, 46.794643778052297 ], [ 6.63407127793299, 46.794797848454103 ], [ 6.63544850366512, 46.7952000435345 ], [ 6.6354485031728, 46.795200044384501 ], [ 6.63544850642048, 46.795200045332898 ], [ 6.63543371748702, 46.795225578833197 ], [ 6.63582444641241, 46.795340146896102 ], [ 6.63582444587419, 46.795340148048297 ], [ 6.63582444897201, 46.795340148956598 ], [ 6.63582268987302, 46.795343914706102 ], [ 6.63596184653988, 46.795384745583597 ], [ 6.63597067436239, 46.795372483339897 ], [ 6.6377719088232, 46.7959095734237 ], [ 6.63844768682451, 46.795979060658702 ], [ 6.63847002451846, 46.795944877846097 ], [ 6.63853204273098, 46.795835123387903 ], [ 6.6385834780867, 46.7957228178497 ], [ 6.63862410599721, 46.795608444496203 ], [ 6.63862993361327, 46.795588809564698 ], [ 6.63872530300829, 46.795509966833599 ], [ 6.63882657013581, 46.795414976694701 ], [ 6.63891857623431, 46.795315639385898 ], [ 6.63896860280753, 46.795254846542797 ], [ 6.63902388210685, 46.795184517519097 ], [ 6.63924929181067, 46.795073439065497 ], [ 6.6392955392083, 46.795050120286703 ], [ 6.63932598474914, 46.7950341718159 ], [ 6.63956456432108, 46.794907291186803 ], [ 6.63966773196936, 46.794849484866504 ], [ 6.63979403536732, 46.794769886576503 ], [ 6.63991248760982, 46.794684784800303 ], [ 6.64002258281575, 46.794594543895499 ], [ 6.64012384590877, 46.794499554241803 ], [ 6.64021584804999, 46.794400215876003 ], [ 6.64023888984539, 46.7943728930559 ], [ 6.64045497176632, 46.794111427437002 ], [ 6.64050122610999, 46.7941217780713 ], [ 6.64189719141885, 46.794410408039496 ], [ 6.64194864047641, 46.794420652151302 ], [ 6.64211518021187, 46.794448548985002 ], [ 6.6422840190612, 46.794468906471302 ], [ 6.64245443633554, 46.794481636113197 ], [ 6.64262569965589, 46.794486682829401 ], [ 6.64279707772043, 46.794484026690597 ], [ 6.64296783559099, 46.794473677396297 ], [ 6.64313724420618, 46.794455679831501 ], [ 6.64330457241338, 46.794430112363699 ], [ 6.64346911102508, 46.794397082069302 ], [ 6.64363014954045, 46.794356731159603 ], [ 6.64378700015301, 46.794309235500698 ], [ 6.64393899072745, 46.794254793033701 ], [ 6.64408547411774, 46.794193642507601 ], [ 6.64422581730902, 46.794126040891499 ], [ 6.64435942193492, 46.794052281636297 ], [ 6.64448571652744, 46.793972678147902 ], [ 6.64460415960123, 46.793887571495397 ], [ 6.64471424290821, 46.793797326589598 ], [ 6.64481223163442, 46.793705609388503 ], [ 6.64707434950101, 46.791441346979902 ], [ 6.647062990954508, 46.79143473909636 ], [ 6.6472251310032, 46.791290414861699 ], [ 6.64774384067145, 46.790771169885701 ], [ 6.64774710080479, 46.790767900286603 ], [ 6.6478390817085, 46.790668555725198 ], [ 6.6479214036751, 46.790565293544503 ], [ 6.64799371810877, 46.790458554994501 ], [ 6.64805571299059, 46.790348795303601 ], [ 6.64810712084679, 46.790236485380397 ], [ 6.64814772678934, 46.790122108575197 ], [ 6.6481773518899, 46.790006149582702 ], [ 6.64819587213666, 46.789889109947097 ], [ 6.64820320831573, 46.789771489323698 ], [ 6.64819932833496, 46.789653790436198 ], [ 6.64818424963654, 46.7895365179957 ], [ 6.64815803686191, 46.7894201742916 ], [ 6.64812079949266, 46.789305256429998 ], [ 6.64807270220788, 46.789192258602597 ], [ 6.64801394584418, 46.789081662070899 ], [ 6.64794478409954, 46.788973940773502 ], [ 6.64786551557104, 46.788869559074598 ], [ 6.64777647591392, 46.7887689612785 ], [ 6.64767804892641, 46.788672578843702 ], [ 6.64766014443959, 46.788656403850503 ], [ 6.64747018738901, 46.788486789575799 ], [ 6.64755652998183, 46.788433783562702 ], [ 6.64790022136277, 46.788226232549498 ], [ 6.64943225543277, 46.788236841583398 ], [ 6.64960361247263, 46.7882341752196 ], [ 6.64977434921745, 46.7882238157367 ], [ 6.64994373669617, 46.788205808063204 ], [ 6.65011104225231, 46.788180230599302 ], [ 6.65027555679418, 46.788147190463697 ], [ 6.65043657231936, 46.788106829926797 ], [ 6.65059339792616, 46.788059324873601 ], [ 6.65074536477958, 46.788004873307599 ], [ 6.65089182344093, 46.7879437140002 ], [ 6.65103214180063, 46.787876103963796 ], [ 6.65103441402653, 46.7878749303744 ], [ 6.65114507227247, 46.787867333138998 ], [ 6.65119607131575, 46.787862730409003 ], [ 6.65133614666453, 46.787849123909098 ], [ 6.65145453345554, 46.787835716785501 ], [ 6.65162183714431, 46.787810137106099 ], [ 6.65178634962866, 46.7877770947917 ], [ 6.65185315078205, 46.787761108812298 ], [ 6.65187117504893, 46.7877598044536 ], [ 6.65204055794497, 46.787741795298103 ], [ 6.65220786108763, 46.787716213112503 ], [ 6.65237237290142, 46.787683171600101 ], [ 6.65253338466039, 46.787642808646702 ], [ 6.6526902078976, 46.787595298519598 ], [ 6.65284217128939, 46.7875408463551 ], [ 6.65298862633957, 46.787479682157802 ], [ 6.65305152124246, 46.787450537118502 ], [ 6.65314094271539, 46.787407792598501 ], [ 6.65321836138201, 46.787369326600697 ], [ 6.6533519369526, 46.787295555111903 ], [ 6.65347820240717, 46.787215941607897 ], [ 6.65359661640135, 46.787130826102597 ], [ 6.65370667081175, 46.787040573547102 ], [ 6.65380789878478, 46.786945570041297 ], [ 6.65389986197988, 46.786846220548803 ], [ 6.65391913146198, 46.7868220426626 ], [ 6.65392759911677, 46.786825497432602 ], [ 6.65400794491241, 46.786856799980498 ], [ 6.65406258832151, 46.786877223857402 ], [ 6.65476368241388, 46.787141285598999 ], [ 6.6548410986186, 46.787169298283999 ], [ 6.65499650599327, 46.787218956633701 ], [ 6.65515630785789, 46.787261526862402 ], [ 6.65531981937417, 46.787296825254202 ], [ 6.65548634397931, 46.787324704254601 ], [ 6.65565516557015, 46.787345040337399 ], [ 6.65582556266004, 46.787357750025798 ], [ 6.655996805367, 46.787362777242599 ], [ 6.65616815930784, 46.787360100475198 ], [ 6.65633889201798, 46.787349731172597 ], [ 6.65650827452767, 46.787331715403099 ], [ 6.65667557427371, 46.787306126668199 ], [ 6.65684008209327, 46.787273078715401 ], [ 6.6570010900766, 46.787232709463701 ], [ 6.65715790737858, 46.787185193190901 ], [ 6.65730986509552, 46.787130735075998 ], [ 6.65745631395598, 46.787069565143597 ], [ 6.65751156799934, 46.787044053414803 ], [ 6.65795608133377, 46.787275038173298 ], [ 6.65805952401875, 46.7873261211599 ], [ 6.65820416724142, 46.7873892831484 ], [ 6.65826672767519, 46.787413873856899 ], [ 6.65862048096572, 46.787548525811999 ], [ 6.65998484729482, 46.786011008977198 ], [ 6.65998485390454, 46.786010996378302 ], [ 6.66238704666973, 46.783303683114902 ], [ 6.66247353799939, 46.783208825281903 ], [ 6.66294361783469, 46.782677037393 ], [ 6.66294361798104, 46.782677037317903 ], [ 6.66309045973718, 46.782601660779697 ], [ 6.66340358650763, 46.7824401990895 ], [ 6.66344655825626, 46.782418046390497 ], [ 6.66348036365548, 46.782398575130003 ], [ 6.6634803639115, 46.782398574981997 ], [ 6.66354097735424, 46.782363543224101 ], [ 6.66384311381721, 46.7821893664347 ], [ 6.6640780431529, 46.782062410714701 ], [ 6.66422168138477, 46.782009230754497 ], [ 6.66422286634415, 46.782008789005097 ], [ 6.66424236240555, 46.782000825067598 ], [ 6.66434364439121, 46.781933413757102 ], [ 6.66436990648527, 46.781919378522602 ], [ 6.66460100661, 46.7818035506481 ], [ 6.66486338933727, 46.781688744157798 ], [ 6.66498837231405, 46.781666922299699 ], [ 6.66511797890944, 46.781596733778798 ], [ 6.66558616826821, 46.781339656795303 ], [ 6.66566617376996, 46.781294589844798 ], [ 6.66603645222014, 46.780979453709499 ], [ 6.6661946086521, 46.780826785145798 ], [ 6.66630494667151, 46.780757634267701 ], [ 6.66631033457799, 46.780756321367001 ], [ 6.66648406104542, 46.780659173157403 ], [ 6.66614056990709, 46.780513633857502 ], [ 6.66575226854263, 46.780406111524997 ], [ 6.66518297649387, 46.780190399419098 ], [ 6.66474950617841, 46.780055219476502 ], [ 6.6636832372769, 46.779786828913302 ], [ 6.66319448963761, 46.779662332746703 ], [ 6.66283143532627, 46.7795393187101 ], [ 6.66249569399815, 46.779374838881601 ], [ 6.66114364015512, 46.778558878542903 ], [ 6.6610553601311, 46.778505920542798 ], [ 6.6610553603412, 46.778505920106497 ], [ 6.66105535763528, 46.778505918483198 ], [ 6.661055360499818, 46.778505914782016 ], [ 6.66105536049973, 46.778505914782201 ], [ 6.66107537333395, 46.778480056796496 ], [ 6.66111283548915, 46.7784611509217 ], [ 6.66115412301456, 46.778449377869599 ], [ 6.66119585891012, 46.778442825479097 ], [ 6.66122248926876, 46.7784394985962 ], [ 6.66295298380394, 46.7783014089933 ], [ 6.66305732791007, 46.778293752396998 ], [ 6.66306407489056, 46.778293075006196 ], [ 6.66307083412194, 46.778292456171698 ], [ 6.66307187657422, 46.7782923696236 ], [ 6.66307206967475, 46.778292352108799 ], [ 6.66307277051604, 46.7782922954054 ], [ 6.66307760432073, 46.778291894085498 ], [ 6.66307914550417, 46.7782917796196 ], [ 6.66307945043819, 46.7782917549481 ], [ 6.66308040644395, 46.778291685967801 ], [ 6.66308438415173, 46.778291390537603 ], [ 6.66308568667824, 46.778291304974097 ], [ 6.66308685667194, 46.778291220553498 ], [ 6.66308856663845, 46.7782911157882 ], [ 6.6630911723186, 46.778290944619798 ], [ 6.6630939664361, 46.778290784955999 ], [ 6.66309426174281, 46.7782907668633 ], [ 6.6630946292714, 46.778290747079701 ], [ 6.66309796751198, 46.7782905563231 ], [ 6.66310003622781, 46.778290456030199 ], [ 6.66310167881699, 46.778290367611703 ], [ 6.66310324268389, 46.778290300578803 ], [ 6.66310476971893, 46.778290226547 ], [ 6.6631077510801, 46.778290107332801 ], [ 6.66310910831402, 46.778290049156801 ], [ 6.66310980408339, 46.778290025240302 ], [ 6.66311157633375, 46.778289954374102 ], [ 6.66311488047335, 46.778289850743398 ], [ 6.66311653610223, 46.7782897938324 ], [ 6.6631172830657, 46.7782897753886 ], [ 6.6631183886529, 46.778289740712999 ], [ 6.66312223292221, 46.778289653168201 ], [ 6.66312396365334, 46.778289610433497 ], [ 6.66312438946708, 46.778289604057598 ], [ 6.6631252027483, 46.778289585536903 ], [ 6.66313201994235, 46.778289487955099 ], [ 6.66313883891272, 46.778289448858303 ], [ 6.66314627896484, 46.778289473356899 ], [ 6.66315371932853, 46.778289567125498 ], [ 6.66316115606277, 46.778289731036999 ], [ 6.66316858916761, 46.778289965091197 ], [ 6.66317601603736, 46.778290268371002 ], [ 6.66318343927786, 46.778290641793603 ], [ 6.66319085496095, 46.778291085332299 ], [ 6.66319826048107, 46.778291598069799 ], [ 6.6632056545288, 46.778292179997202 ], [ 6.6632130370913, 46.778292832014102 ], [ 6.66321535469865, 46.7782930211783 ], [ 6.66322047989436, 46.778293435620597 ], [ 6.66322259805338, 46.778293590060002 ], [ 6.66322794443115, 46.7782939720489 ], [ 6.66323088167103, 46.7782941607352 ], [ 6.66323507441607, 46.778294421291903 ], [ 6.66323868957762, 46.778294622284797 ], [ 6.66324297426809, 46.778294844195202 ], [ 6.66324599607991, 46.7782949861624 ], [ 6.66324939292724, 46.778295134577903 ], [ 6.66325430658592, 46.778295322589898 ], [ 6.6632574594609, 46.778295423651898 ], [ 6.66326077650714, 46.778295522518597 ], [ 6.66326488727905, 46.778295621516101 ], [ 6.66326876339291, 46.778295703328297 ], [ 6.66327226898632, 46.778295751252401 ], [ 6.66327593395073, 46.778295797230498 ], [ 6.66328058766301, 46.778295818098201 ], [ 6.66328331243781, 46.778295828618297 ], [ 6.66328516321274, 46.778295819688097 ], [ 6.66329083415671, 46.778295787029599 ], [ 6.66329271269799, 46.778295762261401 ], [ 6.6632982144501, 46.7782956803022 ], [ 6.66330132062985, 46.778295613360903 ], [ 6.66330508872809, 46.7782955228204 ], [ 6.66330935361458, 46.778295395178397 ], [ 6.66331264039656, 46.778295282077501 ], [ 6.66331630597673, 46.778295142083302 ], [ 6.66332015912696, 46.778294974243501 ], [ 6.66332395348533, 46.778294796945602 ], [ 6.66332639200156, 46.778294668197603 ], [ 6.66333147713853, 46.778294388338701 ], [ 6.66333833716202, 46.778293953689698 ], [ 6.66333833742956, 46.778293955581702 ], [ 6.66333834027036, 46.778293955401999 ], [ 6.66334012212553, 46.778306559884903 ], [ 6.66340278016558, 46.778301858316702 ], [ 6.66340278051493, 46.778301860381703 ], [ 6.6634027831758, 46.778301860181998 ], [ 6.66340579970856, 46.778319690452101 ], [ 6.66346637281617, 46.778314255075003 ], [ 6.66346347132958, 46.778297502991798 ], [ 6.66351840785839, 46.7782926587319 ], [ 6.6635202788, 46.778292506374498 ], [ 6.66352554301611, 46.7782920713477 ], [ 6.66352813132111, 46.7782918393305 ], [ 6.66353301895775, 46.778291385548599 ], [ 6.66353579164422, 46.778291114117899 ], [ 6.66353932349869, 46.778290753013003 ], [ 6.66354366883928, 46.7782902917385 ], [ 6.66354580802693, 46.778290047886102 ], [ 6.66355011552324, 46.778289554725902 ], [ 6.66355534846524, 46.778288911684498 ], [ 6.66355647775256, 46.778288772447603 ], [ 6.66356102586565, 46.778288175994398 ], [ 6.6635641416645, 46.778287755051601 ], [ 6.6635674627472, 46.778287290823599 ], [ 6.66357135751031, 46.778286726821797 ], [ 6.6635747019508, 46.778286231627298 ], [ 6.66357920406534, 46.778285531009203 ], [ 6.66358150114684, 46.7782851711059 ], [ 6.66358395680894, 46.778284766587397 ], [ 6.6635880763416, 46.778284083849599 ], [ 6.6635918541548, 46.778283429426097 ], [ 6.66359458250994, 46.778282949025098 ], [ 6.66359873229299, 46.778282195136498 ], [ 6.66360172795307, 46.778281633597501 ], [ 6.66360520976831, 46.778280971113801 ], [ 6.66360927265727, 46.778280168322901 ], [ 6.66361176356832, 46.778279673349999 ], [ 6.66361458826067, 46.778279087753297 ], [ 6.66361816780342, 46.778278342088797 ], [ 6.66362147389857, 46.778277627748899 ], [ 6.66362547053984, 46.778276749058797 ], [ 6.66362800600994, 46.778276179122003 ], [ 6.66363160965264, 46.778275351973001 ], [ 6.66363542720304, 46.778274459930699 ], [ 6.66363795684975, 46.778273848319003 ], [ 6.66364151934187, 46.778272984685501 ], [ 6.66364845153477, 46.778271175035997 ], [ 6.66364900449988, 46.778271036103597 ], [ 6.66364922488856, 46.778270978661503 ], [ 6.66365045214372, 46.778270672383201 ], [ 6.66365541691542, 46.778269424984501 ], [ 6.6636564340348, 46.778269179520102 ], [ 6.66365697816466, 46.778269043724997 ], [ 6.66365851924792, 46.778268676289301 ], [ 6.66366241414847, 46.778267736321197 ], [ 6.66366409130563, 46.778267347760902 ], [ 6.6636647566584, 46.7782671891229 ], [ 6.66366595639587, 46.778266915660701 ], [ 6.66366944193767, 46.778266108137501 ], [ 6.66367164815567, 46.7782656183089 ], [ 6.66367257406619, 46.778265407261401 ], [ 6.66367372748167, 46.778265156653099 ], [ 6.66367649896066, 46.778264541324099 ], [ 6.66367922300848, 46.778263962612499 ], [ 6.66368044238333, 46.778263697672799 ], [ 6.66368146767286, 46.7782634857438 ], [ 6.66368358521744, 46.778263035880997 ], [ 6.66368689321023, 46.778262364275797 ], [ 6.66368832232463, 46.778262068875399 ], [ 6.66368909692732, 46.778261916866199 ], [ 6.66369069808946, 46.778261591790297 ], [ 6.6636947321312, 46.778260811005303 ], [ 6.66369625397447, 46.778260512356397 ], [ 6.66369675590852, 46.778260419304999 ], [ 6.66369783756374, 46.778260209951704 ], [ 6.66370500234386, 46.778258889456502 ], [ 6.66371218978534, 46.778257632086202 ], [ 6.66371867931217, 46.7782565543895 ], [ 6.66371952257288, 46.778256421390701 ], [ 6.66371997613491, 46.778256346344001 ], [ 6.66372146136154, 46.778256115605501 ], [ 6.66372518643137, 46.778255528088501 ], [ 6.66372671274683, 46.778255299772702 ], [ 6.66372779816948, 46.778255131145997 ], [ 6.6637291097952, 46.778254941207003 ], [ 6.6637317098466, 46.778254552274902 ], [ 6.66373530210472, 46.778254044487099 ], [ 6.66373563182843, 46.778253996739203 ], [ 6.663735856579, 46.7782539661087 ], [ 6.66373824954494, 46.778253627848201 ], [ 6.66374200720899, 46.778253127861298 ], [ 6.66374349095038, 46.778252925647401 ], [ 6.66374412664702, 46.778252845853203 ], [ 6.66374480420413, 46.778252755698901 ], [ 6.66375137254073, 46.778251934019103 ], [ 6.66375795321951, 46.778251164599098 ], [ 6.66375883038774, 46.778251069065 ], [ 6.66375927135755, 46.778251017786502 ], [ 6.66376077037851, 46.778250857776897 ], [ 6.66376454625346, 46.778250446539097 ], [ 6.66376595596379, 46.778250304253298 ], [ 6.66376719276929, 46.7782501722332 ], [ 6.6637687788848, 46.778250019328297 ], [ 6.66377115164256, 46.778249779839399 ], [ 6.66377420971291, 46.7782494957845 ], [ 6.66377512580559, 46.778249407471101 ], [ 6.66377569073995, 46.7782493582163 ], [ 6.66377776675527, 46.778249165381503 ], [ 6.66378286345926, 46.778248732850301 ], [ 6.66378307139205, 46.7782487147213 ], [ 6.66378314181029, 46.778248709228002 ], [ 6.66378439159154, 46.778248603165501 ], [ 6.66379102616434, 46.778248092291697 ], [ 6.66379989062924, 46.778247317693697 ], [ 6.66380586960397, 46.7782467500191 ], [ 6.6638092932991, 46.778246420827102 ], [ 6.6638103664141, 46.778246310908699 ], [ 6.66381830137205, 46.778245492714802 ], [ 6.66382387867062, 46.778244879567097 ], [ 6.66382652191187, 46.778244588080803 ], [ 6.66383275763282, 46.7782438553633 ], [ 6.66383591410177, 46.778243479115901 ], [ 6.66384070343722, 46.7782428798862 ], [ 6.66384477825172, 46.778242364199301 ], [ 6.66384949531266, 46.778241738435803 ], [ 6.66385394690617, 46.7782411388688 ], [ 6.66385922049054, 46.778240398687998 ], [ 6.66386208265682, 46.778239992688597 ], [ 6.66386826476911, 46.778239077204802 ], [ 6.66387162569189, 46.778238569151704 ], [ 6.66387692628167, 46.778237743894302 ], [ 6.66387962630419, 46.778237318446799 ], [ 6.66388661803842, 46.778236175010598 ], [ 6.66388854987527, 46.778235852313898 ], [ 6.66389459755814, 46.778234816653097 ], [ 6.66389761176308, 46.778234290474799 ], [ 6.6639031888362, 46.778233291456097 ], [ 6.66390675573424, 46.778232638471103 ], [ 6.6639117994963, 46.778231694868097 ], [ 6.66391515888961, 46.778231054204902 ], [ 6.66392092004652, 46.778229931076297 ], [ 6.66392374547815, 46.778229367953699 ], [ 6.66392968838418, 46.778228161818198 ], [ 6.66393207466202, 46.778227667102598 ], [ 6.66393856087382, 46.778226298653998 ], [ 6.66394062965746, 46.778225851657403 ], [ 6.66394716054086, 46.778224421285302 ], [ 6.66394884401279, 46.7782240444335 ], [ 6.66395601220656, 46.7782224167198 ], [ 6.66395709805968, 46.778222163660899 ], [ 6.66396435174997, 46.7782204561138 ], [ 6.66396585068623, 46.778220094440996 ], [ 6.66397278355504, 46.7782184057086 ], [ 6.66397488963846, 46.778217878550599 ], [ 6.66398090030599, 46.778216364271003 ], [ 6.66398439128354, 46.778215461238602 ], [ 6.66398936969893, 46.778214165254496 ], [ 6.66399242394923, 46.7782133492708 ], [ 6.66399807950069, 46.778211829424201 ], [ 6.66399907271521, 46.778211555569001 ], [ 6.66400654933197, 46.7782094822497 ], [ 6.66401480017847, 46.778207123788597 ], [ 6.66402292074909, 46.778204731851801 ], [ 6.66402471037441, 46.778204189873797 ], [ 6.66403118793992, 46.778202225273297 ], [ 6.66403925250458, 46.778199708117199 ], [ 6.66404727601101, 46.778197132208298 ], [ 6.66405291606213, 46.778195271294003 ], [ 6.66405566485325, 46.778194360687898 ], [ 6.6640613794241, 46.778192423495 ], [ 6.66406342271791, 46.778191728846103 ], [ 6.66406900609959, 46.778189785407498 ], [ 6.66407173682765, 46.778188829107201 ], [ 6.66407689514451, 46.778186986238502 ], [ 6.6640794797074, 46.778186058017297 ], [ 6.66408463692743, 46.778184167045403 ], [ 6.66408787508482, 46.778182969471501 ], [ 6.66409167058699, 46.778181542331403 ], [ 6.66409590143926, 46.778179938376901 ], [ 6.66409990891261, 46.778178392725998 ], [ 6.66410352777666, 46.7781769849976 ], [ 6.66410812497332, 46.7781751681459 ], [ 6.66411112529839, 46.778173970838097 ], [ 6.66411586472452, 46.778172051235401 ], [ 6.66411927619876, 46.7781706526915 ], [ 6.66412330786572, 46.778168979845198 ], [ 6.66412672374377, 46.778167546828598 ], [ 6.66413167112285, 46.778165444422001 ], [ 6.664133681286, 46.7781645800749 ], [ 6.66413935709129, 46.7781621100265 ], [ 6.66414196373877, 46.7781609575106 ], [ 6.66414624934557, 46.778159049033498 ], [ 6.66414914656505, 46.7781577425149 ], [ 6.66415440439222, 46.778155345375602 ], [ 6.66415722064223, 46.778154038205301 ], [ 6.66416095934473, 46.778152294858103 ], [ 6.66416484622542, 46.778150455017098 ], [ 6.66416906778562, 46.778148440823401 ], [ 6.66417087975794, 46.7781475621141 ], [ 6.6641765910612, 46.778144774389297 ], [ 6.6641795475162, 46.7781433008725 ], [ 6.6641830255048, 46.778141564568102 ], [ 6.66418761715497, 46.7781392319486 ], [ 6.66419074487435, 46.7781376358746 ], [ 6.66419316497314, 46.778136377091499 ], [ 6.66419813710004, 46.778133782939001 ], [ 6.66420501316818, 46.778130114794301 ], [ 6.66420708290335, 46.778128987858402 ], [ 6.66421207053958, 46.778126268819399 ], [ 6.66432476805192, 46.778074947743001 ], [ 6.66450054728723, 46.777998686313197 ], [ 6.664668468183, 46.777867856175099 ], [ 6.66474088072648, 46.7776857308993 ], [ 6.66478734465012, 46.777605263037202 ], [ 6.66479059330817, 46.777599986497599 ], [ 6.66479314109662, 46.7775957114101 ], [ 6.66479382849615, 46.777594553749203 ], [ 6.66479616377489, 46.777590503836599 ], [ 6.66479689956782, 46.777589223331098 ], [ 6.66479890772389, 46.777585621003198 ], [ 6.66480005287461, 46.777583551304097 ], [ 6.66480173573032, 46.777580426546997 ], [ 6.66480294815009, 46.777578158391002 ], [ 6.6648048721153, 46.777574454253099 ], [ 6.66480573871119, 46.777572769105703 ], [ 6.66480748169516, 46.777569289440997 ], [ 6.66480867704968, 46.777566867504902 ], [ 6.66481010432594, 46.777563907729203 ], [ 6.66481119871914, 46.777561608778498 ], [ 6.66481293497401, 46.7775578656357 ], [ 6.66481372259246, 46.777556136678598 ], [ 6.66481536947362, 46.777552440722602 ], [ 6.66481627843533, 46.777550356521203 ], [ 6.66481771669154, 46.777546991818902 ], [ 6.66481867385072, 46.777544699288399 ], [ 6.66482005300553, 46.777541328942696 ], [ 6.66482101895897, 46.7775389018948 ], [ 6.6648222380821, 46.777535787389397 ], [ 6.66482313330568, 46.777533433263599 ], [ 6.66482448037247, 46.777529827009197 ], [ 6.66482505046004, 46.777528249176697 ], [ 6.66482652310931, 46.777524112960599 ], [ 6.66482701134606, 46.777522686436598 ], [ 6.66482843896105, 46.777518464832099 ], [ 6.66482895546889, 46.777516868521303 ], [ 6.6648302272143, 46.777512903418199 ], [ 6.66483123893043, 46.777509583547698 ], [ 6.66483190756199, 46.777507378301301 ], [ 6.66483255723559, 46.777505129191397 ], [ 6.66483362908718, 46.777501381225498 ], [ 6.6648351426106, 46.777495747470397 ], [ 6.66483656261582, 46.777490151762997 ], [ 6.66483788981403, 46.777484544630802 ], [ 6.66483869721193, 46.777480870712097 ], [ 6.6648392535313, 46.777478289591102 ], [ 6.66483978804659, 46.777475652043798 ], [ 6.66484035765313, 46.777472800474499 ], [ 6.66484095143336, 46.777469610272099 ], [ 6.66484150267371, 46.777466546571098 ], [ 6.66484191066233, 46.777464134967502 ], [ 6.66484239840401, 46.777461166116403 ], [ 6.66484294880376, 46.777457551615299 ], [ 6.66484326370368, 46.7774553746656 ], [ 6.66484372424199, 46.777451980633799 ], [ 6.66484404579982, 46.777449454399402 ], [ 6.66484444506031, 46.777446096720801 ], [ 6.6648447011514, 46.777443763505502 ], [ 6.66484507332672, 46.777440129322201 ], [ 6.66484524599457, 46.777438258860002 ], [ 6.6648455885152, 46.777434263040199 ], [ 6.66484576709454, 46.777431808496097 ], [ 6.66484597286451, 46.777428829062998 ], [ 6.66484612057625, 46.777426268578701 ], [ 6.66484631623106, 46.777422553392803 ], [ 6.66484636836498, 46.777421185304703 ], [ 6.66484652282241, 46.777416872833598 ], [ 6.66484656797332, 46.777414706744302 ], [ 6.6648466381091, 46.7774111001264 ], [ 6.6648466457462, 46.777408958398802 ], [ 6.66484665609428, 46.777405326891703 ], [ 6.66484888394576, 46.7772503427544 ], [ 6.66484892168777, 46.777246760208101 ], [ 6.66484897524501, 46.777241298437602 ], [ 6.66484899178193, 46.777235508552401 ], [ 6.66484898160794, 46.777229868756699 ], [ 6.66484896533853, 46.777226496047703 ], [ 6.66484887311363, 46.777218056158603 ], [ 6.66484885039696, 46.777216239092503 ], [ 6.66484880128749, 46.777213806284301 ], [ 6.66484864789208, 46.777206622911798 ], [ 6.66484851614625, 46.777201896306799 ], [ 6.6648483458053, 46.777196521056801 ], [ 6.66484817558209, 46.777191733769101 ], [ 6.66484787656655, 46.777184630306202 ], [ 6.66484776913804, 46.777182146314303 ], [ 6.66484473595664, 46.777119874148603 ], [ 6.66480988610986, 46.7766201856452 ], [ 6.66481039202525, 46.776594100982997 ], [ 6.66481050947321, 46.776589483287502 ], [ 6.66481071330912, 46.776584867977299 ], [ 6.6648107641742, 46.776584052022301 ], [ 6.66481078006233, 46.776583715268103 ], [ 6.66481084848836, 46.776582699492202 ], [ 6.66481100092725, 46.776580254135197 ], [ 6.66481107467333, 46.776579341803597 ], [ 6.66481112957661, 46.776578526770997 ], [ 6.66481123707546, 46.776577332685299 ], [ 6.66481137361103, 46.776575643568897 ], [ 6.66481153902542, 46.776573978657801 ], [ 6.6648115965555, 46.776573339619901 ], [ 6.66481165545215, 46.776572806811799 ], [ 6.66481183136042, 46.776571036278597 ], [ 6.66481214781727, 46.776568352635401 ], [ 6.66481216889356, 46.776568161968797 ], [ 6.66481218322043, 46.776568052406503 ], [ 6.66481237416251, 46.776566433163701 ], [ 6.66481300200428, 46.776561835123701 ], [ 6.66481371356354, 46.776557243049197 ], [ 6.66481451013658, 46.776552657848697 ], [ 6.66481539041417, 46.776548079513297 ], [ 6.66481543388731, 46.776547873669401 ], [ 6.66481550354397, 46.776547511715698 ], [ 6.66481585950198, 46.776545858397597 ], [ 6.66481635569254, 46.7765435089512 ], [ 6.66481650715575, 46.776542850239998 ], [ 6.6648166117127, 46.776542364604197 ], [ 6.66481686392509, 46.776541298655701 ], [ 6.66481740464952, 46.776538947053197 ], [ 6.66481771769067, 46.776537690306498 ], [ 6.66481782510629, 46.7765372363259 ], [ 6.66481799398723, 46.776536581076002 ], [ 6.66481853858143, 46.776534394727499 ], [ 6.66481904198772, 46.7765325148847 ], [ 6.6648191421343, 46.776532126320703 ], [ 6.66481924426285, 46.776531759539601 ], [ 6.66481975485676, 46.7765298528561 ], [ 6.66482044650706, 46.776527441838098 ], [ 6.66482056463967, 46.7765270175802 ], [ 6.66482064441217, 46.776526751962102 ], [ 6.66482105478471, 46.7765253214477 ], [ 6.66482206635348, 46.7765220173304 ], [ 6.66482209064526, 46.776521936446201 ], [ 6.66482210076963, 46.776521904915903 ], [ 6.6648224383395, 46.776520802301299 ], [ 6.66482366289649, 46.776517039992697 ], [ 6.66482372214391, 46.776516855478803 ], [ 6.6648237375261, 46.776516810701999 ], [ 6.66482390553396, 46.7765162945174 ], [ 6.66482545502001, 46.776511800785698 ], [ 6.66482711132184, 46.776507254702899 ], [ 6.66482727966068, 46.776506816305101 ], [ 6.66482728405138, 46.776506804287102 ], [ 6.66482730651971, 46.776506746357299 ], [ 6.66482885121156, 46.776502723580599 ], [ 6.66483067598554, 46.776498208327297 ], [ 6.6648309385745, 46.776497589755699 ], [ 6.66483123770988, 46.776496854584998 ], [ 6.6648318412972, 46.7764954632433 ], [ 6.66483258563084, 46.776493709842399 ], [ 6.66483325523721, 46.776492203940499 ], [ 6.66483337777662, 46.776491921472299 ], [ 6.66483354160588, 46.776491559915598 ], [ 6.66483457885101, 46.776489227217397 ], [ 6.66483533308553, 46.776487606278302 ], [ 6.66483560881774, 46.776486997761801 ], [ 6.66483593439422, 46.776486313995001 ], [ 6.66483665559441, 46.776484764050501 ], [ 6.66483751459733, 46.776482995295602 ], [ 6.66483794428426, 46.776482092878901 ], [ 6.66483827227374, 46.776481435180003 ], [ 6.66483881457753, 46.7764803185337 ], [ 6.66483974043309, 46.776478491162699 ], [ 6.66484037192879, 46.776477224859697 ], [ 6.66484068263871, 46.776476631521199 ], [ 6.6648410570838, 46.776475892474899 ], [ 6.66484271732769, 46.776472746034102 ], [ 6.66484291611982, 46.776472366416201 ], [ 6.66484295996378, 46.776472286197901 ], [ 6.66484338179093, 46.776471486764699 ], [ 6.66484578868605, 46.776467102302703 ], [ 6.66484827645975, 46.776462739079797 ], [ 6.66485084640849, 46.7764583980046 ], [ 6.66485107262638, 46.776458029398 ], [ 6.66485111042261, 46.776457965656 ], [ 6.66485138200689, 46.776457525283497 ], [ 6.66485349588772, 46.776454080858201 ], [ 6.66485384002447, 46.776453539619901 ], [ 6.66485403332523, 46.776453226183598 ], [ 6.66485472750673, 46.776452143839201 ], [ 6.66485622621969, 46.776449786750099 ], [ 6.6648567327654, 46.776449017307101 ], [ 6.66485706064522, 46.776448506087903 ], [ 6.66485784561816, 46.776447326883599 ], [ 6.66485903739147, 46.776445516579599 ], [ 6.66485963904685, 46.776444632753901 ], [ 6.66486017855269, 46.776443822295803 ], [ 6.66486091071171, 46.776442764690898 ], [ 6.6648619267585, 46.776441272128203 ], [ 6.66486298480201, 46.7764397686637 ], [ 6.66486340155035, 46.776439166670002 ], [ 6.66486380703067, 46.776438600288699 ], [ 6.66486489563019, 46.7764370534045 ], [ 6.66486614698596, 46.776435331802297 ], [ 6.66486671526958, 46.776434538014698 ], [ 6.66486715322811, 46.776433947424799 ], [ 6.66486794268416, 46.776432861299298 ], [ 6.6648693188127, 46.7764310271196 ], [ 6.66487012036745, 46.776429946217597 ], [ 6.66487050885403, 46.7764294409671 ], [ 6.66487106792057, 46.776428695812498 ], [ 6.66487317572213, 46.776425972541901 ], [ 6.66487362976425, 46.776425382032301 ], [ 6.66487375019652, 46.776425230323397 ], [ 6.66487427000408, 46.776424558734199 ], [ 6.66487661634209, 46.776421619831297 ], [ 6.66487721682815, 46.776420863397099 ], [ 6.66487733555539, 46.776420718981498 ], [ 6.66487755024405, 46.776420450073402 ], [ 6.66488090600899, 46.776416370711701 ], [ 6.66498841352921, 46.776288548681201 ], [ 6.66511507121051, 46.776131080021003 ], [ 6.66523512397401, 46.775986700439802 ], [ 6.66539607909868, 46.775793300547001 ], [ 6.66544831374473, 46.775730233616599 ], [ 6.66575090345746, 46.775366421535999 ], [ 6.66575472444255, 46.775361211818897 ], [ 6.6657579763429, 46.7753566527321 ], [ 6.66575853857536, 46.775355861257303 ], [ 6.66576142314038, 46.775351697179097 ], [ 6.66576220226629, 46.775350568511797 ], [ 6.66576559488181, 46.775345526526699 ], [ 6.66576568759461, 46.775345388075799 ], [ 6.6657688766628, 46.7753405068514 ], [ 6.66576925082636, 46.7753399293345 ], [ 6.6657718799847, 46.775335780035803 ], [ 6.66577292384086, 46.775334113425103 ], [ 6.66577488381462, 46.775330922342199 ], [ 6.66577649643916, 46.775328262468001 ], [ 6.66577826303618, 46.775325293863403 ], [ 6.66577947564515, 46.775323232812397 ], [ 6.66578168160158, 46.775319403752 ], [ 6.66578286273953, 46.775317313642297 ], [ 6.6657844411822, 46.775314481753497 ], [ 6.6657861990367, 46.775311266000699 ], [ 6.66578754185011, 46.775308772316698 ], [ 6.66578888134637, 46.775306237223703 ], [ 6.66579078033267, 46.7753025853509 ], [ 6.66579145654067, 46.775301253901297 ], [ 6.66579358615565, 46.775297008124802 ], [ 6.66579481360415, 46.775294483625899 ], [ 6.66579606714818, 46.775291890386001 ], [ 6.66579720832935, 46.775289469682399 ], [ 6.66579904475402, 46.775285523831201 ], [ 6.66580150161623, 46.775280033140803 ], [ 6.66580357463158, 46.775275208217103 ], [ 6.66580380506728, 46.775274671484603 ], [ 6.66580531286067, 46.775271023991699 ], [ 6.66580625298502, 46.775268741356697 ], [ 6.66580735130423, 46.7752659131692 ], [ 6.66580845405417, 46.775263064720299 ], [ 6.66580876717617, 46.775262221253101 ], [ 6.66581059951925, 46.775257262576403 ], [ 6.66581087187186, 46.775256494576503 ], [ 6.66581250224838, 46.775251878531797 ], [ 6.66581338049019, 46.7752492773269 ], [ 6.66581444934667, 46.775246078121697 ], [ 6.66581530111341, 46.775243422313601 ], [ 6.66581616410093, 46.775240705457698 ], [ 6.66581719272208, 46.775237323810003 ], [ 6.6658179184741, 46.775234895873403 ], [ 6.66581887901798, 46.775231555121202 ], [ 6.66581945594407, 46.775229514781103 ], [ 6.66582052396864, 46.775225573497003 ], [ 6.66582099843741, 46.7752237767575 ], [ 6.66582185098379, 46.775220427029303 ], [ 6.6658226236202, 46.775217284302499 ], [ 6.66582316163502, 46.775215025097403 ], [ 6.66582377302743, 46.775212392177998 ], [ 6.66582466062524, 46.775208392236102 ], [ 6.66582501441728, 46.775206721644402 ], [ 6.66582576942325, 46.775203047267098 ], [ 6.66582620425634, 46.7752008279652 ], [ 6.66582687408848, 46.775197290220902 ], [ 6.66582731737865, 46.7751948009183 ], [ 6.66582785772048, 46.775191678299699 ], [ 6.66582823395376, 46.775189360270303 ], [ 6.66582882748721, 46.775185575262199 ], [ 6.66582902749265, 46.775184191306003 ], [ 6.66582962510631, 46.775179949129601 ], [ 6.6658300254934, 46.775176787362298 ], [ 6.66583029537195, 46.775174627829998 ], [ 6.66583074081621, 46.775170627069002 ], [ 6.66583095900267, 46.7751686192343 ], [ 6.66583142064822, 46.775163685933101 ], [ 6.66583149142483, 46.775162921671303 ], [ 6.66583175141308, 46.775159590245302 ], [ 6.6658319499142, 46.775157006548 ], [ 6.66583692512283, 46.775157040260197 ], [ 6.66583700516157, 46.775155393208401 ], [ 6.66583720628799, 46.7751510857155 ], [ 6.66583728829764, 46.775148675083202 ], [ 6.66583738539534, 46.775145496298499 ], [ 6.66583745441385, 46.775141948404602 ], [ 6.66583747997265, 46.775139863314003 ], [ 6.6658374974625, 46.775135893686397 ], [ 6.66583748929678, 46.775134474754502 ], [ 6.66583744489021, 46.775130102517103 ], [ 6.6658374233392, 46.775129211568803 ], [ 6.6658373111777, 46.775124675645202 ], [ 6.66583716191837, 46.775120899782003 ], [ 6.6658370939693, 46.775119208206902 ], [ 6.66583685225184, 46.775114760969103 ], [ 6.66583678081097, 46.775113540093599 ], [ 6.66583648883847, 46.775109306564502 ], [ 6.66583635529912, 46.775107567426403 ], [ 6.66583604915106, 46.775103904552601 ], [ 6.66583573619957, 46.775100612873203 ], [ 6.66583550599582, 46.7750982812586 ], [ 6.66583499064076, 46.775093656723698 ], [ 6.66583484226208, 46.775092345660099 ], [ 6.66583469532158, 46.775091220789903 ], [ 6.66583404755693, 46.775086336182 ], [ 6.66583379709731, 46.775084611854901 ], [ 6.66583320541712, 46.775080642545198 ], [ 6.66583276934772, 46.775077919650698 ], [ 6.66583219401556, 46.775074492286898 ], [ 6.66583179504462, 46.775072207089003 ], [ 6.66583113465332, 46.775068627825803 ], [ 6.66583064237559, 46.775066031237301 ], [ 6.66582985798531, 46.7750621672349 ], [ 6.66582948780535, 46.775060355957798 ], [ 6.66582896681418, 46.7750579804718 ], [ 6.66582827209868, 46.775054827751397 ], [ 6.66582752003768, 46.7750516142058 ], [ 6.665826869156, 46.775048888488499 ], [ 6.66582611711269, 46.775045869156997 ], [ 6.66582541814816, 46.775043142716598 ], [ 6.66582458415367, 46.775039985198298 ], [ 6.66582377631963, 46.775037047608997 ], [ 6.66582302188084, 46.7750343443413 ], [ 6.66582178028065, 46.775030103793299 ], [ 6.66582135332843, 46.775028653277701 ], [ 6.6657752994168, 46.774880178800402 ], [ 6.66572110238324, 46.774706100769599 ], [ 6.66572060245353, 46.774704507909497 ], [ 6.66571961849572, 46.774701386393197 ], [ 6.66571914913964, 46.774699973986102 ], [ 6.66571806624218, 46.774696738071199 ], [ 6.66571733190684, 46.774694645563301 ], [ 6.66571645369556, 46.7746921701603 ], [ 6.66571551982639, 46.7746896419292 ], [ 6.66571477866102, 46.774687664839 ], [ 6.66571378010179, 46.7746850932323 ], [ 6.66571280465002, 46.774682637852997 ], [ 6.66571208151616, 46.774680861704397 ], [ 6.66571094832671, 46.7746781372662 ], [ 6.66570996733078, 46.774675835952401 ], [ 6.66570915934544, 46.774673984994301 ], [ 6.66570791016031, 46.774671178906999 ], [ 6.6657067428625, 46.774668642765597 ], [ 6.66570600787655, 46.774667061111302 ], [ 6.66570434007599, 46.774663582174902 ], [ 6.66570378251538, 46.774662430125701 ], [ 6.66570201520862, 46.774658898963999 ], [ 6.66570145886776, 46.774657794030801 ], [ 6.66569974830926, 46.774654516101002 ], [ 6.66569907818817, 46.774653235557601 ], [ 6.66569840183627, 46.774651987680102 ], [ 6.66569660837285, 46.7746486877056 ], [ 6.66569597286654, 46.7746475573447 ], [ 6.66569406473715, 46.774644179978402 ], [ 6.66569275144225, 46.774641925130297 ], [ 6.66569169898077, 46.774640126876797 ], [ 6.66569010958986, 46.774637491515001 ], [ 6.66568857440239, 46.774634985349003 ], [ 6.66568799360998, 46.774634054369301 ], [ 6.66568579367385, 46.774630572999101 ], [ 6.66568497844133, 46.774629308973203 ], [ 6.66568279387157, 46.774625977873498 ], [ 6.665682088058, 46.774624917995702 ], [ 6.66568018900153, 46.774622112589697 ], [ 6.66567865882803, 46.774619887840601 ], [ 6.66567767946871, 46.774618491314797 ], [ 6.66567550153835, 46.774615420667701 ], [ 6.66567473127663, 46.774614361703698 ], [ 6.66567253342952, 46.774611355748497 ], [ 6.66567164757763, 46.774610173421699 ], [ 6.66566929432394, 46.774607050277801 ], [ 6.66566614849844, 46.774602995197 ], [ 6.6656194980389, 46.774559948503303 ], [ 6.66561251850059, 46.774553604068501 ], [ 6.66561867997188, 46.774507496884098 ], [ 6.66569488008447, 46.7740519214017 ], [ 6.66569735438039, 46.774036698670599 ], [ 6.66569746511556, 46.7740360164481 ], [ 6.66570231050621, 46.774007030582297 ], [ 6.6657132216969, 46.773941756016498 ], [ 6.66571493225955, 46.773932052041097 ], [ 6.66572353155642, 46.773880293955401 ], [ 6.66572484792391, 46.773872320608398 ], [ 6.6657261126974, 46.773864658785598 ], [ 6.665726160723, 46.773864394477499 ], [ 6.66572715102771, 46.773858926242802 ], [ 6.66588954329384, 46.772887102422899 ], [ 6.66899450240324, 46.774087100712997 ], [ 6.66899450308994, 46.774087101941802 ], [ 6.66899450518719, 46.774087102752297 ], [ 6.66901786909909, 46.7741289114484 ], [ 6.66926610450735, 46.774340998935898 ], [ 6.66968999570828, 46.7745025445412 ], [ 6.66984475633301, 46.774429731616898 ], [ 6.67005582130998, 46.774430164661702 ], [ 6.67023103863625, 46.774410204998397 ], [ 6.67040481569356, 46.774353532130299 ], [ 6.67065731496514, 46.774221373857003 ], [ 6.67111262033859, 46.773952403204198 ], [ 6.67134759692371, 46.7738367678906 ], [ 6.67156143861023, 46.773780002986101 ], [ 6.6717485019277, 46.773764708589198 ], [ 6.6720447300318, 46.773770298515601 ], [ 6.67085933172499, 46.772689655825801 ], [ 6.66907483797031, 46.771993940603402 ], [ 6.66743217792135, 46.771353670953197 ], [ 6.66738471622484, 46.771330770191398 ], [ 6.66725709323265, 46.771273592604501 ], [ 6.66707974884147, 46.771223365142198 ], [ 6.66697506008506, 46.771164723201899 ], [ 6.66692112979349, 46.771145557146603 ], [ 6.66682307212915, 46.771108459716999 ], [ 6.66682307059745, 46.771108458645301 ], [ 6.66682306902049, 46.771108458048701 ], [ 6.66675793871593, 46.771062889563801 ], [ 6.66674049769001, 46.771050687048302 ], [ 6.6666655049603, 46.771012126949699 ], [ 6.66666550302851, 46.771012125479601 ], [ 6.66666550204782, 46.7710121249753 ], [ 6.66661123610996, 46.770970827154599 ], [ 6.66651634869224, 46.770904515986501 ], [ 6.66651634834936, 46.770904515497499 ], [ 6.66651634591075, 46.770904513793297 ], [ 6.66646322774687, 46.770828768503499 ], [ 6.66643974515309, 46.770795504940601 ], [ 6.66618018687739, 46.770635420780799 ], [ 6.66617032443659, 46.770629326877099 ], [ 6.66617032401216, 46.770629326451598 ], [ 6.66617032139725, 46.770629324836001 ], [ 6.66612153396656, 46.770580418145101 ], [ 6.66592127648735, 46.770548745415098 ], [ 6.6658256318603, 46.770498709894703 ], [ 6.66564048823156, 46.770453914678598 ], [ 6.66541153535912, 46.770442017571 ], [ 6.66521325248688, 46.770436984344201 ], [ 6.66513050606767, 46.770409615510701 ], [ 6.66503510352767, 46.770370106012997 ], [ 6.66495700459595, 46.770365617971102 ], [ 6.66487563174523, 46.770315588422001 ], [ 6.66479586844217, 46.770308480362402 ], [ 6.66479586726056, 46.770308478512398 ], [ 6.66479586562601, 46.770308478366701 ], [ 6.6647742262329, 46.7702745974198 ], [ 6.66474314185071, 46.770255961289202 ], [ 6.66473385816246, 46.770250395499701 ], [ 6.6646305906869, 46.770238900025099 ], [ 6.66456332022827, 46.770200660527301 ], [ 6.66435834764675, 46.770123703227704 ], [ 6.66425364106617, 46.770075763773299 ], [ 6.66417158962619, 46.770063871644503 ], [ 6.66408742678012, 46.770044049226499 ], [ 6.66408742619614, 46.770044047551103 ], [ 6.66408742428552, 46.770044047101102 ], [ 6.66408138887885, 46.770026733975101 ], [ 6.66406623310096, 46.770015567524901 ], [ 6.66404164774858, 46.770004515732097 ], [ 6.66389206561587, 46.769981639631801 ], [ 6.66381141046114, 46.769954643676897 ], [ 6.66376032576532, 46.769947190007798 ], [ 6.66370698703719, 46.769959871734301 ], [ 6.66362926740635, 46.7699290274251 ], [ 6.66351446570359, 46.769882098141402 ], [ 6.66345783634388, 46.769877845042103 ], [ 6.66338645463523, 46.7699160420756 ], [ 6.66331620950183, 46.7699026103924 ], [ 6.66327442746488, 46.769912851371402 ], [ 6.66319107919281, 46.769854711187698 ], [ 6.66313965356801, 46.769852741741701 ], [ 6.6630005001162, 46.769851255634102 ], [ 6.6630004988026, 46.769851253939599 ], [ 6.66300049735995, 46.769851253924202 ], [ 6.66299432754825, 46.769843295564002 ], [ 6.66297161711981, 46.769774772221602 ], [ 6.66300109189898, 46.769737279952899 ], [ 6.66299973445239, 46.769736356442003 ], [ 6.66299668368318, 46.769734281229603 ], [ 6.66295507826714, 46.769706603968203 ], [ 6.66291757946965, 46.769681658768398 ], [ 6.6627624804119, 46.769578410285803 ], [ 6.66229416388498, 46.769650698826503 ], [ 6.6620982903591, 46.769651253984399 ], [ 6.6620205041445, 46.769607004304099 ], [ 6.661840389432, 46.769577080587197 ], [ 6.66127051277087, 46.7695015001893 ], [ 6.6606792133536, 46.769522386197799 ], [ 6.66067921113728, 46.769522384344299 ], [ 6.66067921024744, 46.769522384375698 ], [ 6.66048736859909, 46.769361939618399 ], [ 6.65990220847713, 46.769329608448501 ], [ 6.65978507370072, 46.769353726793902 ], [ 6.65965191972807, 46.769381064585602 ], [ 6.6593107614138, 46.7694511505916 ], [ 6.65926124825394, 46.769461787504902 ], [ 6.65926124671711, 46.769461785267801 ], [ 6.65926124588642, 46.769461785446197 ], [ 6.65883401164736, 46.768839858421501 ], [ 6.65856149146501, 46.768862643114097 ], [ 6.65833408716296, 46.768925138147502 ], [ 6.65815335869129, 46.768937844908301 ], [ 6.658153359643, 46.768937842786301 ], [ 6.65815335568144, 46.768937843064798 ], [ 6.65817419146759, 46.768891386848601 ], [ 6.6582973815042, 46.768738489778301 ], [ 6.65842951390565, 46.768573779156704 ], [ 6.65846991104705, 46.7685235000882 ], [ 6.6581438679763, 46.768490683065899 ], [ 6.65780437592566, 46.768455164040503 ], [ 6.65767953436515, 46.7684420748392 ], [ 6.65755476699138, 46.768432854185299 ], [ 6.65749539153321, 46.768428489256401 ], [ 6.65747890587527, 46.768427746548802 ], [ 6.65739569426161, 46.768423938111297 ], [ 6.65739569492243, 46.768423936324702 ], [ 6.65739569128537, 46.7684239361582 ], [ 6.65741626792686, 46.768368302468602 ], [ 6.65745932168378, 46.768252370222598 ], [ 6.65746760473649, 46.768231916284002 ], [ 6.65751499394101, 46.768114934205997 ], [ 6.65752395001254, 46.7680119923563 ], [ 6.65752614292148, 46.767987178658899 ], [ 6.6575283253884, 46.767963084562801 ], [ 6.6575390402309, 46.767847200643402 ], [ 6.65751102981113, 46.767811537893898 ], [ 6.65744442991929, 46.767726726995399 ], [ 6.65740558866124, 46.767678692608101 ], [ 6.65733893246573, 46.767616885858502 ], [ 6.65731987020469, 46.767613336798 ], [ 6.65731986844945, 46.767613334956401 ], [ 6.65731986726205, 46.767613334735302 ], [ 6.65720793233143, 46.767495890747803 ], [ 6.65708848318222, 46.767400257170401 ], [ 6.65690749412467, 46.767381269054503 ], [ 6.65679324053506, 46.767369283285397 ], [ 6.65674442429577, 46.767364163902201 ], [ 6.65652452482554, 46.7673429548298 ], [ 6.65652452642616, 46.767342953329603 ], [ 6.65652452172157, 46.767342952875801 ], [ 6.65655491632611, 46.7673144643706 ], [ 6.65663455636392, 46.767131403932403 ], [ 6.65662720314212, 46.7670337478337 ], [ 6.65656655691192, 46.766893436449898 ], [ 6.65649197796563, 46.766720905053099 ], [ 6.65641784302973, 46.766549384189098 ], [ 6.65631130877646, 46.766302911923603 ], [ 6.65629560561705, 46.766266463020898 ], [ 6.65619579551678, 46.766288087586503 ], [ 6.65609307485548, 46.766311671789602 ], [ 6.65588879737679, 46.766359837327997 ], [ 6.65574088157953, 46.766394355867597 ], [ 6.65564171037405, 46.766319607172399 ], [ 6.65545132064805, 46.766176103492803 ], [ 6.65535818424262, 46.7660898226463 ], [ 6.65438309274635, 46.765246230248202 ], [ 6.65418844113981, 46.7650831447013 ], [ 6.65406861667336, 46.764986873610198 ], [ 6.65401633013606, 46.764945492448298 ], [ 6.65327291815155, 46.764397302597601 ], [ 6.65311331054915, 46.764279606445697 ], [ 6.65274027479624, 46.7640687802025 ], [ 6.65269725878565, 46.764091962943503 ], [ 6.65252457022919, 46.764182621104801 ], [ 6.65252456776471, 46.7641826191551 ], [ 6.65190972158134, 46.763668399792202 ], [ 6.65179335237717, 46.763569091471297 ], [ 6.65094046628598, 46.7628262566706 ], [ 6.65082972253495, 46.762745337882201 ], [ 6.65032657777092, 46.7622934135291 ], [ 6.64962338259228, 46.761665041969501 ], [ 6.6495555453609, 46.761604389763697 ], [ 6.64905314304631, 46.761210580163997 ], [ 6.64873257562992, 46.760959352533902 ], [ 6.64796297262561, 46.760211314235399 ], [ 6.64774201607869, 46.759987942328799 ], [ 6.64755940074245, 46.759747743509003 ], [ 6.64734882678984, 46.759521833668103 ], [ 6.64719933728956, 46.759361477920997 ], [ 6.64684563065461, 46.7589438601143 ], [ 6.64630976718145, 46.758487281891902 ], [ 6.64560128785315, 46.757762051518299 ], [ 6.64537864824355, 46.757512124999302 ], [ 6.64527885711583, 46.7573643472832 ], [ 6.6452566987244, 46.757224666004397 ], [ 6.64516621477687, 46.757093774756299 ], [ 6.64388827711939, 46.757617253950201 ], [ 6.64377699658735, 46.757662806956098 ], [ 6.64325582602734, 46.7578624809302 ], [ 6.64317947411117, 46.757891634752497 ], [ 6.64316328127305, 46.757897908542503 ], [ 6.64313695294381, 46.757907980350602 ], [ 6.64312115498532, 46.757914077344402 ], [ 6.64307679190733, 46.757931039850298 ], [ 6.64304914704867, 46.757941642186402 ], [ 6.64293330177255, 46.757985993557497 ], [ 6.64290907912328, 46.757995270132803 ], [ 6.64298010334823, 46.758060896319797 ], [ 6.64300092498965, 46.7581400262385 ], [ 6.64293274258525, 46.758236436315002 ], [ 6.64292943855289, 46.758238572742997 ], [ 6.64194574418563, 46.7590696748453 ], [ 6.64192917569467, 46.759083592716401 ], [ 6.64162152558994, 46.759342324821901 ], [ 6.64160738018251, 46.759351761615001 ], [ 6.64121987343143, 46.759610744269899 ], [ 6.64053603170666, 46.760079506036199 ], [ 6.64048554821244, 46.760120623809399 ], [ 6.64036894807181, 46.760215434424403 ], [ 6.64033409992899, 46.760243797466998 ], [ 6.64021802786822, 46.760338251438398 ], [ 6.64015085018536, 46.7603928361223 ], [ 6.64012776995034, 46.760413275543598 ], [ 6.63993027109959, 46.760587403132497 ], [ 6.63956054993015, 46.760978744710101 ], [ 6.63912578285461, 46.761430441679799 ], [ 6.63877744200703, 46.761738808270003 ], [ 6.63770852534196, 46.762640524793497 ], [ 6.63569036298117, 46.760766149881597 ], [ 6.63538325253869, 46.761196691534103 ], [ 6.63529242657799, 46.761256594739599 ], [ 6.63517678037008, 46.761277909566999 ], [ 6.63505202002073, 46.761269563581003 ], [ 6.63504787915738, 46.7612751123891 ], [ 6.63502089363731, 46.761311445719002 ], [ 6.63484521648503, 46.761548329852502 ], [ 6.63450295025889, 46.7620180236297 ], [ 6.63449947434095, 46.762022857278403 ], [ 6.63447968638349, 46.762050514889097 ], [ 6.63447661293179, 46.762054721593401 ], [ 6.63411075625992, 46.7625520455505 ], [ 6.63353934377594, 46.7632608510567 ], [ 6.63324187863071, 46.763665816916102 ], [ 6.63316195485176, 46.763775362655799 ], [ 6.63314618385685, 46.763796931237202 ], [ 6.63307762798397, 46.763890364629397 ], [ 6.63306146005179, 46.763912290584301 ], [ 6.63315020458188, 46.763991992216198 ], [ 6.63346903588375, 46.764285712254697 ], [ 6.63410516438081, 46.764862614179897 ], [ 6.63486962577207, 46.765578415057199 ], [ 6.63582034914834, 46.766455919294103 ], [ 6.63658940115565, 46.767191711228797 ], [ 6.6367857763793, 46.767376699080899 ], [ 6.63688312321095, 46.767468512433197 ], [ 6.63703560348395, 46.767612080264897 ], [ 6.63737206641007, 46.7679291225759 ], [ 6.63742525939302, 46.767979151865198 ], [ 6.63736902582693, 46.7680018280602 ], [ 6.637369028045001, 46.768001830114009 ], [ 6.63393900085925, 46.769384780747899 ], [ 6.63358343056601, 46.769251830061499 ], [ 6.63355717384103, 46.769291676738597 ], [ 6.63367148319777, 46.769334674643801 ], [ 6.63213948249831, 46.771260136408102 ], [ 6.63173794760797, 46.771764936864102 ], [ 6.63167661243814, 46.771733916472499 ], [ 6.63163255610812, 46.7717119247582 ], [ 6.63130943371061, 46.771536195844099 ], [ 6.63099483395973, 46.771351081275 ], [ 6.63072779571199, 46.771181325283003 ], [ 6.63044180298903, 46.770983457631502 ], [ 6.63015853078319, 46.770770224723698 ], [ 6.62998003090635, 46.770633660385201 ], [ 6.62879328121297, 46.7697290632834 ], [ 6.6286834682054, 46.7699008255506 ], [ 6.62864550983185, 46.769952372677899 ], [ 6.6280797128967, 46.7707216436458 ], [ 6.62795387653237, 46.770870351787003 ], [ 6.62786364735234, 46.7709933145318 ], [ 6.62738550157569, 46.771644369154203 ], [ 6.62687405032637, 46.772341244481701 ], [ 6.62693823157021, 46.772383082416297 ], [ 6.62664345168141, 46.772655450333403 ], [ 6.62661951996655, 46.772688204852798 ], [ 6.62657714073421, 46.772746107143597 ], [ 6.62645615053681, 46.772911490442198 ], [ 6.62613270564682, 46.773356375145703 ], [ 6.62588944124896, 46.773693698950403 ], [ 6.62587018100233, 46.773720549524398 ], [ 6.62575355058488, 46.7738830843915 ], [ 6.62570753651502, 46.773947437272497 ], [ 6.62548303510174, 46.774264472995497 ], [ 6.62526690574013, 46.774573201829099 ], [ 6.62518580814779, 46.774688941469002 ], [ 6.6247719220963, 46.7752944739252 ], [ 6.62458354714505, 46.775577041485498 ], [ 6.62456049681144, 46.775611961358102 ], [ 6.62455138575144, 46.775625660381799 ], [ 6.62437524897316, 46.775895450274199 ], [ 6.62414242165738, 46.776259743252403 ], [ 6.62413909087684, 46.776265267806103 ], [ 6.62404638818745, 46.776419004984596 ], [ 6.62382865412985, 46.776772069602501 ], [ 6.62374470534839, 46.776902720886802 ], [ 6.62361320625409, 46.777121012364802 ], [ 6.6235214214199, 46.777276166238302 ], [ 6.6235140310517, 46.777288617913598 ], [ 6.62350838779716, 46.777298113259903 ], [ 6.62345328080981, 46.7773918166179 ], [ 6.62333833899005, 46.777588815732798 ], [ 6.623285345836, 46.777681275105998 ], [ 6.6232467424711, 46.777748738846697 ], [ 6.62320463245848, 46.777822923911998 ], [ 6.62318014318073, 46.777866289429298 ], [ 6.62315579446343, 46.7779090261646 ], [ 6.62313221628369, 46.777952757825801 ], [ 6.62305690486594, 46.778092196166099 ], [ 6.62295092732562, 46.7782763948629 ], [ 6.62282054275384, 46.778515743603897 ], [ 6.62277257107504, 46.778605090297503 ], [ 6.62269372715543, 46.778752779244698 ], [ 6.62232044422611, 46.778740752726698 ], [ 6.62186562286652, 46.778725891593801 ], [ 6.62159179885028, 46.778717903315403 ], [ 6.62042704415747, 46.778681216457798 ], [ 6.62023294078574, 46.778675056327998 ], [ 6.61960089331363, 46.778655136248098 ], [ 6.61952022547703, 46.778629548522197 ], [ 6.61857353508478, 46.778556355856502 ], [ 6.61766760111022, 46.778464107171501 ], [ 6.61743194025936, 46.7784096045391 ], [ 6.61743307567622, 46.778412401435801 ], [ 6.6174310737251, 46.778414906151298 ], [ 6.61738890926854, 46.778440600990599 ], [ 6.61712174265938, 46.7785285464754 ], [ 6.617199939006, 46.7786130414583 ], [ 6.61727683674904, 46.778696807753199 ], [ 6.61729680201862, 46.778718542018197 ], [ 6.61735412104994, 46.778781027013601 ], [ 6.61737704901939, 46.778806021005899 ], [ 6.61756704253095, 46.779012946019897 ], [ 6.61829610902222, 46.779807406054097 ], [ 6.61832522115602, 46.7798391012347 ], [ 6.61827778203087, 46.779875733258599 ], [ 6.6182065324475, 46.779936663259399 ], [ 6.61806576191196, 46.780065372022896 ], [ 6.6179296335272, 46.780198702585999 ], [ 6.61779713626794, 46.780334397604697 ], [ 6.61764272440655, 46.780498721327298 ], [ 6.61760010089232, 46.780537277081301 ], [ 6.61747221324644, 46.780636751533699 ], [ 6.6174356348243, 46.780665274782102 ], [ 6.6173968585293, 46.780692072206101 ], [ 6.61757869821843, 46.780712542159399 ], [ 6.61773609664961, 46.780730227572597 ], [ 6.61875435379788, 46.7808445129956 ], [ 6.61877500936938, 46.7808468204896 ], [ 6.6199436123675, 46.7809779187047 ], [ 6.62019775337789, 46.781006460446903 ], [ 6.62117300991847, 46.781115917697598 ], [ 6.62117300917989, 46.781115919375303 ], [ 6.62117301301963, 46.781115919806297 ], [ 6.6211593139056, 46.781147037279503 ], [ 6.61994085200934, 46.782373621107702 ], [ 6.61991093005971, 46.782403632575402 ], [ 6.61949159590171, 46.782825770286301 ], [ 6.61953965587018, 46.782894662783001 ], [ 6.62041257392017, 46.782992865954697 ], [ 6.62076556048542, 46.783032550624803 ], [ 6.6209102671052, 46.783048829246603 ], [ 6.62155058061441, 46.783120850261902 ], [ 6.62225189978743, 46.783199727222097 ], [ 6.62231896835099, 46.783207224036197 ], [ 6.62231896780317, 46.783207225725 ], [ 6.62231897135676, 46.783207226122201 ], [ 6.62231457501582, 46.783220778613199 ], [ 6.62229380924046, 46.7832429397521 ], [ 6.62231608536606, 46.783285198397202 ], [ 6.62233203275696, 46.783287021529198 ], [ 6.62238667524991, 46.783293529784899 ], [ 6.62238667388047, 46.783293531212699 ], [ 6.62238667771521, 46.783293531669401 ], [ 6.6221519530631, 46.783538250651297 ], [ 6.62204417082277, 46.7836505581163 ], [ 6.62153053516853, 46.784186005672801 ], [ 6.62192480444758, 46.784318999165102 ], [ 6.62197340514838, 46.7843353598833 ], [ 6.62202917118065, 46.784354200777997 ], [ 6.62207777194493, 46.784370561451702 ], [ 6.62207933513572, 46.784371112397601 ], [ 6.62210213644768, 46.784378832199003 ], [ 6.6222332141099, 46.784423040835399 ], [ 6.62274124557868, 46.784594000025002 ], [ 6.62327208055646, 46.784772766466602 ], [ 6.62381386027413, 46.784955476840203 ], [ 6.62434208065123, 46.785134399489301 ], [ 6.62487299994317, 46.785313482852899 ], [ 6.62526378407723, 46.785445298539301 ], [ 6.62550141393906, 46.7855254551489 ], [ 6.6257673069643, 46.785615141438001 ], [ 6.6257673064051, 46.785615142402897 ], [ 6.62576730952373, 46.785615143454798 ], [ 6.625752069214194, 46.785641441349632 ] ] ] ] } }
]
}


		var markerIcon = {
			type : "extraMarker",
       		icon: "fa-coffee",
    		markerColor: 'green',
    		prefix: "fa",
    		layer: 'cars',
  			shape: 'square',
    		imgHeight: 30,
    		imgWidth : 30        
		}
		var playerIcon = {
			type : "extraMarker",
       		iconImg: "img/dick.png",
    		markerColor: 'orange',
    		prefix: "fa",
  			shape: 'square',
    		imgHeight: 30,
    		imgWidth : 30        
		}
		var fontaineIcon = {
			type : "extraMarker",
    		markerColor: 'red',
    		icon: "fa-star",
    		prefix: "fa",
  			shape: 'square',
    		imgHeight: 30,

    		imgWidth : 30        
		}
		var arrosageIcon = {
			type : "extraMarker",
    		markerColor: 'yellow',
    		icon: "fa-calculator",
    		prefix: "fa",
  			shape: 'square',
    		imgHeight: 30,
    		imgWidth : 30        
		}
		var wcIcon = {
			type : "extraMarker",
    		markerColor: 'blue',
    		icon: "fa-calculator",
    		prefix: "fa",
  			shape: 'square',
    		imgHeight: 30,
    		imgWidth : 30        
		}
		var afficheIcon = {
			type : "extraMarker",
    		markerColor: 'black',
    		icon: "fa-calculator",
    		prefix: "fa",
  			shape: 'square',
    		imgHeight: 30,
    		imgWidth : 30        
		}



// function isClickInCircle(latlng,  sectors, circles){
	// 	var totalCircles = 0;
	// 	var isInCircle = false;
	// 	//total circles
	// 	for (var i = sectors.length - 1; i >= 0; i--) {
	// 		totalCircles = totalCircles+ sectors[i].properties.ActionPoints.length;
	// 	};		
	// 	console.log(latlng)
	// 	// check what circles is the marker in
	// 	for (i = 1; i < totalCircles; i++) {
		    
	// 		isInCircle = geolib.isPointInCircle(
	// 			{latitude: latlng.lat, longitude: latlng.lng},
	// 			{latitude: circles["circle"+i].latlngs.lat, longitude:circles["circle"+i].latlngs.lng},
	// 			circles["circle"+i].radius
	// 		)
	// 		if (isInCircle) {
	// 			console.log(marker.properties.type + " is in circle"+i)
	// 		};		
	// 	};

	// }
