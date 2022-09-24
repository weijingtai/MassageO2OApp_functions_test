const { handler,spec, request,sleep } = require('pactum');
const { expect } = require("chai")
const {describe } = require("mocha")
const uuid = require('uuid');

handler.addExpectHandler('includesMasterStateSketch', (ctx) => {
    expect(ctx.res.json.data).to.deep.include(ctx.data);
});
handler.addExpectHandler('notIncludesMasterStateSketch', (ctx) => {
expect(ctx.res.json.data).to.not.deep.include(ctx.data);
});
handler.addExpectHandler('notIncludesMasterStateSketchGuid', (ctx) => {

    // get guid list from ctx.res.json.data
    if (ctx.res.json.data != null && ctx.res.json.data.length > 0) {
        var guidList = ctx.res.json.data.map(function (item) {item.guid});
        expect(guidList).to.not.include(ctx.data);
    }
});

request.setBaseUrl('http://192.168.0.140');
const masterUid = "hDANDCVOJsOJjlzdQL9jbcJ3j2ay"

describe("Master State Sketch Service ",()=>{
    var addedServiceStateSketch = {
        guid: uuid.v4(),
        serviceGuid: uuid.v4(),
        type: "Service",
        state: "Waiting",
        appointmentStartAt: new Date().toISOString(),
        totalServiceMinutes: 60,
        hostUid: "test_host_uid",
        createdAt: new Date().toISOString(),
    };
    var previousServiceStateSketch = addedServiceStateSketch;
    var currentServiceStateSketch = addedServiceStateSketch;
    it('create', async () => {

        await spec()
        .post(`/api/master/sketch/${masterUid}/`)
        .withJson(addedServiceStateSketch)
        .expectStatus(200);
        await sleep(1000);
        await spec()
        .get(`/api/master/sketch/${masterUid}/`)
        .expect('includesMasterStateSketch', addedServiceStateSketch);
    });

    it('update state', async () => {
        // update 
        var update = JSON.parse(JSON.stringify(addedServiceStateSketch));
        
        update.state = "CustomerArrived";
        update.lastModifiedAt = new Date().toISOString();
        previousServiceStateSketch = addedServiceStateSketch;
        currentServiceStateSketch = update;
    
        // create update request body
        var updateBody = {
            guid: update.guid,
            state: update.state,
            lastModifiedAt: update.lastModifiedAt,
        }
        
        // make put request
        await spec()
        .put(`/api/master/sketch/${masterUid}/`)
        .withJson(updateBody)
        .expectStatus(200)
        .expectJson({
            "code": 200,
            "data":update
        });

        await sleep(1000);
        await spec()
        .get(`/api/master/sketch/${masterUid}/`)
        .expect('notIncludesMasterStateSketch', previousServiceStateSketch)
        .expect('includesMasterStateSketch', currentServiceStateSketch);
    });
    it('update appointmentStartAt & totalServiceMinutes', async () => {
        // update 
        var update = JSON.parse(JSON.stringify(currentServiceStateSketch));
        
        update.lastModifiedAt = new Date().toISOString();
        update.previousAppointmentStartAt = update.appointmentStartAt;
        update.appointmentStartAt = new Date().toISOString();
        update.previousTotalServiceMinutes = update.totalServiceMinutes;
        update.totalServiceMinutes = 90;
        previousServiceStateSketch = currentServiceStateSketch;
        currentServiceStateSketch = update;
    
        // create update request body
        var updateBody = {
            guid: update.guid,
            lastModifiedAt: update.lastModifiedAt,
            appointmentStartAt: update.appointmentStartAt,
            totalServiceMinutes: update.totalServiceMinutes,
        }
        // make put request
        await spec()
        .put(`/api/master/sketch/${masterUid}/`)
        .withJson(updateBody)
        .expectStatus(200)
        .expectJson({
            "code": 200,
            "data":currentServiceStateSketch
        });

        await sleep(1000);
        await spec()
        .get(`/api/master/sketch/${masterUid}/`)
        .expect('notIncludesMasterStateSketch', previousServiceStateSketch)
        .expect('includesMasterStateSketch', currentServiceStateSketch);
    });

    it('cancel', async () => {
        // update 
        var update = JSON.parse(JSON.stringify(currentServiceStateSketch));
        
        update.state = "Canceled";
        update.lastModifiedAt = new Date().toISOString();
        update.canceledAt = update.lastModifiedAt;
        previousServiceStateSketch = currentServiceStateSketch;
        currentServiceStateSketch = update;
    
        // create update request body
        var updateBody = {
            guid: update.guid,
            state: update.state,
            lastModifiedAt: update.lastModifiedAt,
            canceledAt: update.canceledAt,
        }
        // make put request
        await spec()
        .put(`/api/master/sketch/${masterUid}/`)
        .withJson(updateBody)
        .expectStatus(200)
        .expectJson({
            "code": 200,
            "data":update
        });

        await sleep(1000);
        await spec()
        .get(`/api/master/sketch/${masterUid}/`)
        .expect('notIncludesMasterStateSketch', previousServiceStateSketch)
        .expect('includesMasterStateSketch', currentServiceStateSketch);
    });
    it('deleted', async () => {
        // update 

        var removedGuid = currentServiceStateSketch.guid;
        // make put request
        await spec()
        .delete(`/api/master/sketch/${masterUid}/`)
        .withJson({
            guid: removedGuid
        })
        .expectStatus(200)
        .expectJsonMatch({
            "code": 200,
            "data":{
                guid: removedGuid
            }
        });

        await sleep(1000);
        await spec()
        .get(`/api/master/sketch/${masterUid}/`)
        .expect('notIncludesMasterStateSketchGuid', removedGuid)
    });
});
// it('MasterStateSketch listAll, get zero', async () => {
//     await spec()
//     .get(`/api/master/sketch/${masterUid}/`)
//     .expectStatus(200)
//     .expectJsonLike({
//         "data": "$V.length === 0"
//     });
// });



