var threeView, twoView, uiView; 
var threeCamera, threeControls, threeScene, threeRenderer;
var twoCamera, twoScene, twoRenderer;
var topGeo, gridPointsGeo, gridLineGeo, curvePositions; 
var gridPointMesh, gridLineMesh, gridAxisMesh, gridLimitMesh;
var selectionMesh;   
var nurbsLine, nurbsLineInverse, nurbsControlPointsLine, nurbsControlPointsCloud;
var topSolidMesh, topWireMesh, topPointMesh; 
var lastMouseTime = -1.0, cameraResetTime = 200; 
var appWidth = window.innerWidth*0.5; 
var appHeight = window.innerHeight; 
var mouseStateDown = false;  

var resolution = 60; 
var curveResolution = 120; 
var gridInterval = 12.5; 
var gridLimitX = 150; 

var pts = []; 
var ptsDistance = []; 
var ptsWeight = []; 
var hitIndex = -1; 
var hitRadius = 10;
var bigRadius = 150;
var snapping = false; 
var mouse = new THREE.Vector3(0, 0, 0);  

createViews(); 
positionViews(); 
setupTwoView();
setupThreeView();
events(); 
animate();

function createViews()
{
	threeView = document.createElement('div');
	threeView.id = 'threeView';
	document.body.appendChild( threeView );

	twoView = document.createElement('div');
	twoView.id = 'twoView';	
	document.body.appendChild( twoView );

	uiView = document.createElement('div');
	uiView.id = 'uiView';	
	document.body.appendChild( uiView );

	uiTitleView = document.createElement('div');
	uiTitleView.id = 'uiTitleView';	
	document.body.appendChild( uiTitleView );

	uiHelpView = document.createElement('div');
	uiHelpView.id = 'uiHelpView';	
	document.body.appendChild( uiHelpView );
} 

function positionViews()
{
	threeView.style.width = ''+appWidth+'px';
	threeView.style.height = ''+appHeight+'px';	
	threeView.style.position = 'absolute';
	threeView.style.left = ''+appWidth+'px';
	threeView.style.top = '0px';		

	twoView.style.width = ''+appWidth+'px';
	twoView.style.height = ''+appHeight+'px';	
	twoView.style.position = 'absolute';
	twoView.style.left = '0px';		
	twoView.style.top = '0px';		
	
	var len = gridInterval*2.0; 
	var btnWidth = len*2; 
	var btnHeight = len; 
	var padding = len*.25; 		
	uiView.id = 'button';
	uiView.style.width = ''+btnWidth+'px';
	uiView.style.height = ''+btnHeight+'px';	
	uiView.style.lineHeight = '0px';	
	uiView.style.fontSize = ''+btnHeight*.5+'px';	
	uiView.style.position = 'absolute';
	uiView.style.left = ''+appWidth*2.0 - btnWidth - padding+'px';		
	uiView.style.top = ''+padding+'px';				
	uiView.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';	
	uiView.innerHTML = '<p>SAVE</p>';  	


	var titleWidth = len*12; 
	var titleHeight = len*2.0; 	

	uiTitleView.id = 'title';
	uiTitleView.style.width = ''+titleWidth+'px';
	uiTitleView.style.height = ''+titleHeight+'px';	
	uiTitleView.style.lineHeight = '3px';	
	uiTitleView.style.fontSize = ''+titleHeight*.5+'px';	
	uiTitleView.style.position = 'absolute';
	uiTitleView.style.left = ''+padding+'px';		
	uiTitleView.style.top = ''+padding+'px';				
	uiTitleView.style.backgroundColor = 'rgba(255, 255, 255, 0.75)';	
	uiTitleView.innerHTML = '<p>SPINNER: A TOP MAKER</p>';  	

	uiHelpView.id = 'help';
	uiHelpView.style.width = ''+titleWidth+'px';
	uiHelpView.style.height = ''+len*4.25+'px';	
	uiHelpView.style.lineHeight = '3px';	
	uiHelpView.style.fontSize = ''+titleHeight*.25+'px';	
	uiHelpView.style.position = 'absolute';
	uiHelpView.style.left = ''+padding+'px';		
	uiHelpView.style.top = ''+(titleHeight+padding*2.0)+'px';					
	uiHelpView.style.textAlign = 'left';			
	uiHelpView.style.paddingLeft = ''+len*.5+'px'; 		
	uiHelpView.innerHTML = '<p>CLICK TO ADD POINT</p><p>SHIFT CLICK DELETE POINT</p><p>CLICK + DRAG + SHIFT = SNAP</p><p>+ TO INCREASE PT WEIGHT</p><p>- TO DECREASE PT WEIGHT</p><p>SPACE TO RESET</p>';
}

function setupTwoView()
{
	twoScene = new THREE.Scene();

	twoRenderer = new THREE.WebGLRenderer({antialias: true});
	twoRenderer.setClearColor(0xEEEEEE , 1);
	twoRenderer.setSize(appWidth, appHeight);

	twoRenderer.gammaInput = true;
	twoRenderer.gammaOutput = true;

	twoView.appendChild(twoRenderer.domElement);		
	var w2 = appWidth*0.5; 
	var h2 = appHeight*0.5; 
	twoCamera = new THREE.OrthographicCamera(-w2, w2, h2, -h2, -1, 1); 		

	createSelectionMesh(); 
	initCurve(); 
	createCurve(); 
	addGrid(); 
}

function createSelectionMesh()
{
	var selectionGeo = new THREE.BufferGeometry();
	var selectionPoints = new Float32Array(3*12); 
	var selectionIndices = new Uint16Array(16);
	selectionGeo.addAttribute('index', new THREE.BufferAttribute(selectionIndices, 1));	
	selectionGeo.addAttribute('position', new THREE.BufferAttribute(selectionPoints, 3));	
	
	var s = gridInterval*0.5; 
	var s2 = s*0.5; 
	var s0 = s+s2; 
	var s1 = 3.0*s; 
	selectionPoints[0] = -s; 	selectionPoints[1] = s; 	selectionPoints[2] = 0; 
	selectionPoints[3] = s; 	selectionPoints[4] = s; 	selectionPoints[5] = 0;
	selectionPoints[6] = s; 	selectionPoints[7] = -s; 	selectionPoints[8] = 0;
	selectionPoints[9] = -s; 	selectionPoints[10] = -s; 	selectionPoints[11] = 0;	
	//T
	selectionPoints[12] = 0; 	selectionPoints[13] = s0; 	selectionPoints[14] = 0;
	selectionPoints[15] = 0;	selectionPoints[16] = s1;	selectionPoints[17]  = 0;
	//R
	selectionPoints[18] = s0;	selectionPoints[19] = 0;	selectionPoints[20] = 0;
	selectionPoints[21] = s1;	selectionPoints[22] = 0;	selectionPoints[23] = 0;	
	//B
	selectionPoints[24] = 0;	selectionPoints[25] = -s0;	selectionPoints[26] = 0;
	selectionPoints[27] = 0;	selectionPoints[28] = -s1;	selectionPoints[29] = 0;
	//L
	selectionPoints[30] = -s0;	selectionPoints[31] = 0;	selectionPoints[32] = 0;
	selectionPoints[33] = -s1;	selectionPoints[34] = 0;	selectionPoints[35] = 0;	

	selectionIndices[0] = 0; selectionIndices[1] = 1; 
	selectionIndices[2] = 1; selectionIndices[3] = 2; 	
	selectionIndices[4] = 2; selectionIndices[5] = 3; 
	selectionIndices[6] = 3; selectionIndices[7] = 0; 
	selectionIndices[8] = 4; selectionIndices[9] = 5; 
	selectionIndices[10] = 6; selectionIndices[11] = 7; 
	selectionIndices[12] = 8; selectionIndices[13] = 9; 	
	selectionIndices[14] = 10; selectionIndices[15] = 11; 	

	var selectionMaterial = new THREE.LineBasicMaterial({ 
		color: 0xFF0000,				
		transparent: true,
		linewidth: 2.0,
		opacity: 0.0 
	});

	selectionMesh = new THREE.Line(selectionGeo, selectionMaterial, THREE.LinePieces); 	
	twoScene.add(selectionMesh);
}

function initCurve()
{
	addPt(0.0, 175.0, 1.0); 	
	addPt(50.0, 175.0, 10.0); 		

	addPt(50.0, 100.0, 1.0); 

	addPt(50.0, 25.0, 10.0); 
	addPt(100.0, 25.0, 1.0); 
	addPt(150.0, 25.0, 10.0); 
	
	addPt(150.0, 0.0, 1.0); 
	addPt(150.0, -25.0, 7.0); 
	addPt(50.0, -75.0, 2.0); 
	addPt(0.0, -175.0, 10.0); 
	
}

function createCurve()
{
	twoScene.remove(nurbsLine);
	twoScene.remove(nurbsLineInverse);
	twoScene.remove(nurbsControlPointsLine);
	twoScene.remove(nurbsControlPointsCloud);
	
	// NURBS curve
	var nurbsControlPoints = [];
	var nurbsKnots = [];
	var nurbsDegree = 3;

	for(var i = 0; i <= nurbsDegree; i++) 
	{
		nurbsKnots.push(0);
	}

	var pt; 
	var wt; 
	for(var i = 0, len = pts.length; i < len; i++)
	{
		pt = pts[i];
		wt = ptsWeight[i];
		nurbsControlPoints.push(new THREE.Vector4(pt.x, pt.y, pt.z, wt));		
	}
	if(pts.length > 0)
	{
		nurbsControlPoints.push(new THREE.Vector4(pt.x, pt.y, pt.z, wt));		
		nurbsControlPoints.push(new THREE.Vector4(pt.x, pt.y, pt.z, wt));		
		nurbsControlPoints.push(new THREE.Vector4(pt.x, pt.y, pt.z, wt));			
	}

	for(var i = 0, len = nurbsControlPoints.length; i < len; i++)
	{
		nurbsKnots.push((i+1)/(len - nurbsDegree));		
	}		

	var nurbsCurve = new THREE.NURBSCurve(nurbsDegree, nurbsKnots, nurbsControlPoints);
	var nurbsGeometry = new THREE.BufferGeometry();
	var verts = nurbsCurve.getPoints(curveResolution);	
	curvePositions = new Float32Array(verts.length*3);
	for(var i = 0, j = 0; i < verts.length; i++)
	{
		curvePositions[j] = verts[i].x;
		curvePositions[j+1] = verts[i].y;
		curvePositions[j+2] = verts[i].z;
		j+=3;
	}
	
	nurbsGeometry.addAttribute('position', new THREE.BufferAttribute(curvePositions, 3));	
	var nurbsMaterial = new THREE.LineBasicMaterial({ 
		linewidth: 3, 
		color: 0x333333, 
		transparent: true 
	});
	nurbsLine = new THREE.Line(nurbsGeometry, nurbsMaterial);	
	twoScene.add(nurbsLine);

	var nurbsInverseGeometry = new THREE.BufferGeometry();
	var curveInversePositions = new Float32Array(verts.length*3);
	for(var i = 0, j = 0; i < verts.length; i++)
	{
		curveInversePositions[j] = -verts[i].x;
		curveInversePositions[j+1] = verts[i].y;
		curveInversePositions[j+2] = verts[i].z;
		j+=3;
	}
	
	nurbsInverseGeometry.addAttribute('position', new THREE.BufferAttribute(curveInversePositions, 3));	
	var nurbsInverseMaterial = new THREE.LineBasicMaterial({ 
		linewidth: 1, 
		color: 0x000000, 
		opacity: 0.5,
		transparent: true 
	});
	nurbsLineInverse = new THREE.Line(nurbsInverseGeometry, nurbsInverseMaterial);
	twoScene.add(nurbsLineInverse);

	var curveControlPositions = new Float32Array(nurbsControlPoints.length*3.0);
	var curveControlColors = new Float32Array(nurbsControlPoints.length*3.0);	
	for(var i = 0, j = 0; i < nurbsControlPoints.length; i++)
	{
		curveControlPositions[j] = nurbsControlPoints[i].x;
		curveControlPositions[j+1] = nurbsControlPoints[i].y;
		curveControlPositions[j+2] = nurbsControlPoints[i].z;

		curveControlColors[j] = nurbsControlPoints[i].w/10.0; 
		curveControlColors[j+1] = 0;
		curveControlColors[j+2] = 0; 
		j+=3;
	}

	var nurbsControlPointsGeometry = new THREE.BufferGeometry();	
	nurbsControlPointsGeometry.addAttribute('color', new THREE.BufferAttribute(curveControlColors, 3));		
	nurbsControlPointsGeometry.addAttribute('position', new THREE.BufferAttribute(curveControlPositions, 3));		
	var nurbsControlPointsMaterial = new THREE.LineBasicMaterial({ 
		linewidth: 1.5, 
		color: 0x000000, 
		opacity: 0.75, 
		transparent: true,			
	});

	nurbsControlPointsLine = new THREE.Line(nurbsControlPointsGeometry, nurbsControlPointsMaterial);	
	twoScene.add(nurbsControlPointsLine);	

	var nurbsControlPointsCloudMaterial = new THREE.PointCloudMaterial({ 
			size: 6.0, 		
			sizeAttenuation: false, 			
			opacity: 1.0,
			color: 0xFFFFFF,
			transparent: true,
			vertexColors: THREE.VertexColors
		});

	nurbsControlPointsCloud = new THREE.PointCloud(nurbsControlPointsGeometry, nurbsControlPointsCloudMaterial);
	twoScene.add(nurbsControlPointsCloud);
}

function addGrid()
{	
	var maxDim = Math.max(appWidth, appHeight);
	var xTicks = Math.ceil(maxDim/gridInterval); 
	var yTicks = Math.ceil(maxDim/gridInterval);
	var totalNumLines = (yTicks+1) + (xTicks+1); 
	var totalNumPts = totalNumLines*2; 
	
	var positions = new Float32Array(3*totalNumPts);	
	var indices = new Uint16Array( totalNumPts );	
	var index = 0;
	var gridLineGeo = new THREE.BufferGeometry();				
	
	var w2 = appWidth*0.5;
	var h2 = appHeight*0.5;	
	var xlen = xTicks*.5; 
	var ylen = yTicks*.5; 
	for(var y = 0; y <= xlen; y++)
	{
		positions[index] = -w2;
		positions[index+1] = y*gridInterval;
		positions[index+2] = 0.0;

		positions[index+3] = w2;
		positions[index+4] = y*gridInterval;
		positions[index+5] = 0.0;
		index+=6; 		

		positions[index] = -w2;
		positions[index+1] = -y*gridInterval;
		positions[index+2] = 0.0;

		positions[index+3] = w2;
		positions[index+4] = -y*gridInterval;
		positions[index+5] = 0.0;
		index+=6; 		
	}

	for(var x = 0; x <= ylen; x++)
	{
		positions[index] = -x*gridInterval;
		positions[index+1] = -h2
		positions[index+2] = 0.0;

		positions[index+3] = -x*gridInterval;
		positions[index+4] = h2; 
		positions[index+5] = 0.0;
		index+=6; 		
	
		positions[index] = x*gridInterval;
		positions[index+1] = -h2
		positions[index+2] = 0.0;

		positions[index+3] = x*gridInterval;
		positions[index+4] = h2; 
		positions[index+5] = 0.0;
		index+=6; 		
	}	
	
	for(var i = 0; i < indices.length; i++)
	{
		indices[i] = i; 
	}
	
	gridLineGeo.addAttribute('index', new THREE.BufferAttribute(indices, 1));
	gridLineGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));	

	var gridLineMaterial = new THREE.LineBasicMaterial({ 
		color: 0x000000,				
		transparent: true,
		linewidth: 0.50,
		opacity: 0.25 
	});

	gridLineMesh = new THREE.Line(gridLineGeo, gridLineMaterial, THREE.LinePieces); 	
	twoScene.add(gridLineMesh);	

	gridPointsGeo = new THREE.BufferGeometry();				
	var gridPoints = new Float32Array((xTicks+1)*(yTicks+1)*3);	

	index = 0; 

	for(var y = 0; y <= ylen; y++)
	{
		for(var x = 0; x <= xlen; x++)
		{
			gridPoints[index+0] = x*gridInterval; 
			gridPoints[index+1] = y*gridInterval; 
			gridPoints[index+2] = 0; 
			index+=3; 

			gridPoints[index+0] = -x*gridInterval; 
			gridPoints[index+1] = y*gridInterval; 
			gridPoints[index+2] = 0; 
			index+=3; 

			gridPoints[index+0] = -x*gridInterval; 
			gridPoints[index+1] = -y*gridInterval; 
			gridPoints[index+2] = 0; 
			index+=3; 
	
			gridPoints[index+0] = x*gridInterval; 
			gridPoints[index+1] = -y*gridInterval; 
			gridPoints[index+2] = 0; 
			index+=3; 
		}		
	}
	
	gridPointsGeo.addAttribute('position', new THREE.BufferAttribute(gridPoints, 3));		
	var gridPointsMaterial = new THREE.PointCloudMaterial({ 
		color: 0x666666,
		size: 3.0, 		
		sizeAttenuation: false, 
		opacity: 0.25,			
		transparent: true
	});

	gridPointMesh = new THREE.PointCloud(gridPointsGeo, gridPointsMaterial);
	twoScene.add(gridPointMesh);

	var axisPoints = new Float32Array(3*8);	
	var axisIndices = new Uint16Array( 12 );	
	index = 0;
	var gridAxisGeo = new THREE.BufferGeometry();				
	//0
	axisPoints[0] = -w2;
	axisPoints[1] = 0.0;
	axisPoints[2] = 0.0;
	//1
	axisPoints[3] = w2;
	axisPoints[4] = 0.0;
	axisPoints[5] = 0.0;
	//2
	axisPoints[6] = 0.0;
	axisPoints[7] = -h2;
	axisPoints[8] = 0.0;
	//3
	axisPoints[9] = 0.0;
	axisPoints[10] = h2;
	axisPoints[11] = 0.0;
	//4
	axisPoints[12] = -w2;
	axisPoints[13] = -h2;
	axisPoints[14] = 0.0;
	//5
	axisPoints[15] = w2;
	axisPoints[16] = -h2;
	axisPoints[17] = 0.0;
	//6
	axisPoints[18] = w2;
	axisPoints[19] = h2;
	axisPoints[20] = 0.0;
	//7
	axisPoints[21] = -w2;
	axisPoints[22] = h2;
	axisPoints[23] = 0.0;
	
	axisIndices[0] = 0; 
	axisIndices[1] = 1; 

	axisIndices[2] = 2; 
	axisIndices[3] = 3;

	axisIndices[4] = 4;  
	axisIndices[5] = 5; 

	axisIndices[6] = 5;  	
	axisIndices[7] = 6;

	axisIndices[8] = 6;  	
	axisIndices[9] = 7;

	axisIndices[10] = 7;  	
	axisIndices[11] = 4;

	gridAxisGeo.addAttribute('index', new THREE.BufferAttribute(axisIndices, 1));
	gridAxisGeo.addAttribute('position', new THREE.BufferAttribute(axisPoints, 3));	

	var gridAxisMaterial = new THREE.LineBasicMaterial({ 
		color: 0x000000,				
		transparent: true,
		linewidth: 2.0, 
		opacity: 0.5 
	});

	gridAxisMesh = new THREE.Line(gridAxisGeo, gridAxisMaterial, THREE.LinePieces); 	
	twoScene.add(gridAxisMesh);	

	var gridLimitGeo = new THREE.BufferGeometry();				
	var gridLimitPoints = new Float32Array(3*4);	
	var gridLimitColors = new Float32Array(3*4);	
	var gridLimitIndices = new Uint16Array( 4 );	
	
	gridLimitPoints[0] = gridLimitX;
	gridLimitPoints[1] = -h2;
	gridLimitPoints[2] = 0.0;

	gridLimitPoints[3] = gridLimitX;
	gridLimitPoints[4] = h2;
	gridLimitPoints[5] = 0.0;

	gridLimitPoints[6] = -gridLimitX;
	gridLimitPoints[7] = -h2;
	gridLimitPoints[8] = 0.0;

	gridLimitPoints[9] = -gridLimitX;
	gridLimitPoints[10] = h2;
	gridLimitPoints[11] = 0.0;
	
	for(var i = 0; i < indices.length; i++)
	{
		gridLimitIndices[i] = i; 
	}

	for(var i = 0; i < gridLimitColors.length; i+=3)
	{
		gridLimitColors[i] = 1.0; 
		gridLimitColors[i+1] = 1.0; 
		gridLimitColors[i+2] = 1.0; 
	}
	
	gridLimitGeo.addAttribute('index', new THREE.BufferAttribute(gridLimitIndices, 1));
	gridLimitGeo.addAttribute('position', new THREE.BufferAttribute(gridLimitPoints, 3));	
	gridLimitGeo.addAttribute('color', new THREE.BufferAttribute(gridLimitColors, 3));	

	var gridLimitMaterial = new THREE.LineBasicMaterial({ 
		color: 0xFF0000,				
		transparent: true,
		linewidth: 1.0, 
		opacity: 0.5 
	});

	gridLimitMesh = new THREE.Line(gridLimitGeo, gridLimitMaterial, THREE.LinePieces); 	
	twoScene.add(gridLimitMesh);
}

function removeGrid()
{
	twoScene.remove(gridLineMesh); 
	twoScene.remove(gridPointMesh); 
	twoScene.remove(gridAxisMesh); 
}

function setupThreeView() 
{
	threeScene = new THREE.Scene();
	threeScene.fog = new THREE.Fog(0xEEEEEE, 1000, 5000);

	threeRenderer = new THREE.WebGLRenderer({ antialias: true });
	threeRenderer.setClearColor( threeScene.fog.color, 1 );
	threeRenderer.setSize( appWidth, appHeight );

	threeRenderer.gammaInput = true;
	threeRenderer.gammaOutput = true;

	threeView.appendChild( threeRenderer.domElement );		

	threeCamera = new THREE.PerspectiveCamera( 27, appWidth / appHeight, 1, 5000 );
	threeCamera.position.z = 1500;

	threeControls = new THREE.TrackballControls( threeCamera, threeView );
	threeControls.rotateSpeed = 1.0;
	threeControls.zoomSpeed = 1.2;
	threeControls.panSpeed = 0.8;
	threeControls.noZoom = false;
	threeControls.noPan = false;
	threeControls.staticMoving = true;
	threeControls.dynamicDampingFactor = 0.3;
	threeControls.keys = [ 65, 83, 68 ];	

	threeScene.add( new THREE.AmbientLight( 0xffffff ) );

	var light1 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light1.position.set( 1, 1, 1 );
	threeScene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff, 0.5 );
	light2.position.set( -1, 0.1, 1 );
	threeScene.add( light2 );	
	createTop(); 
}

function createTop()
{
	pathPoints = curvePositions; 	
	threeScene.remove(topSolidMesh);
	threeScene.remove(topWireMesh); 
	threeScene.remove(topPointMesh); 

	// console.log(pathPoints); 
	var numOfPts = pathPoints.length/3; 	
	var res = resolution; 
		
	var triangles = numOfPts * 2 * res; 
	topGeo = new THREE.BufferGeometry();	
	var indices = new Uint16Array( triangles * 3 );	
	var positions = new Float32Array( triangles * 3 * 3 );	
	var normals = new Float32Array( triangles * 3 * 3 );
	var colors = new Float32Array( triangles * 3 * 3 );
	
	//Generate Verts	
	var color = new THREE.Color();
	var p0 = new THREE.Vector3();	
	var p1 = new THREE.Vector3();	
	var p2 = new THREE.Vector3();	
	var m30 = new THREE.Matrix3(); 	
	var m31 = new THREE.Matrix3(); 	

	//Calculate Normals
	var pA = new THREE.Vector3();
	var pB = new THREE.Vector3();
	var pC = new THREE.Vector3();
	
	var cb = new THREE.Vector3();
	var ab = new THREE.Vector3();	

	var index = 0; 
	var angle = 0.0; 
	var inc = 2.0*Math.PI/res;

	for (var j = 0; j < res; j++) 
	{	
		angle = -inc * j; 
		for (var i = 0; i <= pathPoints.length-3; i += 3) 
		{			
			p0.set(pathPoints[i+0], pathPoints[i+1], pathPoints[i+2]);						
			p1.set(pathPoints[i+3], pathPoints[i+4], pathPoints[i+5]);									
			p2.set(pathPoints[i+0], pathPoints[i+1], pathPoints[i+2]);									
			
			m30.set(
				Math.cos(angle), 0, -Math.sin(angle), 
				0, 1, 0, 
				Math.sin(angle), 0, Math.cos(angle)
			); 						
			m31.set(
				Math.cos(angle-inc), 0, -Math.sin(angle-inc), 
				0, 1, 0, 
				Math.sin(angle-inc), 0, Math.cos(angle-inc)
			); 			

			p0.applyMatrix3(m30); 
			p1.applyMatrix3(m30); 			
			p2.applyMatrix3(m31); 			

			pA.set(p0.x, p0.y, p0.z);
			pB.set(p1.x, p1.y, p1.z);
			pC.set(p2.x, p2.y, p2.z);

			cb.subVectors(pC, pB);
			ab.subVectors(pA, pB);
			cb.cross(ab);

			cb.normalize();

			var nx = cb.x;
			var ny = cb.y;
			var nz = cb.z;

			normals[index+0] = nx;
			normals[index+1] = ny;
			normals[index+2] = nz;

			positions[index+0] = p0.x;		
			positions[index+1] = p0.y;
			positions[index+2] = p0.z;

			color.setHex(0xd0d0d0);

			colors[index + 0] = color.r;
			colors[index + 1] = color.g;
			colors[index + 2] = color.b;

			index+=3; 
		}
	}
	
	index = 0; 
	var len = numOfPts*res;
	for( var i = 0; i < len; i++ )
	{
		if(((i+1) % numOfPts) !== 0)
		{
			var i0 = i%len; 
			var i1 = (i+1)%len; 
			var i2 = (numOfPts+i1)%len; 
			var i3 = (numOfPts+i0)%len; 		

			indices[index+0] = i0;
			indices[index+1] = i1; 
			indices[index+2] = i2; 	

			indices[index+3] = i0; 	
			indices[index+4] = i2; 
			indices[index+5] = i3; 

			index+=6; 	
		}			
	}

	topGeo.addAttribute('index', new THREE.BufferAttribute(indices, 1));
	topGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));
	topGeo.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
	topGeo.addAttribute('color', new THREE.BufferAttribute(colors, 3));	
	topGeo.computeBoundingSphere();

	var topSolidMaterial = new THREE.MeshPhongMaterial({
				color: 0xDDDDDD, 
			 	side: THREE.DoubleSide,
				ambient: 0xEEEEEE, 
				specular: 0xffffff, 
				shininess: 100,
				transparent: true, 
				opacity: 1.0, 
				shading: THREE.FlatShading, 
				vertexColors: THREE.VertexColors 
			});

	topSolidMesh = new THREE.Mesh(topGeo, topSolidMaterial);
	threeScene.add(topSolidMesh);
	
	var topWireGeo = new THREE.BufferGeometry(); 
	
	var len = numOfPts*res; 
	var wireIndices = new Uint16Array(len*4);
	index = 0; 
	for(var j = 0; j < numOfPts; j++)
	{
		for(var i = 0; i < res; i++)
		{
			wireIndices[index] = j+i*numOfPts;		
			wireIndices[index+1] = j+((i+1)*numOfPts)%len;
			index+=2; 
		}	
	}
	var offset = 0; 
	var jumpValue = (numOfPts-1)*2.0; 
	for(var i = 0; i < res; i++)
	{
		for(var j = 0; j < numOfPts-1; j++)
		{	
			wireIndices[index] = offset+j;
			wireIndices[index+1] = offset+j+1;		
			index+=2;						
		}
		offset+=numOfPts;  
	}

	topWireGeo.addAttribute('index', new THREE.BufferAttribute(wireIndices, 1));
	topWireGeo.addAttribute('position', new THREE.BufferAttribute(positions, 3));

	var topWireMaterial = new THREE.LineBasicMaterial({ 
		color: 0x000000,				
		transparent: true,		
		linewidth: 2,
		opacity: 0.25 
	});

	topWireMesh = new THREE.Line(topWireGeo, topWireMaterial, THREE.LinePieces); 	
	threeScene.add(topWireMesh);	

	var topPointMaterial = new THREE.PointCloudMaterial({ 
			size: 2, 		
			sizeAttenuation: false, 
			fog: true, 
			opacity: 0.25,
			color: 0x000000,
			transparent: true
		});

	topPointMesh = new THREE.PointCloud(topGeo, topPointMaterial);
	threeScene.add(topPointMesh);
}

function events() 
{
	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('keypress', keypressed, false); 

	threeView.addEventListener('mousedown', cameraResetCheck, false);

	twoView.addEventListener('mousedown', _mouseDown, false);
	twoView.addEventListener('mousemove', _mouseMove, false);
	twoView.addEventListener('mouseup', _mouseUp, false);

	uiView.addEventListener('mousedown', function()
	{
		var oldRes = resolution; 
		var oldCurveRes = curveResolution; 
		resolution = 200; 
		curveResolution = 200; 
		update(); 
		saveSTL(topGeo); 
		resolution = oldRes; 
		curveResolution = oldCurveRes;
		update(); 
	}, false); 
}

function keypressed(e)
{
	switch(e.keyCode)
	{
		case 32: 
		{
			reset(); 
		}
		break; 		
		
		case 43: 
		{
			if(hitIndex >= 0)
			{				
				ptsWeight[hitIndex] += 1.0; 
				update(); 
			}
		}
		break;

		case 61: 
		{
			if(hitIndex >= 0)
			{				
				ptsWeight[hitIndex] += 0.25; 
				update(); 
			}
		}
		break;

		case 95: 
		{
			if(hitIndex >= 0)
			{			
				ptsWeight[hitIndex] -= 1.0; 
				if(ptsWeight[hitIndex] <= 0)
				{
					deletePt(hitIndex); 
					selectionMesh.material.opacity = 0.0; 
				}
				update(); 				
			}		
		}
		break; 

		case 45: 
		{
			if(hitIndex >= 0)
			{			
				ptsWeight[hitIndex] -= 0.25; 
				if(ptsWeight[hitIndex] <= 0)
				{
					deletePt(hitIndex); 
					selectionMesh.material.opacity = 0.0; 
				}
				update(); 				
			}			
		}
		break;
	}
}

function _mouseDown(e)
{ 	
	mouseStateDown = true; 
	mouseDown(e); 
}

function _mouseMove(e)
{	
	if(mouseStateDown)
	{
		mouseDrag(e); 	
	}
	else
	{
		mouseMove(e); 
	}
}

function _mouseUp(e)
{
	mouseStateDown = false; 	
	mouseUp(e);
}

function remapMouse(x, y)
{
	mouse.x = x - appWidth*0.5; 
	mouse.y = appHeight*0.5 - y;

	// if(mouse.x < 0)
	// {
	// 	mouse.x = 0; 
	// }
	// else if(mouse.x > gridLimitX)
	// {
	// 	mouse.x = gridLimitX; 
	// }
}

function mouseDown(e)
{	
	remapMouse(e.x, e.y); 		
	hitIndex = hitTestPoints(mouse.x, mouse.y);
	if(hitIndex < 0)
	{
		var hitIndicies = []; 
		for(var i = 0; i < ptsDistance.length; i++)
		{
			if(ptsDistance[i] < bigRadius)
			{
				hitIndicies.push(i); 
			}
		}		

		for(var i = 0; i < hitIndicies.length-1; i++)
		{
			var index0 = hitIndicies[i]; 
			var index1 = hitIndicies[i+1]; 
			if((index1 - index0) === 1)
			{
				var index; 
				if(ptsDistance[index0] < ptsDistance[index1])
				{
					index = index0; 
				}
				else
				{
					index = index1; 
				}
				hitIndex = addPtBetween(mouse.x, mouse.y, index+1);
				selectionMesh.position.x = pts[hitIndex].x;
				selectionMesh.position.y = pts[hitIndex].y;
				selectionMesh.material.opacity = 0.75;  			
				update(); 
				return;
			}
		}

		hitIndex = addPt(mouse.x, mouse.y);				
		update(); 
		selectionMesh.position.x = pts[hitIndex].x;
		selectionMesh.position.y = pts[hitIndex].y;
		selectionMesh.material.opacity = 0.75;  			
		return; 		
	}
	else
	{
		if(e.shiftKey)
		{
			deletePt(hitIndex); 
			selectionMesh.position.x = 0;
			selectionMesh.position.y = 0;
			selectionMesh.material.opacity = 0.0; 
			update(); 
			hitIndex = -1; 
			return; 
		}		
	}	

	if(hitIndex>=0)
	{
		selectionMesh.position.x = pts[hitIndex].x;
		selectionMesh.position.y = pts[hitIndex].y;
		selectionMesh.material.opacity = 0.75;  			
	}
}

function mouseUp(e)
{	
	// console.log('mouseUp');
}

function mouseMove(e)
{
	// console.log('mouseMove'); 
}

function mouseDrag(e)
{
	if(e.shiftKey)
	{
		snapping = true; 
	}
	else
	{
		snapping = false; 	
	}
	remapMouse(e.x, e.y); 		
	if(hitIndex !== -1)
	{
		movePt(mouse.x, mouse.y, hitIndex); 
		selectionMesh.position.x = pts[hitIndex].x;
		selectionMesh.position.y = pts[hitIndex].y; 
		selectionMesh.material.opacity = 1.0;  
		update(); 
	}
}

function movePt(x, y, index)
{
	if(snapping)
	{			
		var xr = (x%gridInterval)/gridInterval; 
		var yr = (y%gridInterval)/gridInterval; 

		xr = Math.round(xr); 
		yr = Math.round(yr); 
		pts[index].x = (Math.floor(x/gridInterval)+xr)*gridInterval; 
		pts[index].y = (Math.floor(y/gridInterval)+yr)*gridInterval; 	
	}
	else
	{
		pts[index].x = x; 
		pts[index].y = y; 
	}
}

function addPt(x, y, w)
{	
	//TO DO: insert point in between two points if close enough
	var index = pts.length; 
	pts.push(new THREE.Vector3(x, y, 0)); 
	ptsWeight.push(w ? w : 1.0); 	
	ptsDistance.push(0.0); 	
	return index; 
}

function addPtBetween(x, y, index, w)
{	
	pts.splice(index, 0, new THREE.Vector3(x, y, 0));
	ptsWeight.splice(index, 0, (w ? w : 1.0));
	ptsDistance.splice(index, 0, 0); 
	return index; 
}

function deletePt(index)
{
  	pts.splice(index, 1);	
	ptsWeight.splice(index, 1);	
	ptsDistance.splice(index, 1); 
}

function hitTestPoints(x, y)
{
	var mv = new THREE.Vector3(x, y, 0); 
	for(var i = 0; i < pts.length; i++)
	{
		 ptsDistance[i] = mv.distanceTo(pts[i]); 
	}	

	for(var i = 0; i < ptsDistance.length; i++)
	{
		if(ptsDistance[i] < hitRadius)
		{
			return i; 
		}
	}
	return -1; 
}

function reset()
{
  	pts = []; 
	ptsWeight = []; 
	ptsDistance = [];
	selectionMesh.material.opacity = 0.0; 
	initCurve(); 
	update(); 
}

function update()
{
	createCurve(); 
	createTop(); 
}

function cameraResetCheck() 
{
	var currentTime = Date.now(); 
	if((currentTime - lastMouseTime) < cameraResetTime){		
		threeControls.reset(); 
	}
	lastMouseTime = currentTime; 
}

function onWindowResize() 
{
	appWidth = window.innerWidth*0.5; 
	appHeight = window.innerHeight; 
	positionViews(); 	
	
	var w2 = appWidth*0.5; 
	var h2 = appHeight*0.5; 
	twoCamera.left = -w2;
	twoCamera.right = w2;
	twoCamera.top = h2;
	twoCamera.bottom = -h2;
	twoCamera.near = -1.0; 
	twoCamera.far = 1.0; 
	twoCamera.updateProjectionMatrix();
	twoRenderer.setSize( appWidth, appHeight );

	threeCamera.aspect =  appWidth / appHeight;	
	threeCamera.updateProjectionMatrix();
	threeRenderer.setSize( appWidth, appHeight );
	threeControls.handleResize();

	removeGrid(); 
	addGrid(); 
}

function animate() 
{
	requestAnimationFrame(animate);
	threeControls.update();
	render();
}

function render() 
{	
	twoRenderer.render(twoScene, twoCamera);
	threeRenderer.render(threeScene, threeCamera);
}
