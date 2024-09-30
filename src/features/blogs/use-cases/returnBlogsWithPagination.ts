import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';
import { blogsPaginationType } from '../blogs.types';

export class ReturnBlogsWithPaginationCommand {
  constructor(public query: string) {}
}

@CommandHandler(ReturnBlogsWithPaginationCommand)
export class ReturnBlogsWithPaginationUseCase
  implements ICommandHandler<ReturnBlogsWithPaginationCommand>
{
  private blogsRepository;
  constructor(protected blogsTypeOrmRepository: BlogsTypeOrmRepository) {
    this.blogsRepository = this.getBlogsRepository();
  }

  private getBlogsRepository() {
    const repositories = {
      TypeOrm: this.blogsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.blogsTypeOrmRepository;
  }
  async execute(
    command: ReturnBlogsWithPaginationCommand,
  ): Promise<blogsPaginationType> {
    return this.blogsRepository.returnBlogsWithPagination(command.query);
  }
}
