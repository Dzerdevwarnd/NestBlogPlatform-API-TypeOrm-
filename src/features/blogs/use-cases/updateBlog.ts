import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public body: { name: string; description: string; websiteUrl: string },
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
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
  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const resultBoolean = this.blogsRepository.updateBlog(
      command.id,
      command.body,
    );
    return resultBoolean;
  }
}
