
const { sqlForPartialUpdate } = require("./sql")


describe("sqlForPartialUpdate", function () {
    test("updates one value", async function () {
        const result = sqlForPartialUpdate(
            { name: "name" },
            { name: "newName" }
        );
        expect(result).toEqual({
            "setCols": "\"newName\"=$1",
            "values": ["name"]
        })
    });
    test("updates more than one value", async function () {
        const result = sqlForPartialUpdate(
            { name: "name", password: "password", email: "email@email.com" },
            { name: "newName", password: "newPassword", email: "newemail@email.com" }
        );
        expect(result).toEqual({
            "setCols": "\"newName\"=$1, \"newPassword\"=$2, \"newemail@email.com\"=$3",
            "values": ["name", "password", "email@email.com"]
        })
    })
})