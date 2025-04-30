import mariadb, random

connection = mariadb.connect(
    host='127.0.0.1',
    port=3306,
    database='afr',
    user='root',
    password='root',
    autocommit=True
)

def db_command(command):
    cursor = connection.cursor()
    cursor.execute(command)
    try:
        return cursor.fetchall()
    except:
        pass

# muokkaa pelaajan pistemäärää, yhteen- tai vähennyslasku
def modify_score(id, amount):
    db_command(f"UPDATE game SET game_playerscore += {amount} WHERE game_ID={id}")

# hakee lentokentän (jolla on vastaava minipeli samalla identillä) icao-koodin
def getAirport():
    return db_command(f"SELECT minigame.minigame_id, airport.name, airport.latitude_deg, airport.longitude_deg FROM minigame JOIN airport ON minigame.minigame_id = airport.ident WHERE minigame.complete = 0 ORDER BY RAND() LIMIT 2;")

    

# lisää pelaajan tietokantaan, aloittaa 1000 pisteellä
def add_player():
    name = input("\nSyötä nimi: ")
    db_command(f"INSERT INTO game (game_playername, game_playerscore, game_playerpos) VALUES ('{name}', 1000, 1)")

def travel_to(airport_id, game_id):
    db_command(f"UPDATE airport SET airport_visited=TRUE WHERE airport_id={airport_id}")
    db_command(f"UPDATE game SET game_playerpos={airport_id} WHERE game_ID={game_id}")