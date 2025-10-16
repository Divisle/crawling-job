import { ApolloGraphQlJob, Prisma, PrismaClient } from "@prisma/client";

export class ApolloGraphQlJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ApolloGraphQlJob[]> {
    return this.prisma.apolloGraphQlJob.findMany({});
  }

  async createMany(
    data: Prisma.ApolloGraphQlJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.apolloGraphQlJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating ApolloGraphQl jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.apolloGraphQlJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting ApolloGraphQl jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ApolloGraphQlJobCreateInput[]) {
    const deleteJobs: Prisma.ApolloGraphQlJobCreateInput[] = [];
    const updateJobs: Prisma.ApolloGraphQlJobCreateInput[] = [];
    const newJobs: Prisma.ApolloGraphQlJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.href === job.href);
      if (existingJob) {
        if (
          existingJob.title === job.title &&
          existingJob.location === job.location
        ) {
        } else {
          updateJobs.push({
            id: existingJob.id,
            title: job.title,
            location: job.location,
            href: job.href,
          });
        }
      } else {
        newJobs.push({
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.href === job.href);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          title: job.title,
          location: job.location,
          href: job.href,
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
