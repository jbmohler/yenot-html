// Rtx jquery client
//

function titleCase(str) {
	return str.toLowerCase().split(' ').map(function(word) {
		return word.replace(word[0], word[0].toUpperCase());
	}).join(' ');
}

function rtx_column_label(prelt)
{
	if( prelt[1].label !== undefined )
		return prelt[1].label;
	else
		return titleCase(prelt[0].replaceAll('_', ' '));
}

function jsGrid_columns(columns)
{
	function listconcat(value, item){
		return value.join('; ');
	}
	var currency_format = new Intl.NumberFormat("en-US", {minimumFractionDigits: 2});
	function format_currency(value, item){
		return currency_format.format(value);
	}
	function gtype(cc)
	{
		if( cc[1] !== null && cc[1].type !== undefined )
		{
			var tt = cc[1].type;
			if( tt == "boolean" )
				return {"type": "checkbox"};
			if( tt == "integer" )
				return {"type": "number"};
			if( tt == "currency_usd" )
				return {"type": "number", itemTemplate: format_currency};
			if( tt == "stringlist" )
				return {"type": "text", itemTemplate: listconcat}
		}
		return {"type": "text"}
	}

	var grcol = columns.filter(function (cc){
		if( cc[1] === null ){
			return true;
		} else if( cc[1].hidden !== undefined && cc[1].hidden ) {
			return false;
		} else if( cc[1].type !== undefined && cc[1].type.endsWith('.surrogate') ) {
			return false;
		}
		return true;
	}).map(function (cc){
		var gt = gtype(cc);
		return {
			name: cc[0],
			title: rtx_column_label(cc),
			type: gt.type,
			itemTemplate: gt.itemTemplate
		};
	});
	return grcol;
}

function rtx_table_helper(cols, rows)
{
	var colcount = cols.length;
	var colnames = []
	for(var i=0; i<colcount; ++i)
	{
		colnames.push(cols[i][0]);
	}
	var results = []
	for(var j=0; j<rows.length; ++j)
	{
		var obj = {}
		for(var i=0; i<colcount; ++i)
		{
			obj[colnames[i]] = rows[j][i];
		}
		results.push(obj);
	}
	return results;
}

function rtx_exception_response(xmlhttp, method, default_text)
{
	var rtext = xmlhttp.responseText;
	if( rtext.slice(0, 1) == '[' )
	{
		eval('r='+rtext);
		throw new Error(xmlhttp.Status, r[0]['error-msg']);
	}
	throw new Error(xmlhttp.Status, 'Status ' + xmlhttp.Status + ' on method ' + method + '.\n' + default_text);
}

function RtxResponse(content)
{
	this.payload = content;

	this.main_table = function()
	{
		return this.table(this.payload['__main_table__']);
	}

	this.table = function(name)
	{
		t = this.payload[name];
		return rtx_table_helper(t[0], t[1]);
	}

	this.main_table_columns = function()
	{
		return this.table_columns(this.payload['__main_table__']);
	}

	this.table_columns = function(name)
	{
		t = this.payload[name];
		return t[0];
	}

	this.keys = function()
	{
		return this.payload;
	}

	return this;
}

function rtx_session_no_auth(initialized)
{
	var root = $.cookie("rtx_prefix");
	if( root === undefined )
		window.location = "/login.html";

	var session = RtxServer(root);

	var dt = localStorage.rtx_devtoken;
	var access_token = sessionStorage.rtx_access_token;
	if( dt !== undefined) {
		session.login_saved(initialized, initialized);
	}
	
	initialized();

	return session;
}

function rtx_session_from_token(success, failure)
{
	var root = $.cookie("rtx_prefix");
	if( root === undefined )
		window.location = "/login.html";

	var session = RtxServer(root);

	var dt = localStorage.rtx_devtoken;
	var access_token = sessionStorage.rtx_access_token;
	if( dt !== undefined) {
		session.login_saved(success, failure);
	} else if ( access_token !== undefined ) {
		session.access_token = sessionStorage.rtx_access_token;
		// should verify the session id is still valid??
		success(session);
	}
	else {
		window.location = "/login.html";
	}

	return session;
}

function rtx_init_profile_menu() {
	function show_user_profile() {
		window.location = "/lms/user-profile";
		//return false;
	}
	$("#rtx_user_profile").click(show_user_profile);
	$("#rtx_user_profile").text("User Profile ("+sessionStorage.rtx_username+")");

	function show_lms_technical() {
		window.location = "/lms/technical";
		//return false;
	}
	$("#rtx_source").click(show_lms_technical);

	function show_lms_diagnostics() {
		window.location = "/lms/diagnostics";
		//return false;
	}
	$("#rtx_diagnostics").click(show_lms_diagnostics);

	function user_logout() {
		var username = sessionStorage.rtx_username;
		console.log("logout " + username);
		session.logout();
		return false;
	}
	$("#rtx_logout").click(user_logout);
}

function RtxServer(baseurl)
{
	var _this = this;
	_this.baseurl = baseurl;
	_this.step2fa = false;
	if( _this.baseurl.slice(-1) != '/'){
		_this.baseurl = _this.baseurl + '/';
	}

	this.login = function(username, password, success, failure)
	{
		function login_response(data, textStatus, jqXHR){
			sessionStorage.rtx_access_token = data.access_token;
			sessionStorage.rtx_userid = data.userid;
			sessionStorage.rtx_username = data.username;

			var flags = { path: '/', samesite: "strict" };
			$.cookie("rtx_prefix", _this.baseurl, flags);

			_this.access_token = data.access_token;
			_this.rtx_userid = data.userid;
			_this.rtx_username = data.username;

			success();
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session',
			data: {username: username, password: password},
			success: login_response,
			error: failure
		})
	}

	this.login_saved = function(success, failure) {
		var dt = localStorage.rtx_devtoken;
		var username = localStorage.rtx_username;
		if( dt === undefined )
			failure();

		function login_response(data, textStatus, jqXHR){
			_this.access_token = data.access_token;
			_this.rtx_userid = data.userid;
			_this.rtx_username = data.username;

			var flags = { path: '/', samesite: "strict" };
			$.cookie("rtx_prefix", _this.baseurl, flags);

			success(_this);
		}

		function my_error(data, textStatus, jqXHR){
			failure();
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session',
			data: {username: username, device_token: localStorage.rtx_devtoken},
			success: login_response,
			error: my_error
		});
	}

	this.login_pin = function(username, pin, success, error)
	{
		function login_response(data, textStatus, jqXHR){
			alert(data);
			if( jqXHR.status == 200 ){
				_this.access_token = data.access_token;
				_this.step2fa = true;
				success();
			}else{
				alert(data.status);
			}
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session-by-pin',
			data: {username: username, pin: pin},
			success: login_response})
	}

	this.promote_2fa = function(pin, success, error)
	{
		function login_response(data, textStatus, jqXHR){
			if( jqXHR.status == 200 ){
				_this.access_token = data.access_token;
				_this.step2fa = false;
				success();
			}else{
				alert(data.status);
			}
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session/promote-2fa',
			headers: {'Authorization': 'Bearer ' + this.access_token},
			data: {pin2: pin},
			success: login_response
		})
	}

	this.logout = function()
	{
		// also nix the device-token if here
		var dt = localStorage.rtx_devtoken;
		if( dt !== undefined ) {
			this.delete("api/user/" + this.rtx_userid + "/device-token/" + dt);
			localStorage.removeItem("rtx_devtoken");
			localStorage.removeItem("rtx_username");
		}

		function logout_response(data, textStatus, jqXHR){
			if( jqXHR.status == 200 ){
				console.log("logged out");

				sessionStorage.removeItem("rtx_username");
				sessionStorage.removeItem("rtx_userid");
				sessionStorage.removeItem("rtx_access_token");

				_this.access_token = null;

				window.location = "/login.html";
			}else{
				alert(data.status);
			}
		}

		$.ajax({
			type: 'PUT',
			url: this.baseurl+'api/session/logout',
			headers: {'Authorization': 'Bearer ' + this.access_token},
			success: logout_response
		})
	}

	this.auth_headers = function() {
		return {
			'Authorization': 'Bearer ' + this.access_token,
			'X-Yenot-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
		}
	}

	this.save_device_token = function(success) {
		this.post("api/user/" + this.rtx_userid + "/device-token/new",
			null,
			{"device_name": navigator.userAgent},
			function(rtx_data) {
				var devtoken = rtx_data.main_table()[0].token;
				localStorage.rtx_username = _this.rtx_username;
				localStorage.rtx_devtoken = devtoken;

				success();
			}
		)
	}

	this.get = function(tail, params, rtx_success, rtx_error){

		function get_result(data, textStatus, jqXHR){
			rtx_success(RtxResponse(data));
		}

		function get_error(data, textStatus, jqXHR){
			rtx_error(RtxResponse(data));
		}

		//console.log("*** "+tail+" ***");
		//console.log(JSON.stringify(params, null, 4));

		$.ajax({
			type: 'GET',
			url: this.baseurl+tail,
			data: params,
			headers: this.auth_headers(),
			success: get_result,
			error: get_error
		})
	}

	this.put = function(tail, params, data, rtx_success, rtx_error)
	{
		function get_result(data, textStatus, jqXHR){
			rtx_success(RtxResponse(data));
		}

		function get_error(data, textStatus, jqXHR){
			rtx_error(RtxResponse(data));
		}

		$.ajax({
			type: 'PUT',
			url: this.baseurl+tail,
			headers: this.auth_headers(),
			data: data,
			success: get_result,
			error: get_error
		})
	}

	this.post = function(tail, params, data, rtx_success, rtx_error)
	{
		function get_result(data, textStatus, jqXHR){
			rtx_success(RtxResponse(data));
		}

		function get_error(data, textStatus, jqXHR){
			rtx_error(RtxResponse(data));
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+tail,
			headers: this.auth_headers(),
			data: data,
			success: get_result,
			error: get_error
		})
	}

	this.delete = function(tail, params, data, rtx_success, rtx_error)
	{
		function get_result(data, textStatus, jqXHR){
			rtx_success(RtxResponse(data));
		}

		function get_error(data, textStatus, jqXHR){
			rtx_error(RtxResponse(data));
		}

		$.ajax({
			type: 'DELETE',
			url: this.baseurl+tail,
			headers: this.auth_headers(),
			data: data,
			success: get_result,
			error: get_error
		})
	}

	return this;
}
