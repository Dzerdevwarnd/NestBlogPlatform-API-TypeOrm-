import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { BlogsTypeOrmRepository } from '../blogs.typeOrmRepository';
import { blogViewType } from '../blogs.types';

export class FindBlogByIdCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
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
  async execute(command: FindBlogByIdCommand): Promise<blogViewType> {
    return this.blogsRepository.findBlog(command.params);
  }
}
