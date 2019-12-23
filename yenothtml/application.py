import os
from bottle import static_file
import yenot.backend.api as api

app = api.get_global_app()

STATIC_ROOT = os.path.join(os.path.dirname(os.path.normpath(__file__)), 'static')

@app.get('/login.html', name='login_html', skip=['yenot-auth'])
def static():
    global STATIC_ROOT
    return static_file('login.html', root=STATIC_ROOT)

@app.route('/static/<path:path>', name='static', skip=['yenot-auth'])
def static(path):
    global STATIC_ROOT
    return static_file(path, root=STATIC_ROOT)
