import { SymbioticJob, Prisma, PrismaClient } from "@prisma/client";

export class SymbioticJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<SymbioticJob[]> {
    return this.prisma.symbioticJob.findMany({});
  }

  async createMany(data: Prisma.SymbioticJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.symbioticJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating Symbiotic jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.symbioticJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Symbiotic jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.SymbioticJobCreateInput[]) {
    const deleteJobs: Prisma.SymbioticJobCreateInput[] = [];
    const updateJobs: Prisma.SymbioticJobCreateInput[] = [];
    const newJobs: Prisma.SymbioticJobCreateInput[] = [];
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
