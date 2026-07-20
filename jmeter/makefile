.PHONY: run-nestjs make run-cpp help

help:
	@echo "Available targets:"
	@echo "  make run-nestjs   - run load test against api.port=5005"
	@echo "  make run-cpp   - run load test against api.port=4501"

run-nestjs:
	rm -rf report/nestjs results-nestjs.jtl
	mkdir -p report/nestjs
	jmeter -n -t to-dos-api-load-test.jmx -q nestjs.env.properties -l results-nestjs.jtl -e -o report/nestjs

run-cpp:
	rm -rf report/cpp results-cpp.jtl
	mkdir -p report/cpp
	jmeter -n -t to-dos-api-load-test.jmx -q cpp.env.properties -l results-cpp.jtl -e -o report/cpp
