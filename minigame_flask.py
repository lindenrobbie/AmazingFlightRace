from flask import Flask, Response
import json
import mysql.connector
import db_modules



#'serveri'
app = Flask(__name__)
@app.route('/minigame/<icao>/')
def minigame(icao):

    try:
        sql = db_modules.db_command(f'select * from minigame where minigame_id = "{icao}"')
        answer = {
            "question" : sql[0][1],
            "options" : sql[0][2],
            "answer" : sql[0][3]
        }
        print(sql)


    except ValueError:
        answer = {
        'status': 400,
        'text': 'could not float input'
        }

    json_answer = json.dumps(answer)
    return Response(response=json_answer, status='400', mimetype='application/json')


@app.route('/minigame_result/<result>/')
def result(result):

    try:
        if result == "1":
            print("Done")

        else:
            print("Failure")

    except ValueError:
        answer = {
            'status': 400,
            'text': 'could not float input'
        }

    return ("Toimii")

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)
