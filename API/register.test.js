pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
  });
  
  pm.test("Response has user ID", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
  });
  