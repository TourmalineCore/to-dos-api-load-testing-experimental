package simulations;

import io.gatling.javaapi.core.ScenarioBuilder;
import io.gatling.javaapi.core.Simulation;
import io.karatelabs.gatling.KarateProtocolBuilder;

import static io.gatling.javaapi.core.CoreDsl.constantUsersPerSec;
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
                    constantUsersPerSec(10).during(Duration.ofSeconds(10))
                ).protocols(protocol)
        );
    }
}