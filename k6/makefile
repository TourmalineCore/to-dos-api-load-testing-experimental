.PHONY: run-nestjs make run-cpp help

help:
	@echo "Available targets:"
	@echo "  make run-nestjs   - run load test against api.port=5005"
	@echo "  make run-cpp   - run load test against api.port=4501"

run-nestjs:
	export $$(grep -v '^#' nestjs.env | xargs) && k6 run to-dos-load-test.js

run-cpp:
	export $$(grep -v '^#' cpp.env | xargs) && k6 run to-dos-load-test.js
