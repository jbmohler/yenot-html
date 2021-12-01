import os
import yenot.backend.api as api

app = api.get_global_app()

STATIC_ROOT = os.path.join(os.path.dirname(os.path.normpath(__file__)), "static")


@app.get("/", name="root_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    response = api.static_file("root.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/login.html", name="login_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    response = api.static_file("login.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/loginpin.html", name="loginpin_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    return api.static_file("loginpin.html", root=STATIC_ROOT)


@app.get("/lms-avatar.png", name="lms_avatar_png", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    return api.static_file("lms-avatar.png", root=STATIC_ROOT)


@app.get("/contacts/<tail:path>", name="contacts_doc_html", skip=["yenot-auth"])
def static(request, tail):
    global STATIC_ROOT
    response = api.static_file("contacts.html", root=STATIC_ROOT)
    response.set_cookie("pathtail", tail)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/contacts.html", name="contacts_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    response = api.static_file("contacts.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/finances/<tail:path>", name="finances_doc_html", skip=["yenot-auth"])
def static(request, tail):
    global STATIC_ROOT
    response = api.static_file("finances.html", root=STATIC_ROOT)
    response.set_cookie("pathtail", tail)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/finances.html", name="finances_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    response = api.static_file("finances.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/reports.html", name="reports_html", skip=["yenot-auth"])
def static(request):
    global STATIC_ROOT
    response = api.static_file("reports.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.route("/static/<path:path>", name="static", skip=["yenot-auth"])
def static(request, path):
    global STATIC_ROOT
    return api.static_file(path, root=STATIC_ROOT)


@app.get("/lms/user-profile", name="get_lms_user_profile", skip=["yenot-auth"])
def get_lms_user_profile(request):
    global STATIC_ROOT
    response = api.static_file("profile.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/lms/technical", name="get_lms_technical", skip=["yenot-auth"])
def get_lms_technical(request):
    global STATIC_ROOT
    response = api.static_file("technical.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response


@app.get("/lms/diagnostics", name="get_lms_diagnostics", skip=["yenot-auth"])
def get_lms_diagnostics(request):
    global STATIC_ROOT
    response = api.static_file("diagnostics.html", root=STATIC_ROOT)
    response.set_cookie("rtx_prefix", request.environ["YENOT_BASE_URL"])
    return response
