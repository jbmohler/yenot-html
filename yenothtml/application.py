import os
from bottle import static_file
import yenot.backend.api as api

app = api.get_global_app()

STATIC_ROOT = os.path.join(os.path.dirname(os.path.normpath(__file__)), 'static')

@app.get('/', name='root_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('root.html', root=STATIC_ROOT)

@app.get('/login.html', name='login_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('login.html', root=STATIC_ROOT)

@app.get('/loginpin.html', name='loginpin_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('loginpin.html', root=STATIC_ROOT)

@app.get('/lms-avatar.png', name='lms_avatar_png', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('lms-avatar.png', root=STATIC_ROOT)

@app.get('/contacts/<tail:path>', name='contacts_doc_html', skip=['yenot-auth'])
def static(tail):
    global STATIC_ROOT
    response = static_file('contacts.html', root=STATIC_ROOT)
    response.set_cookie('pathtail', tail)
    return response

@app.get('/contacts.html', name='contacts_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('contacts.html', root=STATIC_ROOT)

@app.get('/finances/<tail:path>', name='finances_doc_html', skip=['yenot-auth'])
def static(tail):
    global STATIC_ROOT
    response = static_file('finances.html', root=STATIC_ROOT)
    response.set_cookie('pathtail', tail)
    return response

@app.get('/finances.html', name='finances_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('finances.html', root=STATIC_ROOT)

@app.get('/reports.html', name='reports_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('reports.html', root=STATIC_ROOT)

@app.route('/static/<path:path>', name='static', skip=['yenot-auth'])
def static(path):
    global STATIC_ROOT
    return static_file(path, root=STATIC_ROOT)


@app.get("/lms/technical", name="get_lms_technical", skip=["yenot-auth"])
def get_lms_technical():
    return """\
<html>
<head>
</head>
<body>
The source code is at:

<ul>
<li><a href="https://github.com/jbmohler/yenot">https://github.com/jbmohler/yenot</a></li>
<li><a href="https://github.com/jbmohler/yenot-auth">https://github.com/jbmohler/yenot-auth</a></li>
<li><a href="https://github.com/jbmohler/yenot-lmshacc">https://github.com/jbmohler/yenot-lmshacc</a></li>
<li><a href="https://github.com/jbmohler/yenot-lmscontacts">https://github.com/jbmohler/yenot-lmscontacts</a></li>
<li><a href="https://github.com/jbmohler/yenot-lmsdatabits">https://github.com/jbmohler/yenot-lmsdatabits</a></li>
<li><a href="https://github.com/jbmohler/yenot-html">https://github.com/jbmohler/yenot-html</a></li>
</ul>
</body>
</html>
"""


@app.get("/lms/diagnostics", name="get_lms_diagnostics", skip=["yenot-auth"])
def get_lms_technical():
    return """\
<html>
<head>
</head>
<body>
<h2>Diagnostics</h2>

<p>The <a href="/api/ping">ping endpoint</a> is not authenticated and is useful for
establishing basic connectivity and latency checks.</p>
</body>
</html>
"""
