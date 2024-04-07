import flask
from flask import Flask
import json

from database import *


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///courses.sqlite"


# Needed for CORS
@app.route("/account/login", methods=["OPTIONS"])
@app.route("/account/logout", methods=["OPTIONS"])
@app.route("/account/create", methods=["OPTIONS"])
@app.route("/account/courses", methods=["OPTIONS"])
@app.route("/courses", methods=["OPTIONS"])
@app.route("/account/courses/manage", methods=["OPTIONS"])
@app.route("/account/courses/grades", methods=["OPTIONS"])
def preflight():
    response = flask.make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response


# POST /account/login
#       returns name, role, and session token if successful, or empty response if incorrect login
#       input: {'username': 'placeholder', 'password': 'placeholder'}
#       response: {'fullname': 'placeholder', 'role': 'placeholder', 'sessionToken': 'placeholder'}
#       OR
#       response: 401, unauthenticated
@app.route("/account/login", methods=["POST"])
def login():
    body = flask.request.get_json()
    user = getUser(body["username"])
    if (
        user == None
        or user.username != body["username"]
        or user.password != body["password"]
    ):
        response = flask.make_response(flask.jsonify())
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 401)
    else:
        token = createTokenAndStore(body["username"])
        response = flask.make_response(
            {
                "username": user.username,
                "fullname": user.fullname,
                "role": user.role,
                "sessionToken": token,
            }
        )
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 200)


# DELETE /account/logout
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder'}
#     response: 204, no content
#     OR
#     response: 401, unauthenticated
@app.route("/account/logout", methods=["POST"])
def logout():
    body = flask.request.get_json()
    token = getToken(body["username"]).token
    if body["sessionToken"] == token:
        deleteToken(body["username"])
        response = flask.make_response(flask.jsonify())
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 204)
    else:
        response = flask.make_response(flask.jsonify())
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 401)


# POST /account/create
#     returns same as /account/login when successful, or empty response if username taken
#     input: {'username': 'placeholder', 'fullname': 'placeholder, 'password': 'placeholder', 'role': 'placeholder'}
#     response: {'fullname': 'placeholder', 'role': 'placeholder', 'sessionToken': 'placeholder'}
#     OR
#     response: 403, forbidden
@app.route("/account/create", methods=["POST"])
def create():
    body = flask.request.get_json()
    # TODO: validate role string
    user = addUser(body["username"], body["password"], body["fullname"], body["role"])
    if user != None:
        token = createTokenAndStore(body["username"])
        response = flask.make_response(
            {
                "username": user.username,
                "fullname": user.fullname,
                "role": user.role,
                "sessionToken": token,
            }
        )
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 200)

    else:
        response = flask.make_response(flask.jsonify())
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 401)

# POST /account/courses
#     returns list of courses and enrolled status
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder'}
#     response: {
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, 'enrolled': bool},
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, 'enrolled': bool},
#     ... etc ...
#     }
@app.route("/account/courses", methods=["POST"])
def getAllCourses():
    # TODO: authenticate user, maybe in separate function for reuse
    response = flask.make_response(
        json.loads(
            """
            [
                {"courseName": "cse100", "teacher": "teacher teach", "time": "all the time", "seatsTotal": 10, "seatsTaken": 1, "enrolled": true},
                {"courseName": "cse101", "teacher": "mcteach teacher", "time": "1am", "seatsTotal": 50, "seatsTaken": 49, "enrolled": true},
                {"courseName": "cse121", "teacher": "professor teacher", "time": "10am", "seatsTotal": 30, "seatsTaken": 20, "enrolled": false},
                {"courseName": "cse103", "teacher": "teacher professor", "time": "MTW", "seatsTotal": 100, "seatsTaken": 100, "enrolled": false}
            ]
            """
        )
    )
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# PUT /account/courses
#     returns the updated list of courses and enrolled status or empty response if full; used to add a course
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder', 'courseName': 'placeholder'}
#     response: {
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, "enrolled": true},
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, "enrolled": false},
#     ... etc ...
#     }
#     OR
#     response: No content
@app.route("/account/courses", methods=["PUT"])
def addUserCourse():
    # TODO: Implement
    return "a"


# DELETE account/courses
#     returns the updated list of all courses and enrolled status; used to remove a course
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder', 'courseName': 'placeholder'}
#     response: {
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, "enrolled": true},
#     {'courseName': 'placeholder', 'teacher': 'placeholder', 'time': 'placeholder', 'seatsTotal': x, 'seatsTaken': x, "enrolled": false},
#     ... etc ...
#     }
@app.route("/account/courses", methods=["DELETE"])
def removeUserCourse():
    # TODO: Implement
    return "a"


# POST /account/courses/grades
#     returns list of students and grades for a course
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder', 'courseName': 'placeholder'}
#     response: {
#     {'name': 'placeholder', 'grade', x},
#     {'name': 'placeholder', 'grade', x},
#     ... etc ...
#     }
@app.route("/account/courses/manage", methods=["POST"])
def getCourseGrades():
    # TODO: Implement
    return "a"


# PUT /account/courses/grades
#     returns updated list of students and grades for a course, used to modify grades
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder', 'courseName': 'placeholder', 'name': 'placeholder', 'grade': x}
#     response: {
#     {'name': 'placeholder', 'grade', x},
#     {'name': 'placeholder', 'grade', x},
#     ... etc ...
#     }
@app.route("/account/courses/grades", methods=["PUT"])
def changeCourseGrade():
    # TODO: Implement
    return "a"


if __name__ == "__main__":
    with app.app_context():
        db.init_app(app)
        db.create_all()

    app.run()
