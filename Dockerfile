FROM node:20-alpine as frontend

# Copy app
COPY ./frontend /var/log-harbor/frontend
WORKDIR /var/log-harbor/frontend
RUN npm install && npm run build

FROM golang:1.23-alpine as backend 
ENV GOOS=linux
ENV GOARCH=amd64

# * Copy Backend Code 
COPY ./backend /var/log-harbor/backend
# * Build Backend
WORKDIR /var/log-harbor/backend
RUN go install
RUN go build -ldflags "-s -w" -o log-harbor

# * Main Image Build Stage
FROM scratch
WORKDIR /var/log-harbor/
COPY --from=frontend /var/log-harbor/frontend/dist ./public
COPY --from=backend /var/log-harbor/backend/log-harbor .
EXPOSE 3000
CMD ["/var/log-harbor/log-harbor"]
