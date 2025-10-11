import { TraceBitJob, Prisma, PrismaClient } from "@prisma/client";

export class TraceBitRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<TraceBitJob[]> {
    return this.prisma.traceBitJob.findMany({});
  }

  async createMany(data: Prisma.TraceBitJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.traceBitJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating TraceBit jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.traceBitJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting TraceBit jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.TraceBitJobCreateInput[]) {
    const deleteJobs: Prisma.TraceBitJobCreateInput[] = [];
    const updateJobs: Prisma.TraceBitJobCreateInput[] = [];
    const newJobs: Prisma.TraceBitJobCreateInput[] = [];
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
