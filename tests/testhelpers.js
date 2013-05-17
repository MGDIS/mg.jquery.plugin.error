/*! 
 * MGDIS - test helpers
 * Author: Alban Mouton <mouton-a@mgdis.fr>
 * No dependancy
 *
 * Inspired by jquery-ui test helpers from https://github.com/jquery/jquery-ui/blob/master/tests/unit/testsuite.js
 */
 
function includeStyle( url ) {
	document.write("<link rel='stylesheet' href='../../../css/" + url + "'>");
}

function includeScript(url){
	document.write("<script src='../../../js/" + url + "'></script>");
}

function loadResources(resources){
	resources.css = resources.css || [];
	for(var i in (resources.css || [])){
		includeStyle(resources.css[i]);
	}
	
	resources.js = resources.js || [];
	for(var i in (resources.js || [])){
		includeScript(resources.js[i]);
	}
};