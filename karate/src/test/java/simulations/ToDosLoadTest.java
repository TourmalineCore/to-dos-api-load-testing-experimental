package simulations;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.karatelabs.gatling.KarateProtocolBuilder;

import static io.gatling.javaapi.core.CoreDsl.rampUsersPerSec;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import static io.karatelabs.gatling.KarateDsl.*;

import java.time.Duration;

public class ToDosLoadTest extends Simulation {

    public ToDosLoadTest() {

        KarateProtocolBuilder protocol = karateProtocol();

        ScenarioBuilder main = scenario("To-Dos happy path")
                .exec(karateFeature("classpath:to-dos-happy-path.feature"));

        setUp(
                main.injectOpen(
                        rampUsersPerSec(1).to(50).during(Duration.ofMinutes(1))
                ).protocols(protocol)
        ).assertions(
                io.gatling.javaapi.core.CoreDsl.global().failedRequests().percent().lt(5.0),
                io.gatling.javaapi.core.CoreDsl.global().responseTime().percentile(95).lt(1000)
        );
    }
}