import { PrimeSecurityJob, Prisma, PrismaClient } from "@prisma/client";

export class PrimeSecurityRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<PrimeSecurityJob[]> {
    return this.prisma.primeSecurityJob.findMany({});
  }

  async createMany(
    data: Prisma.PrimeSecurityJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.primeSecurityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating PrimeSecurity jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.primeSecurityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting PrimeSecurity jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.PrimeSecurityJobCreateInput[]) {
    const deleteJobs: Prisma.PrimeSecurityJobCreateInput[] = [];
    const updateJobs: Prisma.PrimeSecurityJobCreateInput[] = [];
    const newJobs: Prisma.PrimeSecurityJobCreateInput[] = [];
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
