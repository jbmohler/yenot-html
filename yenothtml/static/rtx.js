// Rtx jquery client
//

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

function RtxResponse(rtext)
{
	eval('r='+rtext);
	this.payload = r;

	this.main_table = function()
	{
		cols = this.payload[1];
		rows = this.payload[2];
		return rtx_table_helper(cols, rows);
	}

	this.table = function(name)
	{
		t = this.payload[0][name];
		return rtx_table_helper(t[0], t[1]);
	}

	return this;
}

function RtxServer(baseurl)
{
	var _this = this;
	_this.baseurl = baseurl;
	_this.step2fa = false;
	if( _this.baseurl.slice(-1) != '/'){
		_this.baseurl = _this.baseurl + '/';
	}

	this.login = function(username, password, success, error)
	{
		function login_response(data, textStatus, jqXHR){
			if( jqXHR.status == 200 ){
				_this.sid = data.session;
				success();
			}else{
				alert(data.status);
			}
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session',
			data: {username: username, password: password},
			success: login_response})
	}

	this.login_pin = function(username, pin, success, error)
	{
		function login_response(data, textStatus, jqXHR){
			alert(data);
			if( jqXHR.status == 200 ){
				_this.sid = data.session;
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
				_this.sid = data.session;
				_this.step2fa = false;
				success();
			}else{
				alert(data.status);
			}
		}

		$.ajax({
			type: 'POST',
			url: this.baseurl+'api/session/promote-2fa',
			headers: {'X-Yenot-SessionID': this.sid},
			data: {pin2: pin},
			success: login_response})
	}

	this.logout = function()
	{
		$.ajax({
			type: 'PUT',
			url: this.baseurl+'api/session/logout',
			headers: {'X-Yenot-SessionID': this.sid}})
	}

	this.get = function(tail, params, rtx_success, rtx_error){

		var index = 0;
		var pstr = '';
		for( var key in params )
		{
			if(index == 0)
				pstr += '?';
			else
				pstr += '&';
			pstr += key+'='+params[key];
			index += 1;
		}

		xmlhttp.open('get', this.baseurl+tail+pstr, false);
		xmlhttp.setRequestHeader('X-Yenot-SessionID', this.sid);
		xmlhttp.send();
		if( xmlhttp.Status != 200 )
			rtx_exception_response(xmlhttp, 'GET', 'error reading data');
		return RtxResponse(xmlhttp.responseText).main_table();
	}

	this.put = function(tail, params)
	{
		var index = 0;
		var pstr = '';
		for( var key in params )
		{
			if(index == 0)
				pstr += '?';
			else
				pstr += '&';
			pstr += key+'='+params[key];
			index += 1;
		}

		xmlhttp.open('put', this.baseurl+tail+pstr, false);
		xmlhttp.setRequestHeader('X-Yenot-SessionID', this.sid);
		xmlhttp.send()
		if( xmlhttp.Status > 211 ) // accomodate login session call
			rtx_exception_response(xmlhttp, 'PUT', 'error saving data');
		return
	}

	this.post = function(tail, params)
	{
		var index = 0;
		var pstr = '';
		for( var key in params )
		{
			if(index == 0)
				pstr += '?';
			else
				pstr += '&';
			pstr += key+'='+params[key];
			index += 1;
		}

		xmlhttp.open('post', this.baseurl+tail+pstr, false);
		xmlhttp.setRequestHeader('X-Yenot-SessionID', this.sid);
		xmlhttp.send()
		if( xmlhttp.Status > 211 ) // accomodate login session call
			rtx_exception_response(xmlhttp, 'POST', 'error saving data');
		return RtxResponse(xmlhttp.responseText)
	}

	return this;
}
