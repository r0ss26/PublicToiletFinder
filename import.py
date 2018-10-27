# This module imports the initial csv containing suburb data
# into the database

import csv
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Check for environment variable
if not os.getenv("DATABASE_URL"):
    raise RuntimeError("DATABASE_URL is not set")

# Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))

# Import suburbs into database
def main():
    f = open("act_suburbs.csv")
    reader = csv.reader(f)
    next(reader, None)
    for key, postcode, suburb, latitude, longitude in reader:
        db.execute("INSERT INTO suburbs (key, postcode, suburb, latitude, longitude) VALUES (:key, :postcode, :suburb, :latitude, :longitude)", 
                    {"key": key, "postcode": postcode, "suburb": suburb, "latitude": latitude, "longitude": longitude})
    db.commit()

if __name__ == "__main__":
    main()