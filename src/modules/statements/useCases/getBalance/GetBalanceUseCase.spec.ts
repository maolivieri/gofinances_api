// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { GetBalanceError } from "./GetBalanceError";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";

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

describe("Get Balance", () => {
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

  it("Should be able to retrieve a user balance", async () => {
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

    const userBalance = await getBalanceUseCase.execute({ user_id });

    expect(userBalance.balance).toBe(123);
  });

  it("Should not be able to retrieve a user balance for non-existing user", async () => {
    expect(async () => {
      const user_id = "12345wrongUserid";

      await getBalanceUseCase.execute({ user_id });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
