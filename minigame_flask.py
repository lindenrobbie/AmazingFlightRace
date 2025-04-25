from flask import Flask, Response
import json
import mysql.connector

#mariadb
yhteys = mysql.connector.connect(
         host='127.0.0.1',
         port= 3306,
         database='flight_game',
         user='root',
         password='root',
         autocommit=True,
        collation= 'utf8mb3_unicode_ci'
         )
def sql(icao):
    sql = f"select name, municipality, ident from airport where airport.ident = '{icao}'"
    print(sql)
    kursori = yhteys.cursor()
    kursori.execute(sql)
    tulos = kursori.fetchall()
    print(tulos)
    return tulos



#'serveri'
app = Flask(__name__)
@app.route('/icao/<icao>')
def alkuluku(icao):

    try:

        icao = icao
        printti = sql(icao)
        nimi = printti[0][0]
        kaupunki = printti[0][1]
        icao = printti[0][2]
        vastaus = {
            "ICAO": icao,
            "Name": nimi,
            "Municipality": kaupunki,
        }
        print(f'loppuprintti: {printti[0]}')
        print(f'loppuprintti: {printti[0][0]}')
        print(f'icao {icao}')


    except ValueError:
        vastaus = {
        'status': 400,
        'text': 'could not float input'
        }

    json_answer = json.dumps(vastaus)
    return Response(response=json_answer, status='400', mimetype='application/json')


if __name__ == '__main__':
    app.run(use_reloader=True, host='127.0.0.1', port=3000)
