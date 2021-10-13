// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = 'transfer'
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to deposit money to account", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const user_id = user.id as string;

    const depositTransaction = await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 123,
      description: "initial deposit",
    });

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance.balance).toBe(123);
    expect(depositTransaction).toHaveProperty("id");
  });

  it("Should be able to withdraw money from account", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const user_id = user.id as string;

    await createStatementUseCase.execute({
      user_id,
      type: "deposit" as OperationType,
      amount: 123,
      description: "initial deposit",
    });

    const withdrawTransaction = await createStatementUseCase.execute({
      user_id,
      type: "withdraw" as OperationType,
      amount: 23,
      description: "first withdraw",
    });

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance.balance).toBe(100);
    expect(withdrawTransaction).toHaveProperty("id");
  });

  it("Should not be able to make a deposit to a non-existing user", async () => {
    expect(async () => {
      const user_id = "12345wrongUserid";

      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 123,
        description: "initial deposit",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to make withdraw to a non-existing user", async () => {
    expect(async () => {
      const user_id = "12345wrongUserid";

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 23,
        description: "first withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("Should not be able to make withdraw when value not available", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });

      const user_id = user.id as string;

      await createStatementUseCase.execute({
        user_id,
        type: "deposit" as OperationType,
        amount: 123,
        description: "initial deposit",
      });

      await createStatementUseCase.execute({
        user_id,
        type: "withdraw" as OperationType,
        amount: 124,
        description: "first withdraw",
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
