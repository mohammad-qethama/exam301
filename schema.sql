DROP TABLE IF EXISTS makeup;

CREATE TABLE makeup(
    id  SERIAL  PRIMARY KEY,
    name  VARCHAR(255),
    price VARCHAR(255),
     image VARCHAR(255),
    description text 
)
