.PHONY: run-nestjs make run-cpp help

help:
	@echo "Available targets:"
	@echo "  make run-nestjs   - run load test against api.port=5005"
	@echo "  make run-cpp   - run load test against api.port=4501"

run-nestjs:
	mvn clean test-compile
	export API_ROOT_URL=http://host.docker.internal:5005/api/to-dos-api/ && mvn gatling:test

run-cpp:
	mvn clean test-compile
	export API_ROOT_URL=http://host.docker.internal:4501/api/ && mvn gatling:test
