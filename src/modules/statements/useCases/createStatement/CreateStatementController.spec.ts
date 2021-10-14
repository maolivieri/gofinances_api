import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcrypt";

import { app } from "../../../../app";
import createConnection  from "../../../../database/test";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create Statement Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id = uuidV4();
        const password = await hash("admin", 8);

        await connection.query(
            `INSERT INTO users(id, name, email, password, created_at)
            values('${id}', 'admin', 'admin@email.com', '${password}', 'now()')    
        `
        )
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to deposit money", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@email.com",
            password: "admin",
        });

        // console.log(responseToken)
        const { token } = responseToken.body;

        const response = await request(app)
            .post("/api/v1/statements/deposit")
            .send({
                amount: 100,
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
    })

    it("should be not able to deposit money to nonexisting account", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "nonexisting@email.com",
            password: "admin",
        });
        const { token } = responseToken.body;

        const response = await request(app)
            .post("/api/v1/statements/deposit")
            .send({
                amount: 100,
                description: "second deposit"
            })
            .set({
                Authorization: `Bearer ${token}`
            });

        expect(response.status === 401 || response.status === 404).toBeTruthy()
    })

    it("should be able to withdraw money", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@email.com",
            password: "admin",
        });
        const { token } = responseToken.body;

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .send({
                amount: 50,
                description: "first withdraw"
            })
            .set({
                Authorization: `Bearer ${token}`,
            });

        expect(response.status).toBe(201);
    })

    it("should not be not able to withdraw money from nonexisting account", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "nonexisting@email.com",
            password: "admin",
        });
        const { token } = responseToken.body;

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .send({
                amount: 1,
                description: "failed withdraw"
            })
            .set({
                Authorization: `Bearer ${token}`
            });

        expect(response.status === 401 || response.status === 404).toBeTruthy()
    })

    it("should not be not able to withdraw money when insuficient funds", async () => {
        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "admin@email.com",
            password: "admin",
        });
        const { token } = responseToken.body;

        const response = await request(app)
            .post("/api/v1/statements/withdraw")
            .send({
                amount: 300,
                description: "second withdraw"
            })
            .set({
                Authorization: `Bearer ${token}`
            });

        expect(response.status).toBe(400);
    })
})
