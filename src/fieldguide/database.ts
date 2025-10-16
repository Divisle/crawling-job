import { FieldGuideJob, Prisma, PrismaClient } from "@prisma/client";

export class FieldGuideJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<FieldGuideJob[]> {
    return this.prisma.fieldGuideJob.findMany({});
  }

  async createMany(data: Prisma.FieldGuideJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.fieldGuideJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating FieldGuide jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.fieldGuideJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting FieldGuide jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.FieldGuideJobCreateInput[]) {
    const deleteJobs: Prisma.FieldGuideJobCreateInput[] = [];
    const updateJobs: Prisma.FieldGuideJobCreateInput[] = [];
    const newJobs: Prisma.FieldGuideJobCreateInput[] = [];
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
