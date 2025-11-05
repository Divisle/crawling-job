import { EnergyRoboticsJob, Prisma, PrismaClient } from "@prisma/client";

export class EnergyRoboticsJobRepository {
  constructor(private prisma: PrismaClient) {}

  async getAll(): Promise<EnergyRoboticsJob[]> {
    return this.prisma.energyRoboticsJob.findMany({});
  }

  async createMany(
    data: Prisma.EnergyRoboticsJobCreateInput[]
  ): Promise<boolean> {
    try {
      await this.prisma.energyRoboticsJob.createMany({
        data,
      });
      return true;
    } catch (error) {
      console.error("Error creating EnergyRobotics jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.energyRoboticsJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting EnergyRobotics jobs:", error);
      return false;
    }
  }

  async compareData(data: Prisma.EnergyRoboticsJobCreateInput[]) {
    const deleteJobs: Prisma.EnergyRoboticsJobCreateInput[] = [];
    const updateJobs: Prisma.EnergyRoboticsJobCreateInput[] = [];
    const newJobs: Prisma.EnergyRoboticsJobCreateInput[] = [];
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
