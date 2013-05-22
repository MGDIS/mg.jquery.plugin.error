  // mg.jquery.plugin.error, a jquery-ui widget to help you manage Javascript errors in your users' browsers.
  // Copyright (C) 2013 MGDIS
  // For details see https://github.com/MGDIS/mg.jquery.plugin.error
 
  // This program is free software: you can redistribute it and/or modify
  // it under the terms of the GNU Lesser General Public License as published by
  // the Free Software Foundation, either version 3 of the License, or
  // (at your option) any later version.
 
  // This program is distributed in the hope that it will be useful,
  // but WITHOUT ANY WARRANTY; without even the implied warranty of
  // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  // GNU General Public License for more details.
 
  // You should have received a copy of the GNU General Public License
  // along with this program. If not, see <http://www.gnu.org/licenses/>.
 
  // This is free software, and you are welcome to redistribute it
  // under certain conditions; for details see <http://www.gnu.org/licenses/>.

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
