import mysql.connector
import os

config = {
    'user': 'root',
    'password': 'root',
    'host': 'localhost',
    'port': 3306
}

SQL_FILE = "afr.sql"
DB_NAME = "afr"


def install_db(cursor):
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME};")
    cursor.execute(f"USE {DB_NAME};")

    if not os.path.exists(SQL_FILE):
        print(f"SQL file '{SQL_FILE}' not found.")
        return

    with open(SQL_FILE, "r", encoding="utf-8") as f:
        sql_script = f.read()

    commands = sql_script.split(';')
    for command in commands:
        command = command
        if command:
            try:
                cursor.execute(command)
            except mysql.connector.Error as err:
                print(f"Error executing command:\n{command[:100]}...\n{err}\n")
    print(f"Tietokanta '{DB_NAME}' on nyt asennettu.")


def uninstall_db(cursor):
    cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME};")
    print(f"Tietokanta '{DB_NAME}' on poistettu.")


while True:
    choice = input(
        "Haluatko asentaa (a), poistaa (p) vai asentaa uudelleen (r) tietokannan? (Enter lopettaa): ")

    if not choice:
        print("Lopetetaan.")
        break

    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()

        if choice == 'a':
            install_db(cursor)
        elif choice == 'p':
            uninstall_db(cursor)
        elif choice == 'r':
            uninstall_db(cursor)
            install_db(cursor)
        else:
            print("Syötä valiidi kirjain.")

        conn.commit()
        cursor.close()
        conn.close()

    except mysql.connector.Error as err:
        print(f"Yhteysvirhe: {err}")