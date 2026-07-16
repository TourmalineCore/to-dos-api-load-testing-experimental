Feature: To-Dos
  # https://github.com/karatelabs/karate/issues/1191
  # https://github.com/karatelabs/karate?tab=readme-ov-file#karate-fork

  Background:
    * header Content-Type = 'application/json'

  Scenario: Happy Path

    * def jsUtils = read('./js-utils.js')
    * def apiRootUrl = jsUtils().getEnvVariable('API_ROOT_URL')
    
    # Check health endpoint
    Given url apiRootUrl
    And path 'health'
    When method GET
    Then status 200
    Then match response == { status: "ok" }
    
    # Create a new todo
    * def randomName = '[API-E2E]-test-todo-' + Math.random()

    Given url apiRootUrl
    And path 'to-dos'
    And request
      """
      {
        "name": "#(randomName)"
      }
      """
    When method POST
    Then status 201

    * print response
    * def todoId = response.todoId

    # Verify that todo is in the list with the id and generated name
    Given url apiRootUrl
    And path 'to-dos'
    When method GET
    Then status 200
    Then match response.toDos contains
      """
      {
        "id": #(todoId),
        "name": "#(randomName)"
      }
      """

    # Complete the todo with the id (soft delete)
    Given url apiRootUrl
    And path 'to-dos/complete'
    And request
      """
      {
      "toDoIds": [#(todoId)]
      }
      """
    When method POST
    Then status 200

    # Delete the todo with the id (hard delete)
    Given url apiRootUrl
    And path 'to-dos'
    And param toDoId = todoId
    When method DELETE
    Then status 200

    # Verify that todo is in the list with the id and generated name has been deleted
    Given url apiRootUrl
    And path 'to-dos'
    When method GET
    Then status 200
    Then match response.toDos !contains { "name": "#(randomName)" }
