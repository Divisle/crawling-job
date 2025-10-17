import { FiniteStateJob, Prisma, PrismaClient } from "@prisma/client";

export class FiniteStateJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FiniteStateJob[]> {
    return this.prisma.finiteStateJob.findMany({});
  }

  async createMany(data: Prisma.FiniteStateJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.finiteStateJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating FiniteState jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.finiteStateJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting FiniteState jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FiniteStateJobCreateInput[]) {
    const deleteJobs: Prisma.FiniteStateJobCreateInput[] = [];
    const updateJobs: Prisma.FiniteStateJobCreateInput[] = [];
    const newJobs: Prisma.FiniteStateJobCreateInput[] = [];
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
