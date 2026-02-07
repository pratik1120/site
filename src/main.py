import requests
import mimetypes
import traceback
from .modules import utils
from datetime import datetime
from urllib.parse import unquote, quote
from flask import Flask, render_template, redirect, request, flash, url_for, session, Response, abort, jsonify

app = Flask(__name__)
app.config.from_pyfile("config.py")


# ---------------- HELPERS ---------------- #

def find_item(data, title):
    """
    Find by title first, fallback to filename (legacy)
    """
    for item in data:
        if item.get("title") == title or item["name"] == title:
            return item
    return None


# ---------------- ROUTES ---------------- #

@app.route("/")
def index():
    uploads = utils.get_data()
    uploads.sort(key=lambda x: (-x.get("pin", 0), -x["display_datetime"][1]))

    return render_template(
        "index.html",
        uploads=uploads,
        user=app.config['DISPLAY_NAME']
    )


@app.route("/new", methods=["GET", "POST"])
@utils.login_required
def new():
    if request.method == "POST":
        file = request.files.get("file")
        title = request.form.get("title", "").strip()
        desc = request.form.get("description", "")
        date_str = request.form.get("date")

        if not title:
            flash("Title required", "error")
            return redirect(request.url)

        if not file:
            flash("No file uploaded", "error")
            return redirect(request.url)

        if date_str:
            display_ts = int(datetime.strptime(date_str, "%Y-%m-%dT%H:%M").timestamp())
        else:
            display_ts = int(datetime.now().timestamp())

        display_str = datetime.fromtimestamp(display_ts).strftime("%Y-%m-%d(%a)%H:%M")

        try:
            result = utils.upload_image(file)

            entry = {
                "title": title,
                "name": result["name"],
                "path": result["path"],
                "url": result["url"],
                "display_datetime": [display_str, display_ts],
                "uploaded_at": result["timestamp"],
                "description": desc,
                "pin": 0
            }

            data = utils.get_data()
            data.append(entry)
            utils.save_data(data)

            flash("Uploaded!", "success")
            return redirect(url_for("new"))

        except Exception as e:
            flash(f"Upload failed: {e}", "error")
            return redirect(request.url)

    return render_template("new.html", today=datetime.now().strftime("%Y-%m-%dT%H:%M"))


# -------- EDIT (BY TITLE) -------- #

@app.route("/edit/<title>", methods=["POST"])
@utils.login_required
def edit(title):
    title = unquote(title)
    new_desc = request.form.get("description", "").strip()
    display_dt_str = request.form.get("display_datetime", "").strip()

    if not new_desc:
        return jsonify({"success": False, "error": "Description cannot be empty"}), 400

    data = utils.get_data()
    item = find_item(data, title)

    if not item:
        return jsonify({"success": False, "error": "Post not found"}), 404

    if display_dt_str:
        dt = datetime.strptime(display_dt_str, "%Y-%m-%dT%H:%M")
        item["display_datetime"] = [
            dt.strftime("%Y-%m-%d(%a)%H:%M"),
            int(dt.timestamp())
        ]

    item["description"] = new_desc
    utils.save_data(data)

    return jsonify({
        "success": True,
        "description": new_desc,
        "display_datetime": item["display_datetime"][0]
    })


# -------- DELETE (BY TITLE) -------- #

@app.route("/delete/<title>", methods=["POST"])
@utils.login_required
def delete(title):
    title = unquote(title)
    data = utils.get_data()
    item = find_item(data, title)

    if not item:
        return jsonify({"success": False}), 404

    utils.delete_post(item["name"])
    flash(f"Deleted {item.get('title')}", "success")
    return jsonify({"success": True})


# -------- PIN (BY TITLE) -------- #

@app.route("/pin/<title>", methods=["POST"])
@utils.login_required
def pin(title):
    title = unquote(title)
    data = utils.get_data()
    item = find_item(data, title)

    if not item:
        return jsonify({"success": False}), 404

    item["pin"] = 0 if item.get("pin", 0) else 1
    utils.save_data(data)

    return jsonify({"success": True, "pin": item["pin"]})


# -------- IMAGE PROXY -------- #

@app.route("/images/<image>")
def proxy_image(image):
    # headers = {
    #     "Authorization": f"token {app.config['GITHUB_TOKEN']}",
    #     "Accept": "application/vnd.github.v3.raw"
    # }

    # url = app.config['GITHUB_API_URL'].format(
    #     owner=app.config['GITHUB_USERNAME'],
    #     repo=app.config['GITHUB_REPO'],
    #     path=image_path,
    #     branch=app.config['GITHUB_REPO_BRANCH']
    # )
    
    url = f"https://raw.githubusercontent.com/{app.config['GITHUB_USERNAME']}/{app.config['GITHUB_REPO']}/{app.config['GITHUB_REPO_BRANCH']}/uploads/{image}"
    return url
    # return requests.get(url, headers={})

    # r = requests.get(url, headers=headers)

    # if r.status_code != 200:
    #     abort(r.status_code)

    # content_type, _ = mimetypes.guess_type(image_path)
    # return Response(r.content, content_type or "image/png")


# -------- POST PAGE (TITLE BASED) -------- #

@app.route("/post/<title>")
def post(title):
    title = unquote(title)
    data = utils.get_data()
    item = find_item(data, title)

    if not item:
        abort(404)

    return render_template(
        "post.html",
        item=item,
        user=app.config['DISPLAY_NAME']
    )


# -------- AUTH / STATIC -------- #

@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/login", methods=["GET", "POST"])
def login():
    if session.get("logged_in"):
        return redirect(url_for("index"))

    if request.method == "POST":
        if request.form["username"] == app.config["USERNAME"] and request.form["password"] == app.config["PASSWORD"]:
            session["logged_in"] = True
            flash("Logged in", "success")
            return redirect(url_for("index"))
        else:
            flash("Invalid login", "error")

    return render_template("login.html")


@app.route("/logout")
@utils.login_required
def logout():
    session.clear()
    flash("Logged out")
    return redirect(url_for("index"))


# -------- ERRORS -------- #

@app.errorhandler(404)
def notfound(e):
    return render_template("404.html")


@app.errorhandler(500)
def servererror(e):
    msg = traceback.format_exc() if app.debug else "Internal server error"
    return render_template("500.html", message=msg)
