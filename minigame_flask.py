from flask import Flask, Response, request
import json
import db_modules
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app)

@app.route('/minigame')
def minigame():
    icaoCodes = db_modules.getAirport('ident')

    airport1 = db_modules.db_command(f'select * from minigame where minigame_id = "{icaoCodes[0][0]}"')
    answer1= {
        "icao" : airport1[0][0],
        "question" : airport1[0][1],
        "options" : airport1[0][2],
        "answer" : airport1[0][3]
    }

    airport2 = db_modules.db_command(f'select * from minigame where minigame_id = "{icaoCodes[1][0]}"')
    answer2= {
        "icao" : airport2[0][0],
        "question" : airport2[0][1],
        "options" : airport2[0][2],
        "answer" : airport2[0][3]
    }
    answer = [answer1, answer2]
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
