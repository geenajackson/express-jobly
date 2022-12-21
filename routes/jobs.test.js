"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/job");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
    u1Token,
    adminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };

    test("ok for admins", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "new",
                salary: 100000,
                equity: "0",
                companyHandle: "c1",
            },
        });
    });

    test("unauth for non admins", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    })

    test("bad request with missing data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                salary: 0
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "new",
                salary: "not a number",
                equity: "0",
                companyHandle: "c1"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("ok for anon", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs:
                [
                    {
                        id: job.id,
                        title: "new",
                        salary: 100000,
                        equity: "0",
                        companyHandle: "c1"
                    }
                ],
        });
    });

    test("fails: test next() handler", async function () {
        // there's no normal failure event which will cause this route to fail ---
        // thus making it hard to test that the error-handler works with it. This
        // should cause an error, all right :)
        await db.query("DROP TABLE jobs CASCADE");
        const resp = await request(app)
            .get("/jobs")
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(500);
    });
});

/************************************** GET /jobs/:handle */

describe("GET /jobs/:handle", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("works for anon", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app).get(`/jobs/${job.id}`);
        expect(resp.body).toEqual({
            job: {
                id: job.id,
                title: "new",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            },
        });
    });

    test("not found for no such job", async function () {
        const resp = await request(app).get(`/jobs/0`);
        expect(resp.statusCode).toEqual(404);
    });
});

/************************************** PATCH /jobs/:handle */

describe("PATCH /jobs/:handle", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("works for admin", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({
                title: "job-new",
                salary: 100000,
                equity: "0",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: job.id,
                title: "job-new",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            },
        });
    });

    test("unauth for anon", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({
                title: "job-new",
            });
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non admins", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({
                title: "job-new",
            })
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
                title: "new nope",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request on invalid data", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .patch(`/jobs/${job.id}`)
            .send({
                salary: "not a number"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:handle */

describe("DELETE /jobs/:handle", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("works for admins", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .delete(`/jobs/${job.id}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: `${job.id}` });
    });

    test("unauth for anon", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .delete(`/jobs/${job.id}`)
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non admins", async function () {
        let job = await Job.create(newJob);
        const resp = await request(app)
            .delete(`/jobs/${job.id}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
});
