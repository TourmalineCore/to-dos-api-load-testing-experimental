package simulations;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.karatelabs.gatling.KarateProtocolBuilder;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.core.CoreDsl.scenario;
import static io.karatelabs.gatling.KarateDsl.*;

import java.time.Duration;

public class ToDosStressTest extends Simulation {

    public ToDosStressTest() {

        KarateProtocolBuilder protocol = karateProtocol();

        ScenarioBuilder main = scenario("To-Dos stress test")
                .exec(karateFeature("classpath:to-dos-happy-path.feature"));

        setUp(
            main.injectOpen(
                incrementUsersPerSec(5)
                    .times(5)
                    .eachLevelLasting(Duration.ofSeconds(30))
                    .separatedByRampsLasting(Duration.ofSeconds(10))
                    .startingFrom(1)
            ).protocols(protocol)
        ).assertions(
            global().failedRequests().percent().lt(5.0),
            global().responseTime().percentile(95).lt(3000)
        );
    }
}