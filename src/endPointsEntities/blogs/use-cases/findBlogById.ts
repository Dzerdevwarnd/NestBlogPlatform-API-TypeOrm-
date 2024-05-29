import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsPgSqlRepository } from '../blogs.PgSqlRepository';
import { BlogsMongoRepository } from '../blogs.mongoRepository';
import { blogViewType } from '../blogs.types';

export class FindBlogByIdCommand {
  constructor(public params: { id: string }) {}
}

@CommandHandler(FindBlogByIdCommand)
export class FindBlogByIdUseCase
  implements ICommandHandler<FindBlogByIdCommand>
{
  private blogsRepository;
  constructor(
    protected blogsMongoRepository: BlogsMongoRepository,
    protected blogsPgSqlRepository: BlogsPgSqlRepository,
  ) {
    this.blogsRepository = this.getBlogsRepository();
  }

  private getBlogsRepository() {
    return process.env.USERS_REPOSITORY === 'Mongo'
      ? this.blogsMongoRepository
      : this.blogsPgSqlRepository;
  }
  async execute(command: FindBlogByIdCommand): Promise<blogViewType> {
    return this.blogsRepository.findBlog(command.params);
  }
}
