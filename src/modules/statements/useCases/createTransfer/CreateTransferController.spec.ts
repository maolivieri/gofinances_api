import request from "supertest";
import { v4 as uuidV4 } from "uuid";
import { hash } from "bcrypt";

import { app } from "../../../../app";
import createConnection  from "../../../../database/test";
import { Connection } from "typeorm";

let connection: Connection;

describe("Create Transfer Controller", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();

        const id1 = uuidV4();
        const id2 = uuidV4();
        const password = await hash("admin", 8);

        await connection.query(
            `INSERT INTO users(id, name, email, password, created_at)
            values('${id1}', 'admin', 'admin@email.com', '${password}', 'now()')    
        `
        )

        await connection.query(
            `INSERT INTO users(id, name, email, password, created_at)
            values('${id2}', 'two', 'two@email.com', '${password}', 'now()')    
        `
        )
    })

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to transfer money", async () => {
        const senderUser = await request(app).post("/api/v1/sessions").send({
            email: "admin@email.com",
            password: "admin",
        });

        const receipientUser = await request(app).post("/api/v1/sessions").send({
            email: "two@email.com",
            password: "admin",
        });

        // console.log(responseToken)
        const sender = senderUser.body;
        const receipent = receipientUser.body;

        await request(app)
            .post("/api/v1/statements/deposit")
            .send({
                amount: 200,
                description: "first deposit"
            })
            .set({
                Authorization: `Bearer ${sender.token}`,
            });

        const response = await request(app)
            .post(`/api/v1/statements/transfer/${receipent.user.id}`)
            .send({
                amount: 50,
                description: "first transfer"
            })
            .set({
                Authorization: `Bearer ${sender.token}`,
            });

        const balanceSender = await request(app)
            .get(`/api/v1/statements/balance`)
            .set({
                Authorization: `Bearer ${sender.token}`,
            });

        const balanceReceipient = await request(app)
            .get(`/api/v1/statements/balance`)
            .set({
                Authorization: `Bearer ${receipent.token}`,
            });


        expect(balanceSender.body.balance).toBe(150);
        expect(balanceReceipient.body.balance).toBe(50);
    })
})
