from flask import Flask, Response, request
import json
import db_modules
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app)

@app.route('/minigame')
def minigame():
    #getAirport hakee tietokannan "minigame" taulukosta satunnaisen "minigame_id,", "1" on haettujen kolumnien määrä
    #eli hakee yhden satunnaisen minipelin icao-koodin
    icaoCode = db_modules.getAirport('ident', 1)
    airport1 = db_modules.db_command(f'select * from minigame where minigame_id = "{icaoCode[0][0]}"') #getairport palauttaa muodossa [["icao,"]]

    #luo json muotoisen version tiedosta
    answer= {
        "icao" : airport1[0][0],
        "question" : airport1[0][1],
        "options" : airport1[0][2],
        "answer" : airport1[0][3]
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
    game_id = args.get("id")
    icao = args.get("icao")
    points = args.get("points")

    #siirtää url:ista kerätyt tiedot tietokantaan
    db_modules.db_command(f'UPDATE game SET player_score += {points} WHERE game_ID = "{game_id}"')
    db_modules.db_command(f'UPDATE minigame SET complete = 1 WHERE minigame_id = "{icao}"')
    
    #lopuksi ei kuitenkaan palauta mitään, tähän vois jkuitenkin laittaa palautuksena esim. "fetch succesfull" -merkkijonon, jos haluaa

@app.route('/coordinates')
def cordinates():
    results = db_modules.getAirport(("ident, name, latitude_deg, longitude_deg"), 2)

    data = {
            "icao": results[0][0],
            "name": results[0][1],
            "lat": results[0][2],
            "lon": results[0][3]
        }

    return json.dumps(data)

if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)