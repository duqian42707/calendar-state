#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import logging
from flask import Flask
from flask import request
import psycopg2
import json

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = Flask(__name__)

dbconfig = {
    'host': '127.0.0.1',
    'port': '5432',
    'database': 'postgres',
    'user': 'postgres',
    'password': '123456',
}


@app.route('/calendar', methods=['GET'])
def home():
    return '<h1>Welcome</h1>'


@app.route('/calendar/data', methods=['GET'])
def get_data():
    conn = psycopg2.connect(host=dbconfig['host'], port=dbconfig['port'], database=dbconfig['database'],
                            user=dbconfig['user'], password=dbconfig['password'])
    cur = conn.cursor()
    cur.execute("SELECT data from calendar_state where id=1")
    rows = cur.fetchone()
    conn.close()
    return {'message': 'ok', 'data': rows[0]}, 200, {"Content-Type": "application/json;charset=UTF-8"}


@app.route('/calendar/data', methods=['POST'])
def save_data():
    data = json.dumps(request.json)
    conn = psycopg2.connect(host=dbconfig['host'], port=dbconfig['port'], database=dbconfig['database'],
                            user=dbconfig['user'], password=dbconfig['password'])
    cur = conn.cursor()
    sql = "update calendar_state set data ='" + data + "' where id=1"
    cur.execute(sql)
    conn.commit()
    conn.close()
    return {'message': 'ok'}, 200, {"Content-Type": "application/json;charset=UTF-8"}


def create_app():
    return app


if __name__ == '__main__':
    app.run()
