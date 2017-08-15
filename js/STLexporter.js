function stringifyVector(vec) {
  return ''+vec.x+' '+vec.y+' '+vec.z;
}

function stringifyVertex(vec) {
  return 'vertex '+stringifyVector(vec)+' \n';
}

function generateSTL(bufferGeo) {	
	var scale = gridLimitX*2.0;
	// var scale = 1.0; 
	var verts 	 = bufferGeo.attributes['position'].array; 	
	var indices  = bufferGeo.attributes['index'].array;
	var normals  = bufferGeo.attributes['normal'].array;

	stl = 'solid spinner\n';
	var i0, i1, i2; 
	for(var i = 0; i<indices.length; i+=3) 
	{
		i0 = indices[i]*3;
		i1 = indices[i+1]*3;
		i2 = indices[i+2]*3;

		stl += ('facet normal '+normals[i0]+' '+normals[i0+1]+' '+normals[i0+2]+' \n');
		stl += ('\touter loop \n');
		stl += '\t\tvertex'+' '+(verts[i0]/scale)+' '+(verts[i0+1]/scale)+' '+(verts[i0+2]/scale)+'\n';
		stl += '\t\tvertex'+' '+(verts[i1]/scale)+' '+(verts[i1+1]/scale)+' '+(verts[i1+2]/scale)+'\n';
		stl += '\t\tvertex'+' '+(verts[i2]/scale)+' '+(verts[i2+1]/scale)+' '+(verts[i2+2]/scale)+'\n';
		stl += ('\tendloop \n');
		stl += ('endfacet \n');
	}
	stl += ('endsolid');
	return stl
}

function saveSTL(bufferGeo) {  
  var stlString = generateSTL( bufferGeo );  
  var blob = new Blob([stlString], {type: 'text/plain'});  
  saveAs(blob, 'spinner.stl'); 
}
