import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';

export class DeleteBlogCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
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
  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const resultBoolean = await this.blogsRepository.deleteBlog(command.params);
    return resultBoolean;
  }
}
