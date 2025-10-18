import { CoderabbitJob, Prisma, PrismaClient } from "@prisma/client";

export class CoderabbitJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<CoderabbitJob[]> {
    return this.prisma.coderabbitJob.findMany({});
  }

  async createMany(data: Prisma.CoderabbitJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.coderabbitJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Coderabbit jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.coderabbitJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Coderabbit jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.CoderabbitJobCreateInput[]) {
    const deleteJobs: Prisma.CoderabbitJobCreateInput[] = [];
    const updateJobs: Prisma.CoderabbitJobCreateInput[] = [];
    const newJobs: Prisma.CoderabbitJobCreateInput[] = [];
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
