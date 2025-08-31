import type {
  LegionJob,
  MaterializeJob,
  Prisma,
  PrismaClient,
} from "@prisma/client";

export class LegionJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.LegionJobCreateInput[]): Promise<boolean> {
    try {
      await this.prisma.legionJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating LegionJobs:", error);
      return false;
    }
  }

  async findAll(): Promise<LegionJob[]> {
    return this.prisma.legionJob.findMany();
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.legionJob.deleteMany({
        where: { id: { in: ids } },
      });
      return true;
    } catch (error) {
      console.error("Error deleting LegionJobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.LegionJobCreateInput[]) {
    const oldJobData = await this.findAll();
    const newJobs: Prisma.LegionJobCreateInput[] = [];
    const updateJobs: Prisma.LegionJobCreateInput[] = [];
    const deleteJobs: Prisma.LegionJobCreateInput[] = [];

    oldJobData.forEach((oldJob) => {
      if (data.every((newJob) => newJob.title !== oldJob.title)) {
        deleteJobs.push(oldJob);
      }
    });
    data.forEach((newJob) => {
      const existingJob = oldJobData.find(
        (oldJob) => oldJob.title === newJob.title
      );
      if (existingJob) {
        if (
          existingJob.location !== newJob.location ||
          existingJob.compensation !== newJob.compensation ||
          existingJob.type !== newJob.type
        ) {
          updateJobs.push({
            id: existingJob.id,
            ...newJob,
          });
        }
      } else {
        newJobs.push(newJob);
      }
    });
    return { deleteJobs, newJobs, updateJobs };
  }
}
