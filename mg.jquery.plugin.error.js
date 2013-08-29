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
 * MGDIS Plugin jQuery - Error management
 * Author: Alban Mouton <mouton-a@mgdis.fr>
 * Validated upon jquery 1.9 and jquery-ui 1.9
 */

/* 
 * Plugin jquery for the management of Javascript errors in a page.
 * Uses UMD for compatibility with requirejs (https://github.com/umdjs/umd/blob/master/jqueryPlugin.js)
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'jquery-ui-widget'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    $.mg = $.mg || {};
	$.mg.error = $.mg.error || {};
	
	$.mg.error._handleUncaughtOptions = {};
	$.mg.error._handleAjaxOptions = {};
	
	/**
	 * Standard handler function for events of type window.onerror
	 * Best used through $.mg.error.handleUncaught() 
	 */
	$.mg.error._uncaughtErrorHandler = function(errorMsg, url, lineNumber) {
		
		var options = $.extend({},
				$.mg.error._handleUncaughtOptions,
				{errorArgs : {errorMsg : errorMsg, url : url, lineNumber : lineNumber}}
		);
		
		$(document).ready(function(){
			try{
				$.mg.errorDisplay(options);
			}catch(exception){
				// Only throws the exception, but the fact that it was caught in the first place removes
				// the risk of triggering a window.onerror event and entering an infinite loop.
				// this is due to the fact that a manually thrown error doesn't trigger the window.onerror event.
				throw exception;
			}
		});
	};
	
	/**
	 * Initialize the management of uncaught JS errors by defining a handler for the event window.onerror
	 * @param options Optional, use to send default options to the mg.displayError widget
	 */
	$.mg.error.handleUncaught = function(options) {
		if (options)
			$.mg.error._handleUncaughtOptions = options;
		window.onerror = $.mg.error._uncaughtErrorHandler;
	};
	
	/**
	 * Standard function for dealing with ajax errors.
	 * Best used through $.mg.error.handleAjax()
	 */
	$.mg.error._ajaxErrorHandler = function(event, xhr, settings, thrownError) {
		var options = $.extend({},
				$.mg.error._handleAjaxOptions,
				{ xhr : xhr, error : thrownError, stack : "URL = " + settings.url }
		);
		$(document).ready(function(){
			$.mg.errorDisplay(options);
		});
	};
	
	/**
	 * Initialize the management of errors in $.ajax by defining a handler for the global event ajaxError
	 * @param options Optional, use to send default options to the mg.displayError widget
	 */
	$.mg.error.handleAjax = function(options) {
		if (options)
			$.mg.error._handleAjaxOptions = options;
		$(document).ajaxError($.mg.error._ajaxErrorHandler);
	};
	
	/**
	 * Set the default url that will be used by future instances of the mg.errorDisplay widget to report errors to a server
	 */
	$.mg.error.setDefaultUrl = function(url) {
		$.mg.errorDisplay.prototype.options.reportUrl = url;
	};
	
	/**
	 * Set the default HTML element into which future instances of the mg.errorDisplay widget will write the errors
	 */
	$.mg.error.setDefaultContainer = function(container) {
		$.mg.errorDisplay.prototype.options.container = container;
	};

	/**
	 * Error display and management widget. Not applied to an HTML element in order to be independant of its execution context.
	 * 
	 * @param {Object} [options.labels] TODO translate to english
	 * @param {HTML element} [options.container] Element to display errors into. If absent the widget will use a dialog.
	 * @param {String} [options.reportUrl] URL of the service to which the widget will send reports of the errors (use $.mg.error.setDefaultUrl to define it once and for all)
	 * @param {Object} [options.errorArgs] Optional dictionary of arguments as sent by the event window.onerror. Used by the standard handler for uncaught errors.
	 * @param {Error} [options.error] Error instance, can be sent manually to this widget after catching it
	 * @param {XHR} [options.xhr] Request object of an Ajax call, used by the standard of the global jquery event ajaxError or specified manually
	 * @param {String} [options.errorType]
	 * @param {String} [options.message]
	 * @param {String} [options.stack]
	 * @param {String} [options.managedError] If defined the widget will simply show this message and skip the detail and the reporting
	 * @param {Object} [options.status2label] Used to show custom messages for Ajax errors with specified status codes
	 * @param {Object} [options.ignoredStatus] Used to ignore some Ajax errors based on their statuses
	 */
	$.widget("mg.errorDisplay",  
	{
		options: 
		{
		    labels:{
		        title: "Application error",
		        message: "An error occurred in the application. Please contact us and communicate the detail information below.\n Please forgive us for the inconvenience.",
    			detailButton: "Show detail",
    			detailTitle : "Error detail",
    			uncaughtErrorType : "Uncaught Javascript error",
    			caughtErrorType : "Caught Javascript error",
    			ajaxErrorType : "Ajax error",
    			detailTypeError : "Error type : ",
    			detailMessage : "Message : ",
    			detailStack : "Stack : ",
    			identificationError : "You have been disconnected. Please sign in again."
           },
           container : null,
           reportUrl : null,
           errorArgs : null,
           error : null,
           xhr : null,
           errorType : null,
           message : null,
           stack : null,
           managedError : null,
           status2label : {403 : "identificationError", 401 : "identificationError"},
           ignoredStatus : { 0 : "ignore" }
		},
		/**
		 * Initialize an instance of this widget. Called for each error, no shared instances in our case.
		 */
		_create : function() {
			var managedError = this._getManagedError();
			if (managedError === "ignore" ) {
				return;
			}
			if (managedError) {
				// managed error, simply display a message and skip detail and error reporting
				this._displayContent(this._getManagedContent(managedError));
			}
			else
				this._prepareStandardError();
		},
		/**
		 * Some errors aren't really exceptional, they should be displayed simply without stack trace or server reporting.
		 * 
		 * @return the custom message adapted to this error, undefined if this error is not explicitly managed.
		 */
		_getManagedError : function() {
			// For now the message is either explicitly passed in the parameter options.managedError
			// or deduced from the status code of an ajax error
			return this.options.managedError
					|| (this.options.xhr
						&& this.options.xhr.status + ""
						&& (this.options.ignoredStatus[this.options.xhr.status] ||
							(this.options.status2label[this.options.xhr.status]
								&& this.options.labels[this.options.status2label[this.options.xhr.status]])
						)
					);
		},
		/**
		 * Display the content for an error, either in a HTML element or in a dialog.
		 * Uses a very simple mechanism to prevent opening a dialog if one is already active.

		 * @return true if displayed, false if refused
		 */
		_displayContent : function(content) {
			// On affiche l'erreur, le détail n'est pas encore renseigné
			if (this.options.container) {
				this._displayInBox(content, this.options.container);
			} else {
				if (!$.mg.errorDisplay._openedDialog) {
					// On vérifie la présence d'un widget de dialog jquery-ui ou de modal bootstrap
					if(content.dialog) {
						this._displayInUIDialog(content);
					} else if(content.modal) {
						this._displayInBootstrapModal(content);
					} else {
						console.log('Neither a container or a dialog widget found for displaying errors.');
						console.log(content);
					}
				}
					
				else
					return false;
			}
			return true;
		},
		/**
		 * Process an error, display it, optionaly report it to a server and display its detail
		 */
		_prepareStandardError : function() {
			var that = this;
			if (!this._displayContent(this._getStandardContent())) {
				// If false the display has failed. No need to go on.
				return;
			}
			
			var detailData = this._processDetailsOptions();
			
			if (this.options.reportUrl) {
				// try to report the error to a server then either display the returned detail or a locally processed one
				this._reportError(this.options.reportUrl, detailData)
					.done(function(detailServer){that._displayDetail(detailServer);})
					.fail(function(){that._displayDetail(that._getDetail(detailData));});
			} else {
				this._displayDetail(this._getDetail(detailData));
			}
		},
		/**
		 * Prepare the content to display a simple managed error 
		 */
		_getManagedContent : function(managedError) {
			var content = $("<div class='mg-error-content ui-state-error ui-corner-all'>");
			$("<p class='mg-error-message'>")
				.text(managedError)
				.prepend("<div class='ui-icon ui-icon-alert' />")
				.appendTo(content);
			
			return content;
		},
		/**
		 * Prepare the content to display the full information of an error
		 * @returns
		 */
		_getStandardContent : function() {
			var that = this;
			var content = $("<div class='mg-error-content ui-state-error ui-corner-all'>");
			
			$("<p class='mg-error-message'>")
				.text(this.options.labels.message)
				.prepend("<div class='ui-icon ui-icon-alert' />")
				.appendTo(content);
			
			$("<a class='mg-error-detailButton'>")
				.text(this.options.labels.detailButton)
				.appendTo(content);
			
			// prepare an empty container for the detail, it will be filled later on
			this.detailContainer = $("<div class='mg-error-detail' style='display:none;'>")
				.appendTo(content);

			// toggle the detail of the error when clicking on the corresponding button
			content.find(".mg-error-detailButton").click(function() { that.detailContainer.toggle(); });
			
			return content;
		},
		/**
		 * Display an error in a HTML element
		 * @param content
		 */
		_displayInBox : function(content, box) {
			var that = this;
			
			$("<div class='mg-error ui-widget alert alert-error'/>")
				.append(content)
				.appendTo(box);			
		},
		/**
		 * Display an error without HTML element for container, use a jquery-ui dialog
		 * @param content
		 */
		_displayInUIDialog : function(content) {
			var that = this;
			
			// remember that a dialog was opened to prevent opening many dialogs
			$.mg.errorDisplay._openedDialog = true;

			var dialog = content.dialog({
				autoOpen : false,
				title: that.options.labels.title,
				modal: true,
				dialogClass : "mg-error ui-state-error",
				close : function(event, ui) {
					$.mg.errorDisplay._openedDialog = false;
				}
			});
			// a few modifications of style to make it a 'error' dialog
			dialog.parent().find(".ui-dialog-titlebar")
				.removeClass("ui-widget-header");
			dialog.dialog("open");
		},
		/**
		 * Display an error without HTML element for container, use a bootstrap modal
		 * @param content
		 */
		_displayInBootstrapModal : function(content) {
			var that = this;
			
			// remember that a dialog was opened to prevent opening many dialogs
			$.mg.errorDisplay._openedDialog = true;

			var modalDiv = $('<div class="modal hide fade">' +
  								'<div class="modal-header">' +
    								'<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
    								'<h3>' + that.options.labels.title + '</h3>' +
  								'</div>' +
  								'<div class="modal-body">' +
  								'</div>' +  								
  							'</div>');

			modalDiv.find('.modal-body').html(content);
			modalDiv.modal();
		},
		/**
		 * Use the various options of the widget to build as rich as possible contents for detail variables
		 *  
		 * @return {Object} Will contain the following keys :errorType, message and stack 
		 */
		_processDetailsOptions : function() {
			var detailData = {};
			// Process argument of a window.onerror event
			if (this.options.errorArgs) {
				detailData.errorType = this.options.labels.uncaughtErrorType;
				detailData.message = this.options.errorArgs.errorMsg;
				detailData.stack =  this.options.errorArgs.url + " - line " + this.options.errorArgs.lineNumber;
			}
			// Process a standard caught JS error
			if (this.options.error) {
				detailData.errorType = this.options.labels.caughtErrorType;
				detailData.message = this.options.error.message;
				detailData.stack = this.options.error.stack;
			}
			// Process data from an Ajax error
			if (this.options.xhr) {
				detailData.errorType = this.options.labels.ajaxErrorType;
				// in the case of an ajax error, message can be composed from options.error and options.xhr
				detailData.message = detailData.message ? detailData.message + " - " : "";
				detailData.message = detailData.message + this.options.xhr.status + " - " + this.options.xhr.statusText;
			}
			// Use manually passed arguments that can complete the already processed data
			detailData.message = (this.options.message || "") + (this.options.message && detailData.message ? "\n" : "") +(detailData.message || "");
			detailData.stack = (this.options.stack || "") + (this.options.stack && detailData.stack ? "\n" : "") +(detailData.stack || "");
			detailData.errorType = this.options.errorType || detailData.errorType;
			
			return detailData;
		},
		/**
		 * Asynchronously contact a server to report the current error.
		 */
		_reportError : function(reportUrl, detailData) {
			return $.ajax({
				type:"POST",
				// The return will be used to display the detail
				dataType: "html",
				cache:false,
				// global set to false in order not to trigger the ajaxError global event (risk of infinite loop)
				global:false,
				url: reportUrl,
				async: true,
				timeout : 2000,
				data: detailData
			});
		},
		/**
		 * Display the detail into the element previously prepared by _getStandardContent
		 */
		_displayDetail : function(detail) {
			// format a little bit by inserting <br> tags for line breaks
			if (this.detailContainer)
				this.detailContainer.html(detail.replace(new RegExp("\n", 'g'), "<br/>"));
		},
		/**
		 * Locally build an error detail to display from the data prepared by _processDetailsOptions
		 * 
		 * @param {Object} detailData must contain the following keys :errorType, message and stack
		 * @type string
		 */
		_getDetail : function(detailData) {
			var detail = this.options.labels.detailTypeError + detailData.errorType + "\n\n";
			detail += this.options.labels.detailMessage + detailData.message + "\n\n";
			detail += this.options.labels.detailStack + "\n" + detailData.stack;
			return detail;
		}
	});
	
	/**
	 * Remember that a dialog is opened. Used to prevent multiple error dialogs.
	 */
	$.mg.errorDisplay._openedDialog = false;
}));