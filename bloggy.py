from __future__ import division
import sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, jsonify
from contextlib import closing
from functools import wraps
import hashlib
from datetime import datetime

DATABASE = '/home/sauron/tmp/bloggy.db'
DEBUG = True
SECRET_KEY = 'da;lksdjsakldas11'
SALT = 'aosijdjaioeioj2io2o112wsx][da2'

app = Flask(__name__)
app.config.from_object(__name__)

def connect_db():
    return sqlite3.connect(app.config['DATABASE'])

def init_db():
    with closing(connect_db()) as db:
        with app.open_resource('schema.sql') as f:
            db.cursor().executescript(f.read())
        db.commit()

def query_db(query, args=(), one=False):
    cur = g.db.execute(query, args)
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv

class tree_element:
    def __init__(self, comment_toset=None):
        self.children = []
        self.comment = comment_toset

def generate_tree(comments):
    tree_elements = {}
    for post in comments:
        tree = []
        tree_hash = {}

        tree.append(tree_element())
        for comment in comments[post]:
            if not comment['reply_to']:
                tree.append(tree_element(comment))
                lol = comment['id']
                tree_hash[comment['id']] = len(tree)-1
                tree[0].children.append(len(tree)-1)
            else:
                tree.append(tree_element(comment))
                tree_hash[comment['id']] = len(tree)-1
                tree[tree_hash[comment['reply_to']]].children.append(len(tree)-1)

        tree_elements[post] = tree
    return tree_elements

@app.before_request
def before_request():
    g.db = connect_db()

@app.teardown_request
def teardown_request(exception):
    g.db.close()

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def show_entries():
    entries = query_db('select * from entries order by id desc')
    comments = {}
    for entry in entries:
        comments[entry['id']] = query_db('select * from comments where parent = ? order by id asc',
                [entry['id']])
    comm_tree = generate_tree(comments)
    return render_template('show_entries.html', entries=entries, comments=comm_tree)

@app.route('/login', methods=['GET', 'POST'])
def login():
    time = datetime.now()
    error = None
    if request.method == 'POST':
        user = query_db('select * from users where uname = ?', [request.form['username']], one=True)
        if user is None:
            error = 'No such user'
        elif user['password'] == hashlib.sha512(request.form['password']+app.config['SALT']).hexdigest():
            session['logged_in'] = True
            session['user'] = request.form['username']
            flash('You were logged in, ' + session['user'])
            return redirect(url_for('show_entries'))
        else:
            error = 'Wrong password'
    return render_template('login.html', error=error)

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('user', None)
    flash('You were logged out')
    return redirect(url_for('show_entries'))

# Add a user
@app.route('/useradd', methods=['GET', 'POST'])
@login_required
def useradd():
    time = datetime.now()
    if request.method == 'POST':
        g.db.execute('insert into users (uname, password) values (?, ?)',
                [request.form['uname'], hashlib.sha512(request.form['password']+app.config['SALT']).hexdigest()])
        g.db.commit()

        flash('New user has been added!')
        return redirect(url_for('useradd'))

    users = query_db('select id, uname from users order by id desc')
    timed = datetime.now() - time
    return render_template('useradd.html', users=users, timed=timed)

# Some user account things
@app.route('/account')
@login_required
def account():
    user_details = query_db('select * from users where uname = ?', [session['user']], one=True)
    return render_template('acc.html', details=user_details)

# Add a post to the database
@app.route('/add', methods=['GET', 'POST'])
@login_required
def add_entry():
    if request.method == 'POST':
        g.db.execute('insert into entries (title,html,author,date_posted) values (?, ?, ?, ?)',
                [request.form['title'], request.form['text'], session['user'], datetime.now()])
        g.db.commit()

        flash('New entry was succesfully posted!')
        return redirect(url_for('show_entries'))
    return render_template('add_entry.html')

# Add a comment 
@app.route('/add_comment/<int:parent>/<int:reply_to>/<comment_on>', methods=['POST'])
@login_required
def add_comment(parent, reply_to, comment_on):
    if comment_on == '1qw23a':
        comment_on = None

    g.db.execute('insert into comments (author,datetime,title,contents,parent,reply_to,comment_on) values (?, ?, ?, ?, ?, ?, ?)',
            [session['user'], datetime.now(), request.form['comment_title'], request.form['comment_body'], parent, reply_to, comment_on])
    g.db.commit()
    
    flash('The comment was posted!')
    return redirect(url_for('show_entries'))

#JSON(AJAX) functions
@app.route('/_check_username')
def check_uname():
    user = query_db('select * from users where uname = ?', [request.args.get('username', 0, type=str)], one=True)
    if user is None:
        return jsonify(fine='true')
    else:
        return jsonify(fine='false')

@app.route('/_rmuser')
def rmuser():
    g.db.execute('delete from users where uname = ?', [request.args.get('username', 0, type=str)])
    g.db.commit()
    users = query_db('select id, uname from users order by id desc')

    flash('A user was deleted');
    return jsonify(uname=request.args.get('username', 0, type=str))

@app.route('/_modify_account')
@login_required
def mod_acc():
    g.db.execute('update users set '+ request.args.get('field', 0, type=str) + '=? where id = ?', [request.args.get('updated_val', 0, type=str), request.args.get('acc_id', 0, type=int)])
    g.db.commit()
    return jsonify(status=200, details=query_db('select * from users where id =?', [request.args.get('acc_id', 0, type=int)]))

if __name__ == '__main__':
    app.run()

