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
		return titleCase(prelt[0].replace('_', ' '));
}

function jsGrid_columns(columns)
{
	function listconcat(value, item){
		return value.join('; ');
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
				var date = new Date();
				// hold the auth for 7 days
				date.setTime(date.getTime() + 7*24*60*60*1000);
				var flags = {
					path: '/',
					expires: 7
				};
				$.cookie("rtx_prefix", _this.baseurl, flags);
				$.cookie("rtx_sid", data.session, flags);
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
			headers: {'X-Yenot-SessionID': this.sid},
			success: get_result,
			error: get_error})
		//if( xmlhttp.Status != 200 )
		//	rtx_exception_response(xmlhttp, 'GET', 'error reading data');
		//rtx_success(RtxResponse(xmlhttp.responseText));
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
		return RtxResponse(xmlhttp.responseText);
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
