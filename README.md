mg.jquery.plugin.error
======================

A jquery-ui widget to help you manage Javascript errors in your users' browsers.

Main functionalities are:
* Automatic handling of all uncaught exceptions
* Automatic handling of all jquery.ajax errors
* Configurable div of dialog display to the users
* Reporting of the errors to a server
* Customizable management of HTTP error codes

The widget in action
--------------------

* [Visual tests](http://mgdis.github.io/mg.jquery.plugin.error/tests/visual/error/error.html)
* [Unit tests](http://mgdis.github.io/mg.jquery.plugin.error/tests/unit/error/error.html)
 
If you find a bug while clicking on one of the links above, please submit an issue.

Global handlers
---------------

The easiest way to use this module is through automatic handling of global exceptions.

The first handler `handleUncaught` registers a callback function for the standard global event `window.onerror`
that is triggered whenever a Javascript code gets an error outside of a try block. To use it:

    $.mg.error.handleUncaught();
  
Or:

    $.mg.error.handleUncaught(options);

The second handler `handleAjax` registers a callback function for the global jQuery event `ajaxError` that is triggered
whenever a call to `$.ajax` fails. To use it:

    $.mg.error.handleAjax();
  
Or:

    $.mg.error.handleAjax(options);

Basic manual usage
------------------

Global handlers are the preferred way of using this module, but you can also use it manually by explicitly instantiating the
errorDisplay widget. For example you might want to catch an exception but replace the technical details by a custom message:

    try{
        // do something
    } catch (error) {
        $.mg.errorDisplay({ managedError : 'This exception may occured when, blah blah blah.' });
    }

Error reporting
---------------

This module is only client side, to enable the reporting of the errors to a server you will have to write
the server side code by yourself. To enable the reporting you just need to specify the option reportUrl.
The module will then attempt to send POST ajax requests with the following parameter keys: errorType, message, stack.

Managed errors and ajax failures
--------------------------------

Not all error are truly exceptional. Some are expected, it is then possible to customize the displayed message as illustrated
by the example in the section 'Basic manual usage'.

Ajax failures aren't all equals. A status code of 403 is a failure for the user but not for the program, while a
500 is probably a real bug.

To ignore totally some status codes you can use the option ignoredStatus. Byt default it is set as `{ 0 : 'ignore'}`,
you might want to change its value to `{ 0 : 'ignore', '401' : 'ignore'}`.

To display a custom message on a specific status code you can use the status2label and labels options. By default these are set
as:

    options : {
        labels:{
 			        ...
				        identificationError : 'You have been disconnected. Please sign in again.'
			     },
        status2label : {403 : 'identificationError', 401 : 'identificationError'}
    }

Options overview
----------------

TODO

