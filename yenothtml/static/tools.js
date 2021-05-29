
// https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

function fallbackCopyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	textArea.value = text;
	textArea.style.position="fixed";  //avoid scrolling to bottom
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();

	try {
		var successful = document.execCommand('copy');
		var msg = successful ? 'successful' : 'unsuccessful';
		console.log('Fallback: Copying text command was ' + msg);
	} catch (err) {
		console.error('Fallback: Oops, unable to copy', err);
	}

	document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text);
		return;
	}

	navigator.clipboard.writeText(text).then(function() {
		console.log('Async: Copying to clipboard was successful!');
	}, function(err) {
		console.error('Async: Could not copy text: ', err);
	});
}

function myFunction() {
	var x = document.getElementById("the_tab_div");
	if (x.className === "tab_div") {
		x.className += " responsive";
	} else {
		x.className = "tab_div";
	}
}

function list_preview_resize_event() {
	// TODO:  make this a class to clean up the data dependencies
	// "global" -- active_preview

	var char_width = parseFloat($("html").css("font-size"));
	var w = $(window).width() / char_width;

	if( w < 40 ) {
		$("#search_back")
			.removeClass("search_back")
			.addClass("search_back_scoop");
	} else if( active_preview === null ) {
		$("#search_back")
			.removeClass("search_back_scoop")
			.addClass("search_back");
	}

	if( active_preview === null ) {
		$("#preview_detail")
			.removeClass("row_detail_narrow")
			.removeClass("row_detail_wide")
			.addClass("row_detail_suppressed");
	} else {
		if( w < 40 ) {
			$("#preview_detail")
				.removeClass("row_detail_wide")
				.removeClass("row_detail_suppressed")
				.addClass("row_detail_narrow");
		} else {
			$("#preview_detail")
				.removeClass("row_detail_narrow")
				.removeClass("row_detail_suppressed")
				.addClass("row_detail_wide");
		}
	}

	if( w < 40 ) {
		if ( active_preview !== null ) {
			$("#search_wrapper")
				.removeClass("search_results2_wide")
				.removeClass("search_results2_narrow")
				.addClass("search_results2_suppressed");
		} else {
			$("#search_wrapper")
				.removeClass("search_results2_wide")
				.removeClass("search_results2_suppressed")
				.addClass("search_results2_narrow");
		}
	} else {
		$("#search_wrapper")
			.removeClass("search_results2_narrow")
			.removeClass("search_results2_suppressed")
			.addClass("search_results2_wide");
	}
}


// roscoe client helpers
//

function roscoe_success() {
	alert("This will be reviewed back on the main computer.");
	$("#roscoe_reminder").val("");
}

function roscoe_error() {
	alert("There was an error posting this data for reminder.");
}

function roscoe_submit() {
	params = {reminder: $("#roscoe_reminder").val()}
	session.post("api/roscoe/reminder", null, params, roscoe_success, roscoe_error);
	return false;
}
