import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a new user", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    expect(user).toHaveProperty("id");
  });

  it("Should be able to create a new user with an existing email address", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser",
        password: "12345",
      });
      await createUserUseCase.execute({
        email: "test@email.com",
        name: "TestUser 2",
        password: "123456",
      });
    }).rejects.toBeInstanceOf(CreateUserError);
  });
});
