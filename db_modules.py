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
    db_command(f"UPDATE game SET game_playerscore=game_playerscore+{amount} WHERE game_ID={id}")

# arpoo lentokentän, jossa pelaaja ei ole käynyt
def select_airport():
    while True:
        i = random.randint(1, 21)
        if len(db_command(f"SELECT * FROM airport WHERE airport_ID = {i} AND airport_visited = FALSE")) > 0:
            break
          
    return db_command(f"SELECT * FROM airport WHERE airport_ID = {i} AND airport_visited = FALSE")

def choose_airport():
    airport1 = select_airport()

    while True:
        airport2 = select_airport()

        if airport2 != airport1:
            break

    return [airport1, airport2]

# lisää pelaajan tietokantaan, aloittaa 1000 pisteellä
def add_player():
    name = input("\nSyötä nimi: ")
    db_command(f"INSERT INTO game (game_playername, game_playerscore, game_playerpos) VALUES ('{name}', 1000, 1)")

def travel_to(airport_id, game_id):
    db_command(f"UPDATE airport SET airport_visited=TRUE WHERE airport_id={airport_id}")
    db_command(f"UPDATE game SET game_playerpos={airport_id} WHERE game_ID={game_id}")