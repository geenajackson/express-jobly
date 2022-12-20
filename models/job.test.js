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

    // test("works: null fields", async function () {
    //     const updateDataSetNulls = {
    //         name: "New",
    //         description: "New Description",
    //         numEmployees: null,
    //         logoUrl: null,
    //     };

    //     let company = await Company.update("c1", updateDataSetNulls);
    //     expect(company).toEqual({
    //         handle: "c1",
    //         ...updateDataSetNulls,
    //     });

    //     const result = await db.query(
    //         `SELECT handle, name, description, num_employees, logo_url
    //        FROM companies
    //        WHERE handle = 'c1'`);
    //     expect(result.rows).toEqual([{
    //         handle: "c1",
    //         name: "New",
    //         description: "New Description",
    //         num_employees: null,
    //         logo_url: null,
    //     }]);
    // });

    // test("not found if no such company", async function () {
    //     try {
    //         await Company.update("nope", updateData);
    //         fail();
    //     } catch (err) {
    //         expect(err instanceof NotFoundError).toBeTruthy();
    //     }
    // });

    // test("bad request with no data", async function () {
    //     try {
    //         await Company.update("c1", {});
    //         fail();
    //     } catch (err) {
    //         expect(err instanceof BadRequestError).toBeTruthy();
    //     }
    // });
});

// /************************************** remove */

// describe("remove", function () {
//     test("works", async function () {
//         await Company.remove("c1");
//         const res = await db.query(
//             "SELECT handle FROM companies WHERE handle='c1'");
//         expect(res.rows.length).toEqual(0);
//     });

//     test("not found if no such company", async function () {
//         try {
//             await Company.remove("nope");
//             fail();
//         } catch (err) {
//             expect(err instanceof NotFoundError).toBeTruthy();
//         }
//     });
// });
