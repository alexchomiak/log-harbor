# 🐳 Log Harbor
![Log Harbor](https://img.shields.io/badge/Log_Harbor-purple)
![Docker Badge](https://github.com/alexchomiak/log-harbor/actions/workflows/docker-publish.yml/badge.svg)
![Image Size Badge](https://img.shields.io/docker/image-size/alexchomiak/log-harbor/main)
![Go Version](https://img.shields.io/github/go-mod/go-version/alexchomiak/log-harbor?filename=backend%2Fgo.mod)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-%23471301?logo=buymeacoffee)](https://buymeacoffee.com/alexchomiak)

Log Harbor is a light-weight application designed for log monitoring & analysis in Docker containers. 

This project was inspired by [Dozzle](https://github.com/amir20/dozzle). Please check this out as well!

## Features
* Ease of use. Single packaged unit.
* Light Weight. < 5MB Image Size
* Real time log streaming to core Web Application
* In Memory Database & SQL Support
  * Logs are streamed into an in-memory IndexedDB database directly in the browser. (up to 16,000 logs per container)
  * Filters are applied in Real Time.
  * Built in SQL Engine using [alasql](https://github.com/AlaSQL/alasql/wiki)
* Performance
  * Socket connections & log streaming are offloaded via WebWorkers. Allowing for tailing of high traffic log streams.
  * Virtualized lists allow for infinite scrolling across log streams
* Multi-Container Streams
  * Supports streaming up to 200 Containers at once! (or whatever your Browser's websocket pool limit is)

## Get Started
Run Log Harbor on your host with the following command
```sh
docker run -p 3000:3000 -v /var/run/docker.sock:/var/run/docker.sock alexchomiak/log-harbor:latest
```

## Feature Roadmap
* Add support for multiple hosts
  * Create Agent to install on remote hosts
  * Refactor UI for multiple host management
* Migrate from Worker to SharedWorker to minimize reliance between hosts
* Enhance Container Monitoring
  * Add more monitors to container view
* Implement Split View for Multi-Container Streams
* Implement User Preferences Panel
* Implement Query Library for saving queries in Local Storage/IndexedDB
