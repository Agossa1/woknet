
# Use TimescaleDB image (Postgres + timescaledb) as base to simplify installation
FROM timescale/timescaledb:latest-pg15

# Install PostGIS and build deps for pgvector
USER root
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    build-essential \
    postgis \
    postgresql-server-dev-15 \
  && rm -rf /var/lib/apt/lists/*

# Build and install pgvector (fast vector extension)
RUN git clone --depth 1 https://github.com/pgvector/pgvector.git /tmp/pgvector \
  && cd /tmp/pgvector \
  && make \
  && make install \
  && rm -rf /tmp/pgvector

USER postgres
