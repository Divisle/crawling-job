import { TraversalJob, Prisma, PrismaClient } from "@prisma/client";

export class TraversalJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TraversalJob[]> {
    return this.prisma.traversalJob.findMany({});
  }

  async createMany(data: Prisma.TraversalJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.traversalJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Traversal jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.traversalJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Traversal jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TraversalJobCreateInput[]) {
    const deleteJobs: Prisma.TraversalJobCreateInput[] = [];
    const updateJobs: Prisma.TraversalJobCreateInput[] = [];
    const newJobs: Prisma.TraversalJobCreateInput[] = [];
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
