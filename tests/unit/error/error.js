
function prepareErrorDiv(){
	return $("<div></div>").appendTo($("#qunit-fixture"));
}

function closeRemoveDialogs(){
	$("a.ui-dialog-titlebar-close").click();
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
