Web Server Back End
===================

### How to use

To run:
- `docker-compose up -d`

When first running on a new computer, you need to set the IP address:
- CMD --> `ipconfig /all` --> copy IPv4 address
- Change IP ADDRESS in .env to the new IP address

To view API endpoint documentation, either:
- Click on the Swagger port link in Docker Desktop

pgAdmin:
- Username: admin@admin.com
- Password: root
- Add server
- Name: ANFF web server
- Connections tab:
  - Host name/address: postgres
  - Username: postgres
  - Password: postgres

To see data in schema-Metabase (First setup when the web server is first turned on):
- Go to http://localhost:9090/ or click on the Metabase port link in Docker Desktop
- Enter details for registration (it doesn't matter what you enter)
- Choose PostgreSQL
- Fill out the following:
  - Display name: ANFF web server
  - Host: postgres
  - Port: 5432
  - Database name: postgres
  - Username: postgres
  - Password: postgres
- Click on "Go to database"
