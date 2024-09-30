/* eslint-disable prefer-const */
import { Controller, Delete, Res } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Response } from 'express';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  @Delete('all-data')
  async deleteAllData(@Res() res: Response) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    const tables = await queryRunner.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
      `);

    try {
      await queryRunner.startTransaction();

      for (const table of tables) {
        await queryRunner.query(
          `TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`,
        );
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
    res.sendStatus(204);
    return;
  }
}
//
