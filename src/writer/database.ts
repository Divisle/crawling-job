import { WriterJob, Prisma, PrismaClient } from "@prisma/client";

export class WriterJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<WriterJob[]> {
    return this.prisma.writerJob.findMany({});
  }

  async createMany(data: Prisma.WriterJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.writerJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Writer jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.writerJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Writer jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.WriterJobCreateInput[]) {
    const deleteJobs: Prisma.WriterJobCreateInput[] = [];
    const updateJobs: Prisma.WriterJobCreateInput[] = [];
    const newJobs: Prisma.WriterJobCreateInput[] = [];
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
