drop table if exists entries;
drop table if exists users;
drop table if exists comments;
drop table if exists tags;
drop table if exists categories;
create table entries (
    id integer primary key autoincrement,
    title string not null,
    html string,
    source string,
    author string not null,
    date_posted string not null,
    comments_on integer,
    score integer
);

create table comments (
    id integer primary key autoincrement,
    parent integer ,
    author string not null,
    datetime string not null,
    title string ,
    contents string,
    source string,
    comment_on string,
    reply_to integer,
    score integer
);

create table users (
    id integer primary key autoincrement,
    uname string not null unique,
    real_name string,
    password string not null,
    created_by string ,
    date_created string,
    email string,
    picture_dir string,
    last_edit_at string,
    user_level integer,
    stylesheet string,
    stylesheet_public integer,
    colour1 string,
    colour2 string,
    colour3 string
);

create table tags (
    id integer primary key autoincrement,
    name string not null,
    post_id integer not null
);

create table categories (
    id integer primary key autoincrement,
    name string not null,
    post_id integer not null
);

