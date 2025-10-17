import { OrcaSecurityJob, Prisma, PrismaClient } from "@prisma/client";

export class OrcaSecurityJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<OrcaSecurityJob[]> {
    return this.prisma.orcaSecurityJob.findMany({});
  }

  async createMany(
    data: Prisma.OrcaSecurityJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.orcaSecurityJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating OrcaSecurity jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.orcaSecurityJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting OrcaSecurity jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.OrcaSecurityJobCreateInput[]) {
    const deleteJobs: Prisma.OrcaSecurityJobCreateInput[] = [];
    const updateJobs: Prisma.OrcaSecurityJobCreateInput[] = [];
    const newJobs: Prisma.OrcaSecurityJobCreateInput[] = [];
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
