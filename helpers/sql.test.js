
const { sqlForPartialUpdate } = require("./sql")


describe("sqlForPartialUpdate", function () {
    test("updates one value", async function () {
        const result = sqlForPartialUpdate(
            { name: "name" },
            { name: "newName" }
        );
        expect(result).toEqual("hello")
    })
})