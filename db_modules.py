import mariadb
from geopy import distance

def db_command(command):
    try:
        connection = mariadb.connect(
            host='127.0.0.1',
            port=3306,
            database='afr',
            user='root',
            password='root',
            autocommit=True
        )
        print('db_command debug: Pingataan mariadb serveriin...')
        connection.ping()

        print('db_command debug: yhdistetään...')
        cursor = connection.cursor()
        print('db_command debug: execute cursor...')
        cursor.execute(command)
        try:
            result = cursor.fetchall()
        except:
            result = None
        print('db_command debug: suljetaan mariadb yhteys')
        cursor.close()
        connection.close()
        return result
    except mariadb.Error as e:
        print('db_command debug: mariadb virhe:')
        print('db_command debug: returnataan None')
        print(e)
        return None

# hakee lentokentän (jolla on vastaava minipeli samalla identillä) icao-koodin
def getAirport(columns, amount):
    return db_command(f'SELECT {columns} FROM airport WHERE ident IN (SELECT minigame_id FROM minigame WHERE complete = 0) ORDER BY RAND() LIMIT {amount}')

def co2Cost(id, icao):
    currentCoord = db_command(f'select latitude_deg, longitude_deg from airport where ident = (select game_playerpos from game where game_id = {id})')
    newCoord = db_command(f'select latitude_deg, longitude_deg from airport where ident = "{icao}"')

    print('debug modules vanha uudet koordit:')
    print(currentCoord[0], newCoord[0])

    distanceTraveled = distance.distance(currentCoord[0], newCoord[0]).km
    co2EmissionsKg = 0.246 * distanceTraveled
    
    currentCo2 = db_command(f'select game_co2 from game where game_id = {id}')
    newCo2 = round(int(currentCo2[0][0])) + round(int(co2EmissionsKg))

    db_command(f'update game set game_co2 = {newCo2} where game_id = {id}')

def getCordinates():
    return db_command(f"SELECT minigame.minigame_id, airport.name, airport.latitude_deg, airport.longitude_deg FROM minigame JOIN airport ON minigame.minigame_id = airport.ident WHERE minigame.complete = 0 ORDER BY RAND() LIMIT 2;")