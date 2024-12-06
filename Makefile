REPO ?= nhefner/srt-editor
GITSHA=$(shell git rev-parse --short HEAD)
TAG_COMMIT=$(REPO):$(GITSHA)
TAG_LATEST=$(REPO):latest

all: dev

.PHONY: build
build:
	docker build -t $(TAG_LATEST) .

.PHONY: dev
dev:
	SRT_DIR=./test-srts flask --app srt_editor --debug run

.PHONY: run
run:
	docker compose up -d --build $(TAG_LATEST)

.PHONY: publish
publish:
	docker push $(TAG_LATEST)
	@docker tag $(TAG_LATEST) $(TAG_COMMIT)
	docker push $(TAG_COMMIT)
