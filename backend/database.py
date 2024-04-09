from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, String
from secrets import token_hex

from sqlalchemy import Boolean
from sqlalchemy import Integer


db = SQLAlchemy()

""" Tables
    course table: 
    | course name | teacher full name | time | seatsTotal | seatsTaken |

    user course table, users have multiple entries for each different course:
    | username | course name | enrolled |

    user account table:
    | username | password | full name | role |

    token table:
    | username | token |
"""


class User(db.Model):
    __tablename__ = "users"
    username = Column(String, unique=True, nullable=False, primary_key=True)
    password = Column(
        String, nullable=False
    )  # shouldn't store plain text, but whatever
    fullname = Column(String, nullable=False)
    role = Column(String, nullable=False)

    def __init__(self, username, password, fullname, role):
        self.username = username
        self.password = password
        self.fullname = fullname
        self.role = role


class UserCourse(db.Model):
    __tablename__ = "userCourses"
    username = Column(String, nullable=False, primary_key=True)
    courseName = Column(String, nullable=False, primary_key=True)
    enrolled = Column(Boolean, nullable=False)
    grade = Column(String, nullable=False)

    def __init__(self, username, courseName, enrolled, grade):
        self.username = username
        self.courseName = courseName
        self.enrolled = enrolled
        self.grade = grade


class Course(db.Model):
    __tablename__ = "courses"
    courseName = Column(String, unique=True, nullable=False, primary_key=True)
    teacher = Column(String, nullable=False)
    time = Column(String, nullable=False)
    seatsTotal = Column(Integer, nullable=False)
    seatsTaken = Column(Integer, nullable=False)

    def __init__(self, courseName, teacher, time, seatsTotal, seatsTaken):
        self.courseName = courseName
        self.teacher = teacher
        self.time = time
        self.seatsTotal = seatsTotal
        self.seatsTaken = seatsTaken


class Token(db.Model):
    __tablename__ = "tokens"
    username = Column(String, unique=True, nullable=False, primary_key=True)
    token = Column(String, unique=True, nullable=False)

    def __init__(self, username, token):
        self.username = username
        self.token = token


# populate fixed course table: hardcoded for now
def populateCourseTable():
    courses = [
        {"courseName": "CSE100", "teacher": "teacher teach", "time": "all the time", "seatsTotal": 10, "seatsTaken": 1},
        {"courseName": "CSE120", "teacher": "mcteach teacher", "time": "1am", "seatsTotal": 50, "seatsTaken": 49},
        {"courseName": "CSE165", "teacher": "professor teacher", "time": "10am", "seatsTotal": 30, "seatsTaken": 20},
        {"courseName": "CSE180", "teacher": "teacher professor", "time": "MTW", "seatsTotal": 100, "seatsTaken": 100}
    ]
    for course in courses:
        courseInfo = Course(
            courseName=course["courseName"],
            teacher=course["teacher"],
            time=course["time"],
            seatsTotal=course["seatsTotal"],
            seatsTaken=course["seatsTaken"]
        )
        db.session.add(courseInfo)

    db.session.commit()


def clearCourses(): # used this to delete some courses added by mistake
    Course.query.delete()
    db.session.commit()

# Add new user, returns None if duplicate username
def addUser(username, password, fullname, role):
    newUser = User(username, password, fullname, role)
    try:
        db.session.add(newUser)
        db.session.commit()
        return newUser
    except:
        db.session.rollback()
        return None


def getUser(username):
    return db.session.get_one(User, username)


# Create new token and store it. Returns existing token if token for user already exists
def createTokenAndStore(username):
    try:
        newToken = Token(username, token_hex())
        db.session.add(newToken)
        db.session.commit()
        return newToken.token
    except:
        db.session.rollback()
        return Token.query.filter_by(username=username).first()


# Returns user token if exists, otherwise None
def getToken(username):
    return db.session.get_one(Token, username)


def deleteToken(username):
    Token.query.filter_by(username=username).delete()
    db.session.commit()
    return
