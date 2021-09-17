// import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to retrieve a user profile", async () => {
    const user = await createUserUseCase.execute({
      email: "test@email.com",
      name: "TestUser",
      password: "12345",
    });

    const user_id = user.id as string;

    const userProfile = await showUserProfileUseCase.execute(user_id);

    expect(userProfile.email).toBe("test@email.com");
    expect(userProfile.name).toBe("TestUser");
  });

  it("Should not be able to retrieve a user profile for non-existing id", async () => {
    expect(async () => {
      const user_id = "12345wrongUserid";

      await showUserProfileUseCase.execute(user_id);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
