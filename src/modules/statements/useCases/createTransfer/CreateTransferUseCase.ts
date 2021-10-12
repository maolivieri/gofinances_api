import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
export class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ user_id, type, amount, description, sender_id }: ICreateTransferDTO) {
    const user = await this.usersRepository.findById(user_id);

    // const sender_user = await this.usersRepository.findById(sender_id);

    if(!user) {
      throw new CreateTransferError.UserNotFound();
    }

    if(type === 'transfer') {
      const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_id });

      if (balance < amount) {
        throw new CreateTransferError.InsufficientFunds()
      }
    }

    const statementOperationToTheReceipent = await this.statementsRepository.create({
      user_id,
      sender_id,
      type,
      amount,
      description
    });

    const statementOperationToTheSender = await this.statementsRepository.create({
      user_id: sender_id,
      sender_id,
      type,
      amount: amount * -1,
      description
    });

    return statementOperationToTheReceipent;
  }
}
