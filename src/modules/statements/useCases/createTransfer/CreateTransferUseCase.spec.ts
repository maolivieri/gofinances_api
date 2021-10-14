// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateTransferError } from "./CreateTransferError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createTransferUseCase: CreateTransferUseCase;
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
    createTransferUseCase = new CreateTransferUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });


  it("Should be able to transfer money to another account", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const anotherUser = await createUserUseCase.execute({
      email: "test2@email.com",
      name: "TestUserTwo",
      password: "12345",
    });

    const user_id = anotherUser.id as string;
    const sender_id = user.id as string;

    await createStatementUseCase.execute({
      user_id: sender_id,
      sender_id,
      type: "deposit" as OperationType,
      amount: 100,
      description: "first deposit",
    });

    const transferTransaction = await createTransferUseCase.execute({
      user_id,
      sender_id,
      type: "transfer" as OperationType,
      amount: 50,
      description: "first transfer",
    });

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance.balance).toBe(50);
    expect(1).toBe(1);
    expect(transferTransaction).toHaveProperty("id");
  });

  
  it("Should not be able to make a transfer to a non-existing user", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });


      const sender_id = user.id as string;

      const user_id = "b86ef88a-bc5c-4bd0-8dd7-fd3bc2507c1b" as string;

      await createStatementUseCase.execute({
        user_id,
        sender_id,
        type: "deposit" as OperationType,
        amount: 50,
        description: "first deposit",
      });

      await createTransferUseCase.execute({
        user_id,
        sender_id,
        type: "transfer" as OperationType,
        amount: 30,
        description: "initial deposit",
      });
    }).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("Should not be able to make transfer when value not available", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });
  
      const anotherUser = await createUserUseCase.execute({
        email: "test2@email.com",
        name: "TestUserTwo",
        password: "12345",
      });
  
      const sender_id = user.id as string;
      const user_id = anotherUser.id as string;

      await createStatementUseCase.execute({
        user_id,
        sender_id,
        type: "deposit" as OperationType,
        amount: 100,
        description: "first deposit",
      });

      await createTransferUseCase.execute({
        user_id,
        sender_id,
        type: "deposit" as OperationType,
        amount: 300,
        description: "initial deposit",
      });
    }).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds);
  });
});
