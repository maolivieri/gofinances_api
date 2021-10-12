// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { CreateTransferError } from "./CreateTransferError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createTransferUseCase: CreateTransferUseCase;

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

    const sender_id = user.id as string;
    const user_id = anotherUser.id as string;

    const depositTransaction = await createTransferUseCase.execute({
      user_id,
      sender_id,
      type: "transfer" as OperationType,
      amount: 100,
      description: "first transfer",
    });

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance.balance).toBe(100);
    expect(depositTransaction).toHaveProperty("id");
  });

  
  it("Should not be able to make a transfer to a non-existing user", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });


      const sender_id = user.id as string;

      const user_id = "12345wrongUserid";

      await createTransferUseCase.execute({
        user_id,
        sender_id,
        type: "deposit" as OperationType,
        amount: 200,
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
