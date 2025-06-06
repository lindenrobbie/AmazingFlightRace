from flask import Flask, Response, request
import json
import db_modules
from flask_cors import CORS
from geopy import distance


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
    currentPoints = db_modules.db_command(f'select game_playerscore from game where game_id = "{game_id}"')
    print('debug pisteet:')
    print(currentPoints)
    db_modules.db_command(f'UPDATE game SET game_playerscore = "{int(currentPoints[0][0]) + int(points)}" WHERE game_ID = "{game_id}"')
    db_modules.db_command(f'UPDATE minigame SET complete = 1 WHERE minigame_id = "{icao}"')
    
    return 'fetch successful'

# palauttaa 2 satunnaisen lentokentän tiedot, sekä etäisyyden ja co2 hinnan pelaajan nykyisestä sijainnista
@app.route('/coordinates')
def cordinates():
    args = request.args
    game_id = args.get('id')
    
    results = db_modules.getAirport(("ident, name, latitude_deg, longitude_deg"), 2)
    
    posnow = db_modules.db_command(f'select latitude_deg, longitude_deg from airport where ident = (select game_playerpos from game where game_id = {game_id})')


    airport1pos = (
                results[0][2],
                results[0][3]
                    )
    airport2pos = (
                results[1][2],
                results[1][3]
                )
    print('debug:')
    print(posnow)

    distance_travelled1 = distance.distance((posnow[0][0],posnow[0][1]), airport1pos).km
    distance_travelled2 = distance.distance((posnow[0][0],posnow[0][1]), airport2pos).km

    distance_travelled1_co = distance_travelled1 * 0.246
    distance_travelled2_co = distance_travelled2 * 0.246

    airport1 = {
            "icao": results[0][0],
            "name": results[0][1],
            "lat": results[0][2],
            "lon": results[0][3],
            "distance": round(distance_travelled1),
            "co2": round(distance_travelled1_co)
        }
    airport2 = {
            "icao": results[1][0],
            "name": results[1][1],
            "lat": results[1][2],
            "lon": results[1][3],
        "distance": round(distance_travelled2),
        "co2": round(distance_travelled2_co)
    }

    data = json.dumps([airport1, airport2])
    return data

# päivittää pelaajan sijainnin valittuun lentokenttään
@app.route('/flyto')
def flyto():
    args = request.args
    id = args.get('id')
    icao = args.get('icao')
    db_modules.co2Cost(id, icao)
    db_modules.db_command(f'update game set game_playerpos = "{icao}" where game_id = {id}')
    return 'done'

# lisää uuden pelaajan tietokantaan ja palauttaa game_ID:n, joka tallentuu frontendissa sessionStorageen
@app.route('/start')
def startGame():
    args = request.args
    name = args.get('name')
    points = args.get('points')    
    location = args.get('loc')
    co2 = args.get('co2')
    
    db_modules.db_command(f'INSERT INTO game (game_playername, game_playerscore, game_playerpos, game_co2) VALUES ("{name}", "{points}", "{location}", {co2})')
    id = db_modules.db_command('select game_id from game order by game_id desc limit 1')

    return json.dumps(id)

# palauttaa top 10 pelaaajaa scoreboard taulusta
# samalla lisää pelaajan scoreboard tauluun sekä resetoi minipelit, jos syöttää id:n
@app.route('/scoreboard')
def scoreboard():
    args = request.args
    id = args.get('id')

    #pelin loppua varten, id=0 jos hakee pistetaulukon ennen pelin päättymistä, ei lisää pisteitä kantaan
    if id != '0':
        data = db_modules.db_command(f'select game_playername, game_playerscore from game where game_id = {id}')
        db_modules.db_command(f'insert into scoreboard (scoreboard_playername, scoreboard_finalscore) values ("{data[0][0]}", "{data[0][1]}")')
        db_modules.db_command('update minigame set complete=0')

    data = db_modules.db_command('select scoreboard_playername, scoreboard_finalscore from scoreboard order by scoreboard_finalscore desc limit 10')
    response = []
    for i in data:
        answer = {
            "name":i[0],
            "points":i[1]
        }
        response.append(answer)

    return json.dumps(response)

# palauttaa kaikki pelaajan tiedot, sekä tietoa nykyisestä sijainnista
@app.route('/getPlayerInfo')
def getPlayerInfo():
    id = request.args.get('id')
    if not id:
        return Response("Pelaajan ID puuttuu (ei löydy?)", status=400)

    data = db_modules.db_command(f'select * from game where game_ID = {id}')
    if not data:
        return Response("Peliä ei löydy", status=404)

    airport = db_modules.db_command(f'select name, latitude_deg, longitude_deg from airport where ident = (select game_playerpos from game where game_id = {id})')
    if not airport:
        return Response("Lenttokenttää ei löydy", status=404)

    playerInfo = {
        "ID": data[0][0],
        "name": data[0][1],
        "score": data[0][2],
        "pos": data[0][3],
        "co2": data[0][4],
        "lat": airport[0][1],
        "lon": airport[0][2],
        "airport_name": airport[0][0]
    }

    return json.dumps(playerInfo)


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)