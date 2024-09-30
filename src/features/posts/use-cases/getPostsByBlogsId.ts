import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { PostsTypeOrmRepository } from '../posts.TypeOrm.repository';

import { postsByBlogIdPaginationType } from '../posts.types';

export class GetPostsByBlogIdCommand {
  constructor(
    public params: { id: string },
    public query: any,
    public userId: string,
  ) {}
}

@CommandHandler(GetPostsByBlogIdCommand)
export class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdCommand>
{
  private postsRepository;
  constructor(protected postsTypeOrmRepository: PostsTypeOrmRepository) {
    this.postsRepository = this.getPostsRepository();
  }

  private getPostsRepository() {
    const repositories = {
      TypeOrm: this.postsTypeOrmRepository,
    };

    return repositories[process.env.REPOSITORY] || this.postsTypeOrmRepository;
  }
  async execute(
    command: GetPostsByBlogIdCommand,
  ): Promise<postsByBlogIdPaginationType> {
    const postsWithPagination = await this.postsRepository.findPostsByBlogId(
      command.params,
      command.query,
      command.userId,
    );

    return postsWithPagination;
  }
}
