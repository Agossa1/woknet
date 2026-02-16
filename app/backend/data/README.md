# MaxMind GeoLite2 Database

To enable highly accurate geographic analytics (including detailed regions and cities in Benin), follow these steps:

1. Create a free account on [MaxMind.com](https://www.maxmind.com/en/geolite2/signup).
2. Download the **GeoLite2 City** binaire database (format `.mmdb`).
3. Place the file `GeoLite2-City.mmdb` in this directory (`app/backend/data/`).
4. Restart the backend server.

The `GeoService` is already configured to automatically detect and use this file. If the file is missing, it will continue to use `geoip-lite` as a fallback.
