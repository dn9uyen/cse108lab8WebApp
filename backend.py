import flask
from flask import Flask
from flask_admin import Admin
import json
from database import *


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///courses.sqlite"
app.config['SECRET_KEY'] = 'password'

admin = Admin(app, template_mode='bootstrap3')
admin.add_view(UserAdminView(User, db.session))

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

def authenticateUser(username, sessionToken):
    token = getToken(username).token
    return sessionToken == token

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
    body = flask.request.get_json()
    username = body["username"]
    sessionToken = body["sessionToken"]


    if not authenticateUser(username, sessionToken):
        response = flask.make_response(flask.jsonify())
        response.headers.add("Access-Control-Allow-Origin", "*")
        return (response, 401)

    # Retrieve all courses from the database
    courses = Course.query.all()

    # load courses into correct format for return response
    courses_json = []
    for course in courses:
        enrolled = UserCourse.query.filter_by(username=username, courseName=course.courseName, enrolled=True).first() is not None
        course_dict = {
            "courseName": course.courseName,
            "teacher": course.teacher,
            "time": course.time,
            "seatsTotal": course.seatsTotal,
            "seatsTaken": course.seatsTaken,
            "enrolled": enrolled
        }
        courses_json.append(course_dict)

    # Return the list of courses as JSON
    response = flask.make_response(json.dumps(courses_json))
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
    body = flask.request.get_json()
    username = body["username"]
    sessionToken = body["sessionToken"]
    courseName = body["courseName"]

    if not authenticateUser(username, sessionToken):
        response = flask.make_response("Unauthorized", 401)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    course = Course.query.filter_by(courseName=courseName).first()
    if course is None or course.seatsTaken >= course.seatsTotal:
        response = flask.make_response("Course not available", 400)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    # check might be redundant
    if UserCourse.query.filter_by(username=username, courseName=courseName, enrolled=True).first():
        response = flask.make_response("User already enrolled.", 400)
        response. headers.add("Access-control-Allow-Origin", "*")
        return response

    # enroll user
    addUser = UserCourse(username=username, courseName=courseName, enrolled=True, grade="0")
    course.seatsTaken = int(course.seatsTaken) + 1
    db.session.add(addUser)
    db.session.commit()

    # this can be moved to a func as its reused x2
    updatedCourses = Course.query.all()
    courses = [{
        "courseName": course.courseName,
        "teacher": course.teacher,
        "time": course.time,
        "seatsTotal": course.seatsTotal,
        "seatsTaken": course.seatsTaken,
        "enrolled": any(updated.enrolled for updated in UserCourse.query.filter_by(username=username, courseName=course.courseName)
                        )
    } for course in updatedCourses]


    response = flask.make_response(json.dumps(courses))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


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
    body = flask.request.get_json()
    username = body["username"]
    sessionToken = body["sessionToken"]
    courseName = body["courseName"]

    if not authenticateUser(username, sessionToken):
        response = flask.make_response("Unauthorized", 401)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    removeUser = UserCourse.query.filter_by(username=username, courseName=courseName, enrolled=True).first()
    if removeUser is None:
        response = flask.make_response("User is not enrolled in this course")
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    # need to finish
    course = Course.query.filter_by(courseName=courseName).first()
    course.seatsTaken = int(course.seatsTaken) - 1
    db.session.delete(removeUser)
    db.session.commit()


    updatedCourses = Course.query.all()
    courses = [{
        "courseName": course.courseName,
        "teacher": course.teacher,
        "time": course.time,
        "seatsTotal": course.seatsTotal,
        "seatsTaken": course.seatsTaken,
        "enrolled": any(updated.enrolled for updated in UserCourse.query.filter_by(username=username, courseName=course.courseName)
                        )
    } for course in updatedCourses]

    response = flask.make_response(json.dumps(courses))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


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
    body = flask.request.get_json()
    username = body["username"]
    sessionToken = body["sessionToken"]
    courseName = body["courseName"]

    if not authenticateUser(username, sessionToken):
        print("unauthorized")
        return flask.make_response("Unauthorized", 401)

    userCourses = UserCourse.query.filter_by(courseName=courseName, enrolled=True).all()

    grades = []
    for userCourse in userCourses:
        student = getUser(userCourse.username)
        grades.append({
            'name': student.fullname,
            'grade': userCourse.grade
        })

    response = flask.make_response(json.dumps(grades))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# PUT /account/courses/grades
#     returns updated list of students and grades for a course, used to modify grades
#     input: {'username': 'placeholder', 'sessionToken': 'placeholder', 'courseName': 'placeholder', 'name': 'placeholder', 'grade': x}
#     response: {
#     {'name': 'placeholder', 'grade', x},
#     {'name': 'placeholder', 'grade', x},
#     ... etc ...
#     }
@app.route("/account/courses/grades", methods=["PUT"])
def change_course_grade():
    body = flask.request.get_json()
    admin_username = body["username"]
    session_token = body["sessionToken"]
    course_name = body["courseName"]
    student_fullname = body["name"]
    new_grade = body["grade"]

    if not authenticateUser(admin_username, session_token):
        return flask.make_response("Unauthorized", 401)

    student_user = User.query.filter_by(fullname=student_fullname).first()
    if student_user:
        student_username = student_user.username
    else:
        return flask.make_response("Student Not Found", 404)

    user_course = UserCourse.query.filter_by(courseName=course_name, username=student_username).first()
    if user_course:
        user_course.grade = new_grade
        db.session.commit()
    else:
        return flask.make_response("User Course Not Found", 404)

    updated_grades = UserCourse.query.filter_by(courseName=course_name).all()
    grades_json = [
        {"name": getUser(uc.username).fullname, "grade": uc.grade}
        for uc in updated_grades
    ]

    response = flask.make_response(json.dumps(grades_json))
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


if __name__ == "__main__":
    with app.app_context():
        db.init_app(app)
        db.create_all()

    app.run()