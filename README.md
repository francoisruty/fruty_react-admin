
### Procedure

- git clone repo and cf into it

- docker-compose up -d

Create DB table:

docker-compose exec postgres /bin/bash
psql --username=fruty
\i /init/init.sql
\q
exit

Install dependencies for front and back:

docker-compose run front /bin/sh
cd /home/app
npm install
exit

docker-compose run back /bin/sh
cd /home/app
npm install
exit

docker-compose up -d

Create a new user:
curl -X POST \
  http://localhost:3000/api/create_user \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
  "username": "test",
  "password": "test"
}'

You should get:
{"result":"user created."}

All containers should now be up, and you can go to http://localhost:3000 in your browser.

### Verifications

- you should be able to log in with the user you created.

- you should be able to create, edit, and delete items.


### Notes


- we use a nginx load-balancer in front of the dev server, so that we can easily route
API calls to the back docker container, without messing with front dev server parameters.

- do NOT use this setup in production! This is a dev environment! For production you would have
to make Dockerfiles for front and back (front Dockerfile would use among other things "npm run build" command), build those docker containers and use them in docker-compose.yml, instead of mapping source code inside containers with docker filesystem mappings + installing manually dependencies.
