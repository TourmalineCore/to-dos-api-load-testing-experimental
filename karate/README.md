# Karate + Gatling solution

nestjs
export API_ROOT_URL=http://host.docker.internal:5005/api/to-dos-api/
cpp
export API_ROOT_URL=http://host.docker.internal:4501/api/

mvn clean test-compile

mvn gatling:tests