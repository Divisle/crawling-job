import { Prisma, PrismaClient } from "@prisma/client";
import { NumericJobInterface } from "../template";
export class NumericJobRepository {
  constructor(private prisma: PrismaClient) {}

  async createMany(data: Prisma.NumericJobCreateInput[]) {
    try {
      await this.prisma.numericJob.createMany({ data });
      return true;
    } catch (error) {
      console.error("Error creating numeric jobs:", error);
      return false;
    }
  }

  async findMany(): Promise<
    Prisma.NumericJobGetPayload<{ include: { tags: true } }>[]
  > {
    try {
      return await this.prisma.numericJob.findMany({
        include: {
          tags: true,
        },
      });
    } catch (error) {
      console.error("Error finding numeric jobs:", error);
      return [];
    }
  }

  async updateMany(data: Prisma.NumericJobUpdateInput[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.updateMany({ data });
      return true;
    } catch (error) {
      console.error("Error updating numeric jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.numericJob.deleteMany({ where: { id: { in: ids } } });
      return true;
    } catch (error) {
      console.error("Error deleting numeric jobs:", error);
      return false;
    }
  }

  async compareData(datas: NumericJobInterface[]) {
    const newJobs: any[] = [];
    const updateJobs: any[] = [];
    const deleteJobs: any[] = [];
    const existingJobs = await this.findMany();
    existingJobs.forEach((job) => {
      if (!datas.some((newJob) => newJob.href !== job.href)) {
        deleteJobs.push(job);
      }
    });
    datas.forEach((newJob) => {
      const existingJob = existingJobs.find((job) => job.href === newJob.href);
      if (!existingJob) {
        newJobs.push(newJob);
      } else if (
        existingJob.title !== newJob.title ||
        existingJob.location_type !== newJob.location_type ||
        existingJob.address !== newJob.address ||
        existingJob.department !== newJob.department ||
        existingJob.time !== newJob.time
      ) {
        updateJobs.push({ ...newJob, id: existingJob.id });
      } else {
        existingJob?.tags.sort((a, b) => a.tag.localeCompare(b.tag));
        newJob.tags!.sort((a, b) => a.localeCompare(b));
        if (JSON.stringify(existingJob?.tags) !== JSON.stringify(newJob.tags)) {
          updateJobs.push({ ...newJob, id: existingJob.id });
        }
      }
    });
    return { newJobs, updateJobs, deleteJobs };
  }
}
