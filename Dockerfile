# Build stage for frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client

# Accept build arguments - using same names as Fly secrets
ARG GEOFENCE_CENTER_LAT
ARG GEOFENCE_CENTER_LON
ARG GEOFENCE_RADIUS_MILES
ARG GEONAME

# Set as environment variables for Vite build (same names as Fly secrets)
ENV GEOFENCE_CENTER_LAT=$GEOFENCE_CENTER_LAT
ENV GEOFENCE_CENTER_LON=$GEOFENCE_CENTER_LON
ENV GEOFENCE_RADIUS_MILES=$GEOFENCE_RADIUS_MILES
ENV GEONAME=$GEONAME

# Debug: Print build-time environment variables
RUN echo "=== BUILD-TIME ENV VARS ===" && \
    echo "GEOFENCE_CENTER_LAT: $GEOFENCE_CENTER_LAT" && \
    echo "GEOFENCE_CENTER_LON: $GEOFENCE_CENTER_LON" && \
    echo "GEOFENCE_RADIUS_MILES: $GEOFENCE_RADIUS_MILES" && \
    echo "GEONAME: $GEONAME" && \
    echo "=========================="

COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./
RUN npm ci --production

# Copy built backend
COPY --from=backend-build /app/server/dist ./dist

# Copy built frontend to be served as static files
COPY --from=frontend-build /app/client/dist ./public

# Create directory for SQLite database
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV DB_PATH=/data/sightings.db

EXPOSE 8080

CMD ["node", "dist/server.js"]
