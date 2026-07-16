function fn() {
  return {
    getEnvVariable: function (variable) {
      var System = Java.type('java.lang.System');

      return System.getenv(variable);
    },
  }
}