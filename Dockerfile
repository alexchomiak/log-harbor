FROM alpine:latest

# Install Node.js and NPM
RUN apk add --update nodejs=~20 npm

# Install Go
RUN apk add --update make musl-dev go=~1.22
ENV GOROOT /usr/lib/go
ENV GOPATH /go
ENV PATH /go/bin:$PATH
ENV GOOS=linux
ENV GOARCH=amd64
# Copy app
COPY ./frontend /var/log-harbor/frontend
COPY ./backend /var/log-harbor/backend

WORKDIR /var/log-harbor/frontend
RUN npm install && npm run build

# Copy dist to Backend Public
WORKDIR /var/log-harbor/
RUN mv /var/log-harbor/frontend/dist /var/log-harbor/backend/public

# Build Backend
WORKDIR /var/log-harbor/backend
RUN go get
RUN go build -o log-harbor

EXPOSE 3000
CMD ["/var/log-harbor/backend/log-harbor"]
