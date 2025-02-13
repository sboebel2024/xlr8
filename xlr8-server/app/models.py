from app import db
from datetime import datetime, timezone
from sqlalchemy.orm import validates
import uuid
from sqlalchemy import String
import random
import string
import os

# Utility functions
def register_temp_user(ip):
    tempUser = TempUser(ip_addr=ip)
    db.session.add(tempUser)
    db.session.commit()
    return tempUser

# CHANGE THIS WHEN THERE ARE MORE TYPES OF FILE ~
# it needs to go look up where the images are for 
# different file types
def load_image(ext):
    filename = image_lookup_json.get(ext)
    if not filename:
        raise ValueError(f"No image found for extension: {ext}")
    
    file_path = os.path.join("app/static/images", filename)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File {file_path} not found.")

    with open(file_path, "rb") as img_file:
        return img_file.read()
    

# Association tables
managed_users_table = db.Table(
    'managed_users',
    db.Column('manager_id', String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('employee_id', String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
)
user_org_table = db.Table(
    'user_org',
    db.Column('user_id', String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('org_id', String(36), db.ForeignKey('orgs.id', ondelete='CASCADE'), primary_key=True),
    db.Column('treepath', db.JSON, nullable=False, default=lambda: [0]),
)
user_file_table = db.Table(
    'user_file',
    db.Column('user_id', String(36), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    db.Column('file_id', String(36), db.ForeignKey('files.id', ondelete='CASCADE'), primary_key=True),
    db.Column('user_profile', db.Text, nullable=True)
)
temp_file_table = db.Table(
    'temp_file',
    db.Column('user_id', String(36), db.ForeignKey('tempusers.id', ondelete='CASCADE'), primary_key=True),
    db.Column('file_id', String(36), db.ForeignKey('files.id', ondelete='CASCADE'), primary_key=True),
)
org_admins = db.Table(
    'org_admins',
    db.Column('org_id', String(36), db.ForeignKey('orgs.id'), primary_key=True),
    db.Column('user_id', String(36), db.ForeignKey('users.id'), primary_key=True)
)

# User model
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), nullable=False, unique=True)
    firstName = db.Column(db.String(50), nullable=False)
    lastName = db.Column(db.String(50), nullable=False)
    birthday = db.Column(db.JSON, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    phoneNumber = db.Column(db.JSON, nullable=False)
    email = db.Column(db.String(50), nullable=False, unique=True)
    temporary = db.Column(db.Boolean, nullable=False)
    base_path = db.Column(db.String(255), nullable=True)
    currentOrgId = db.Column(String(36), nullable=True)

    filesOwned = db.relationship('File', backref='owning_user', cascade='all, delete-orphan')

    # Use this when we integrate orgs
    managed_users = db.relationship(
        'User',
        secondary=managed_users_table,
        primaryjoin=id == managed_users_table.c.manager_id,
        secondaryjoin=id == managed_users_table.c.employee_id,
        backref=db.backref('managers', lazy='dynamic'),
        lazy='dynamic'
    )

    orgs = db.relationship(
        'Org',
        secondary=user_org_table,
        back_populates='users'
    )

# Temporary users
class TempUser(db.Model):
    __tablename__ = 'tempusers'
    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ip_addr = db.Column(String(45), nullable=False)


# File model
class File(db.Model):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.assign_default_image()

    __tablename__ = 'files'

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    fileName = db.Column(db.String(50), nullable=False)
    path = db.Column(db.String(255), nullable=True)
    ext = db.Column(db.String(50), nullable=False)
    version = db.Column(db.DateTime, nullable=False, default=datetime.now(timezone.utc))
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)
    content = db.Column(db.Text, nullable=False)
    isVisible = db.Column(db.Boolean, nullable=False, default=False)
    
    owning_user_id = db.Column(String(36), db.ForeignKey('users.id', ondelete='SET NULL'))
    org_id = db.Column(String(36), db.ForeignKey('orgs.id', ondelete='SET NULL'), nullable=True)
    org = db.relationship('Org', back_populates='files')
    users = db.relationship('User', secondary=user_file_table, backref='files')
    tempUsers = db.relationship('TempUser', secondary = temp_file_table, backref='files')
    treepath = db.Column(db.JSON, nullable=False, default=lambda: [0])
    extensor = db.Column(db.String(255), nullable=True)

    image = db.Column(db.LargeBinary, nullable=True)

    @validates('ext')
    def validate_ext(self, key, ext_value):
        print(f"Validating ext: {ext_value}")  # Debugging
        if ext_value == "des" and not self.image:
            print("Assigning default image for 'des'")
            self.image = load_image(ext_value)
        return ext_value

    def assign_default_image(self):
        print(f"Checking default image for {self.ext}")  # Debugging
        if self.ext and not self.image:
            print(f"Assigning default image for {self.ext}")
            self.image = load_image(self.ext)

# Org model ~ Not currently being used
class Org(db.Model):
    __tablename__ = 'orgs'

    id = db.Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    orgName = db.Column(db.String(50), nullable=False, unique=True)
    users = db.relationship('User', secondary=user_org_table, back_populates='orgs')
    files = db.relationship('File', back_populates='org', lazy='dynamic')
    signing_user_id = db.Column(String(36), db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    signing_user = db.relationship('User', foreign_keys=[signing_user_id])
    admins = db.relationship('User', secondary='org_admins', backref='admin_of_orgs')
    daily_code = db.Column(db.String(6), nullable=True)

    def generate_new_code(self):
        """Generate a new 6-character code."""
        self.daily_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        self.code_updated_at = datetime.now(timezone.utc)

# FileAccessLog model ~ Not currently being used
class FileAccessLog(db.Model):
    __tablename__ = 'file_access_logs'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    temp_user_id = db.Column(String(36), db.ForeignKey('tempusers.id', ondelete='CASCADE'), nullable=True)
    file_id = db.Column(String(36), db.ForeignKey('files.id', ondelete='CASCADE'), nullable=True)
    accessed_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), nullable=False)

    user = db.relationship('User', backref='file_access_logs')
    file = db.relationship('File', backref='file_access_logs')
    temp_user = db.relationship('TempUser', backref='file_access_logs')


ext_lookup_json = {
    "des": "serve_desmos.html",
    "ovlf": "serve_overleaf.html"
}

image_lookup_json = {
    "des": "desmos.png",
    "ovlf": "overleaf.png"
}

api_lookup_json = {
    "des": "overleaf.js",
    "ovlf": "solidworks.js",
    "txt": "vscode.js"
}
