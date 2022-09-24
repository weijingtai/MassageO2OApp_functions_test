const { spec, request } = require('pactum');

request.setBaseUrl('http://192.168.0.140');

// describe("First",()=>{
//   const _spec = spec();
//   it('make a sample request', async () => {
//     _spec.get('http://192.168.0.140/api/');
//   });
//   it('should receive a response', async () => {
//     await _spec.toss();
//   });
//   it("should has status 200", async () => {
//     _spec.response().to.have.status(200);
//   });
//   if ("should has success json code", async () => {
//     _spec.response().to.have.json("code", 200);
//   });
//   if ("should has success json content", async () => {
//     _spec.response().to.have.json("message", "Hello World");
//   });
// })

it('test hello world', async () => {
  await spec()
    .get('/api/')
    .expectStatus(200)
    .expectJson({
      "code": 200,
      "message": "Hello World"
    });
});