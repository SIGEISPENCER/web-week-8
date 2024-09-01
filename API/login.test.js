pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
  });
  
  pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
  });
  
  // Save the token as an environment variable
  var jsonData = pm.response.json();
  pm.environment.set("authToken", jsonData.token);
  