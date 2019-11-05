CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  pwd TEXT NOT NULL
);

CREATE TABLE items (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE creds (
  id BIGSERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  hash_pwd TEXT NOT NULL,
  token TEXT NOT NULL
);

INSERT INTO items VALUES(Default, 'item1', 'description1');
INSERT INTO items VALUES(Default, 'item2', 'description2');
INSERT INTO users VALUES(Default, 'test@test.fr', 'token123');
