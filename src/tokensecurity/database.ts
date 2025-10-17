import { TokenSecurityJob, Prisma, PrismaClient } from "@prisma/client";

export class TokenSecurityJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TokenSecurityJob[]> {
    return this.prisma.tokenSecurityJob.findMany({});
  }

  async createMany(
    data: Prisma.TokenSecurityJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.tokenSecurityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating TokenSecurity jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.tokenSecurityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting TokenSecurity jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TokenSecurityJobCreateInput[]) {
    const deleteJobs: Prisma.TokenSecurityJobCreateInput[] = [];
    const updateJobs: Prisma.TokenSecurityJobCreateInput[] = [];
    const newJobs: Prisma.TokenSecurityJobCreateInput[] = [];
    const existingJobs = await this.getAll();

    data.forEach((job) => {
      const existingJob = existingJobs.find(
        (j) => j.href === job.href && j.location === job.location
      );
      if (existingJob) {
        if (existingJob.title === job.title) {
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
      const locExists = data.find(
        (j) => j.href === job.href && j.location === job.location
      );
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
