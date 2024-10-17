docker compose up -d --build

Create a Zone:
curl "http://IP:5000/api/dns/zone/create?domain=abc.com&webserver_ip=127.0.0.1"

Get All Zones:
curl "http://IP:5000/api/dns/zone"


Create a Record:
curl "http://IP:5000/api/dns/zone/oceanpbx.club/create?host=www&type=A&destination=38.242.245.38"
