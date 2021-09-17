import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate a user", async () => {
    await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const tokenResponse = await authenticateUserUseCase.execute({
      email: "test@email.com",
      password: "12345",
    });

    expect(tokenResponse).toHaveProperty("token");
  });

  it("Should not be able to authenticate a user with an non-existing email address", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });
      await authenticateUserUseCase.execute({
        email: "test@wrongemail.com",
        password: "12345",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate a user with an wrong password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });
      await authenticateUserUseCase.execute({
        email: "test@email.com",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
