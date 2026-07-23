# to-dos-api-load-testing-experimental

## Overview

Stress testing progressively increases load on the system until performance degrades or the system fails, in order to identify its breaking point and understand its behavior under overload.

## Stress test strategy

The strategy uses a step load (staircase) pattern: traffic increases in discrete, sustained increments rather than a single continuous ramp. This makes it easy to correlate a specific load level with the exact moment performance starts to degrade.

| Parameter       | Value       | Description                               |
| --------------- | ----------- | ----------------------------------------- |
| Starting rate   | 1 users/sec | Initial injection rate                    |
| Increment       | 5 users/sec | Rate added at each step                   |
| Number of steps | 5           | Total load levels                         |
| Level duration  | 30 sec      | How long each step holds steady           |
| Ramp duration   | 10 sec      | Transition time between consecutive steps |

## Scenario Under Test

Each virtual user executes a full end-to-end workflow representative of typical API usage:
* Create a new resource — expect a success status
* Verify the resource is present in the list — expect a success status and correct data
* Update/complete the resource — expect a success status
* Delete the resource — expect a success status
* Verify the resource no longer appears in the list — expect a success status

## Hardware of testing machine

> NOTE: The laptop was running in battery save mode, which reduces its performance by 15-20 percent.

CPU: 

AMD Ryzen 9 5900HX with Radeon Graphics 
Base speed:	3.30 GHz
Sockets:	1
Cores:	8
Logical processors:	16

RAM:
32.0 GB DDR4
Speed:	3200 MT/s
Available	4.1 GB
In use (Compressed)	23.8 GB (216 MB)


## Pass/Fail Assertions

Two global assertions determine whether a run is considered successful:

* Failed requests rate must stay below 5% across the entire run.
* 95th percentile response time must stay below 3000 ms.

If either threshold is breached at any point, the run is flagged as failed, signaling the system could not sustain the applied load within acceptable limits.

## Tools result

> NOTE: these tests runs from the branches CPP: feature/#14-integrate-and-add-e2e-tests-in-karate, NESTJS: experimantal/#84-research-reusable-api-load-testing

> NOTE: Load tests were performed on the developer hardware, so additional tools (such as docker, communication tools, etc.) could affect the test results.

### Karate + Gatling

#### CPP

Html page of result is avaliable [here](tools-result\karate\cpp\index.html).

| Elapsed | users | Response time |
| ------- | ------| ------------- |
| ~2s     | 1     | 378ms         |
| ~6s     | 6     | 565ms         |
| ~8s     | 8     | 340ms         |
| ~46s    | 11    | 4264ms        |
| ~48s    | 21    | 4016ms        |
| ~48s    | 22    | 3974ms        |

The increase in responses from the CPP api started with >10 concurrent users. `POST/api/to-dos` took up the most response time, which may indicate that writing to the database was blocked with parallel users.

#### Nestjs

Html page of result is avaliable [here](tools-result\karate\nestjs\index.html).

Throughout the test, the response time was on average 10-20 ms. Except for the spike at ~150 seconds of >10 users. The response time on the burst took ~150 ms.

#### Tool Conclusion

In general, the karate+gatling tool proved to be confident. 
The time displayed in the results was close to the expected time.
Setup and installation is a bit difficult, but it can come down to overused instructions and code snippets. Another obvious advantage is that karate e2e testing is widely used in our projects. The tests of which can be reused in load testing. Also, reading the tests in gherkin greatly simplifies their understanding and modification.

### JMeter

#### CPP

Html page of result is avaliable [here](tools-result\jmeter\cpp\index.html).

| Elapsed | users | Response time |
| ------- | ------| ------------- |
| ~30s    | 1     | 467ms         |
| ~70s    | 6     | 921ms         |
| ~110s   | 11    | 1020ms        |
| ~151s   | 16    | 1093ms        |
| ~197s   | 21    | 1207ms        |


JMeter showed same level of degradation as karate tool, but response time lower than karate tool.

#### Nestjs

Html page of result is avaliable [here](tools-result\jmeter\nestjs\index.html).

| Elapsed | users | Response time |
| ------- | ------| ------------- |
| ~30s    | 1     | 58ms          |
| ~68s    | 6     | 10ms          |
| ~110s   | 11    | 23ms          |
| ~150s   | 16    | 18ms          |
| ~189s   | 21    | 4078ms        |

The response time did not exceed 60 ms

#### Tool Conclusion

The CPP results in JMeter are completely comparable to the results of Karate+Gatling - degradation begins at a similar level of parallelism. For nestjs, the maximum response time to successful requests is basically the same as for Karate. Unlike Karate, JMeter has a more complex setup of test scenarios. The XML type of tests is difficult to create and review.

### k6

#### CPP

Html page of result is avaliable [here](tools-result\k6\cpp-summary.html).

| Metric | Value |
| ------ | ----- |
| Avg response time | 26.58ms |
| Median | 23.30ms |
| P(95) | 45.56ms |
| Max response time | 1510.04ms |
| Max VUs | 21 |
| Total requests | 88525 |
| Failed requests | 0 |

The CPP API completed the entire run with zero failed requests and zero failed checks. The average and median response times stayed low (23-27ms), but the max response time spiked to 1510ms, which is consistent with the same pattern seen in Karate and JMeter - occasional slow writes under concurrent load, most likely on `POST /to-dos`.

#### Nestjs

Html page of result is avaliable [here](tools-result\k6\nestjs-summary.html).

| Metric | Value |
| ------ | ----- |
| Avg response time | 14.46ms |
| Median | 11.98ms |
| P(95) | 27.76ms |
| Max response time | 144.45ms |
| Max VUs | 21 |
| Total requests | 161305 |
| Failed requests | 0 |

Nestjs also finished with zero failed requests and zero failed checks. Response times stayed consistently low throughout (avg 14.46ms, max 144.45ms) — no timeout errors or false network failures, and no signs of the burst-related spike observed in Karate.

#### Tool Conclusion

k6 confirmed the overall performance, as in Karate and JMeter. Nestjs is significantly faster and more stable than CPP with the same step-by-step loading scheme. However, the built-in HTML summary "k6-reporter" provides only cumulative statistics (average/minimum/average/maximum/p90/p95) for the entire test run — it does not break response time into load levels, unlike karate or JMeter. This means that the table above cannot display the progression of the number of virtual users in the same way as it was in the Karate and JMeter summaries - these data are missing from the report in the form in which it was generated. To get more detailed statistics, you need to use another reporter.