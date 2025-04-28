from flask import Flask, Response, request
import json
import db_modules
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app)

@app.route('/minigame/<icao>/')
def minigame(icao):
    sql = db_modules.db_command(f'select * from minigame where minigame_id = "{icao}"')
    answer = {
        "icao" : sql[0][0],
        "question" : sql[0][1],
        "options" : sql[0][2],
        "answer" : sql[0][3]
    }

    json_answer = json.dumps(answer)
    return json_answer


@app.route('/minigame_results')
def results():
    args = request.args
    game_id = args.get("id")
    icao = args.get("icao")
    points = args.get("points")

    db_modules.db_command(f'UPDATE game SET player_score += {points} WHERE game_ID = "{game_id}"')
    db_modules.db_command(f'UPDATE minigame SET complete = 1 WHERE minigame_id = "{icao}"')


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)
