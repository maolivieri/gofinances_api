// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = 'transfer'
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("Should be able to retrieve a statement operation", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const user_id = user.id as string;

    const depositTransaction = await createStatementUseCase.execute({
      user_id,
      sender_id: user_id,
      type: "deposit" as OperationType,
      amount: 123,
      description: "initial deposit",
    });

    const statement_id = depositTransaction.id as string;

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id,
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("Should not be able to make withdraw for a non-existing user", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });

      const user_id = user.id as string;

      const depositTransaction = await createStatementUseCase.execute({
        user_id,
        sender_id: user_id,
        type: "deposit" as OperationType,
        amount: 123,
        description: "initial deposit",
      });

      const statement_id = depositTransaction.id as string;

      await getStatementOperationUseCase.execute({
        user_id: "notvaliduserid",
        statement_id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("Should not be able to make withdraw to a non-existing user", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });

      const user_id = user.id as string;

      await createStatementUseCase.execute({
        user_id,
        sender_id: user_id,
        type: "deposit" as OperationType,
        amount: 123,
        description: "initial deposit",
      });

      const statement_id = "notvalidstatementid";

      await getStatementOperationUseCase.execute({
        user_id,
        statement_id,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
