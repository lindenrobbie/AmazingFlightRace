from flask import Flask, Response, request
import json
import db_modules
from flask_cors import CORS
import random


app = Flask(__name__)
cors = CORS(app)

#minipeli dataa varten
@app.route('/minigame')
def minigame():
    #hakee url/minigame?icao="(fetching syöttämä icao)"
    args = request.args
    icao = args.get('icao')

    minigame = db_modules.db_command(f'select * from minigame where minigame_id = "{icao}"') #hakee minipelin tiedot icao koodilla

    #luo json muotoisen version tiedosta
    answer= {
        "icao" : minigame[0][0],
        "question" : minigame[0][1],
        "options" : minigame[0][2],
        "answer" : minigame[0][3]
    }

    #muuttaa json:iksi ja lähettää osoitteeseen "http://127.0.0.1:3000/minigame", josta js:n puolella fetchataan tiedot
    json_answer = json.dumps(answer)

    #palautus on muodossa: {"icao": "icao", "question": "minipelin tehtävä", "options": "minipelin 4 mahdollista vastausta", "answer": "oikea vastas / vastaukset, esim 1, jos ensimmäinen vastaus on oiken"}
    return json_answer


#odottaa fetch() hakua js puolelta, jossa haetaan fetch(http://127.0.0.1:3000/minigame_results + game_id, icao, points)
@app.route('/minigame_results')
def results():
    #kerää tiedot fetch() haun url:ista
    args = request.args
    game_id = args.get('id')
    icao = args.get('icao')
    points = args.get('points')

    #siirtää url:ista kerätyt tiedot tietokantaan
    db_modules.db_command(f'UPDATE game SET player_score += {points} WHERE game_ID = "{game_id}"')
    db_modules.db_command(f'UPDATE minigame SET complete = 1 WHERE minigame_id = "{icao}"')
    
    return 'fetch successful'

@app.route('/coordinates')
def cordinates():
    results = db_modules.getAirport(("ident, name, latitude_deg, longitude_deg"), 2)

    airport1 = {
            "icao": results[0][0],
            "name": results[0][1],
            "lat": results[0][2],
            "lon": results[0][3]
        }
    airport2 = {
            "icao": results[1][0],
            "name": results[1][1],
            "lat": results[1][2],
            "lon": results[1][3]
        }

    data = json.dumps([airport1, airport2])
    return data


@app.route('/start')
def startGame():
    args = request.args
    name = args.get('name')
    points = args.get('points')    
    location = args.get('loc')
    co2 = args.get('co2')
    

    db_modules.db_command(f'INSERT INTO game (game_playername, game_playerscore, game_playerpos, game_co2) VALUES ("{name}", "{points}", "{location}", {co2})')

    return 'fetch successful'

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)