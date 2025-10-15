import { ProphetSecurityJob, Prisma, PrismaClient } from "@prisma/client";

export class ProphetSecurityJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<ProphetSecurityJob[]> {
    return this.prisma.prophetSecurityJob.findMany({});
  }

  async createMany(
    data: Prisma.ProphetSecurityJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.prophetSecurityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Prophet Security jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.prophetSecurityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Prophet Security jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.ProphetSecurityJobCreateInput[]) {
    const deleteJobs: Prisma.ProphetSecurityJobCreateInput[] = [];
    const updateJobs: Prisma.ProphetSecurityJobCreateInput[] = [];
    const newJobs: Prisma.ProphetSecurityJobCreateInput[] = [];
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
