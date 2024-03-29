"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [job.id]);
        expect(result.rows).toEqual([
            {
                id: job.id,
                title: "new",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            },
        ]);
    });
});

/************************************** findAll */

describe("findAll", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };

    test("works: no filter", async function () {
        let job = await Job.create(newJob);
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: job.id,
                title: "new",
                salary: 100000,
                equity: "0",
                companyHandle: "c1"
            }
        ]);
    });
    // test("works: nameLike filter", async function () {
    //     let companies = await Company.findAll({ nameLike: "c1" });
    //     expect(companies).toEqual([
    //         {
    //             handle: "c1",
    //             name: "C1",
    //             description: "Desc1",
    //             numEmployees: 1,
    //             logoUrl: "http://c1.img",
    //         }]);
    // });
    // test("works: min/maxEmployees filter", async function () {
    //     let companies = await Company.findAll({ minEmployees: 1, maxEmployees: 2 });
    //     expect(companies).toEqual([
    //         {
    //             handle: "c1",
    //             name: "C1",
    //             description: "Desc1",
    //             numEmployees: 1,
    //             logoUrl: "http://c1.img",
    //         },
    //         {
    //             handle: "c2",
    //             name: "C2",
    //             description: "Desc2",
    //             numEmployees: 2,
    //             logoUrl: "http://c2.img",
    //         }]);
    // });
});

// /************************************** get */

describe("get", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("works", async function () {
        let job = await Job.create(newJob);
        let jobId = job.id
        let foundJob = await Job.get(jobId);
        expect(foundJob).toEqual({
            id: jobId,
            title: "new",
            salary: 100000,
            equity: "0",
            companyHandle: "c1"
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.get(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

// /************************************** update */

describe("update", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    const updateData = {
        title: "newJob",
        salary: 200000,
        equity: "0",
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        let updateJob = await Job.update(job.id, updateData);
        expect(updateJob).toEqual({
            id: job.id,
            companyHandle: "c1",
            ...updateData,
        });
    });

    test("works: null fields", async function () {
        let job = await Job.create(newJob);
        const updateDataSetNulls = {
            title: "New",
            salary: null,
            equity: null
        };

        let updateJob = await Job.update(job.id, updateDataSetNulls);

        expect(updateJob).toEqual({
            id: job.id,
            companyHandle: "c1",
            ...updateDataSetNulls,
        });
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(0, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            let job = await Job.create(newJob);

            await Job.update(job.id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

// /************************************** remove */

describe("remove", function () {
    const newJob = {
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1"
    };
    test("works", async function () {
        let job = await Job.create(newJob);
        await Job.remove(job.id);
        const res = await db.query(
            `SELECT title FROM jobs WHERE id = ${job.id}`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no such job", async function () {
        try {
            await Job.remove(0);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
