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

function prepareErrorDiv(){
	return $("<div></div>").appendTo($("#qunit-fixture"));
}

function closeRemoveDialogs(){
	$(".ui-dialog-titlebar-close").click();
	$("div:ui-dialog").remove();
}

test("Display errors in elements", function(){
	var errorDiv1 = prepareErrorDiv();
	var errorDiv2 = prepareErrorDiv();
	
	$.mg.error.setDefaultContainer(errorDiv1);
	
	$.mg.errorDisplay();
	equal(errorDiv1.find(".mg-error").length, 1, "An error was added to the default container div");
	
	$.mg.errorDisplay({container : errorDiv2});
	equal(errorDiv2.find(".mg-error").length, 1, "An error was added to another container div");
	
	$.mg.errorDisplay();
	equal(errorDiv1.find(".mg-error").length, 2, "A second error was added to the default container div");
});

test("Display errors in dialogs", function(){
	$.mg.errorDisplay({container : null});
	equal($("div.ui-state-error:ui-dialog").length, 1, "An error dialog was opened");
	$.mg.errorDisplay({container : null});
	equal($("div.ui-state-error:ui-dialog").length, 1, "The second error didn't open a dialog");
	closeRemoveDialogs();
	$.mg.errorDisplay({container : null});
	equal($("div.ui-state-error:ui-dialog").length, 1, "After closing the first one, a second error dialog was opened");
	closeRemoveDialogs();
})

asyncTest("Automatic handling of Ajax errors", function(){
	// test will be ok if 1 assertion is satisfied
	expect(1);
	var errorDiv = prepareErrorDiv();
	$.mg.error.setDefaultContainer(errorDiv);
	$.mg.error.handleAjax();
	
	// register a second handler of ajaxError, it will pass after the one defined by handleAjax()
	$(document).ajaxError(function(){
		equal(errorDiv.find(".mg-error").length, 1, "The failure of $.ajax was automaticaly detected");
		start();
	});
	
	// Set a ridiculously low timeout to fail on purpose
	$.ajax({url : "http://thisServiceDoesNotExist.com", timeout : 1});
});

asyncTest("Send error details to a server", function(){
	expect(2);
	// We use mockjax for mocking asynchronous calls, see https://github.com/appendto/jquery-mockjax
	$.mockjax({
		url:"/reportErrorService",
		dataType:"html",
		response : function(settings){
			ok(true, "The server was effectively called");
			deepEqual(settings.data, {errorType : "errorTypeTest", message : "messageTest", stack : "stackTest"}, "The detailed data was correctly transmitted");
			start();
		}
	});
	
	$.mg.error.setDefaultContainer(prepareErrorDiv());
	$.mg.errorDisplay({reportUrl : "/reportErrorService", errorType : "errorTypeTest", message : "messageTest", stack : "stackTest"});
});
