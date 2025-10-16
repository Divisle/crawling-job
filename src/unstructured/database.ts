import { UnstructuredJob, Prisma, PrismaClient } from "@prisma/client";

export class UnstructuredJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<UnstructuredJob[]> {
    return this.prisma.unstructuredJob.findMany({});
  }

  async createMany(
    data: Prisma.UnstructuredJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.unstructuredJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Unstructured jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.unstructuredJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Unstructured jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.UnstructuredJobCreateInput[]) {
    const deleteJobs: Prisma.UnstructuredJobCreateInput[] = [];
    const updateJobs: Prisma.UnstructuredJobCreateInput[] = [];
    const newJobs: Prisma.UnstructuredJobCreateInput[] = [];
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
