const request = require("supertest");
const app = require("../server");

describe("User Registration", () => {
    it("should register a user", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send({
                email: "testuser@example.com",
                password: "password123",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
    });

    it("should return error for missing email", async () => {
        const response = await request(app)
            .post("/api/users/register")
            .send({ password: "password123" });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});
