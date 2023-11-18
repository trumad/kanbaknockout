# Makefile for running json-server

# Define the default target
all: run

# Define the target to run json-server
run:
	json-server --watch db.json --port 3000 & lite-server