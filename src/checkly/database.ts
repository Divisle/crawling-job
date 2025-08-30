import { ChecklyJob, Prisma, PrismaClient } from "@prisma/client";
import { ChecklyJobInterface } from "@src/template";

export class ChecklyRepository {
  constructor(private prisma: PrismaClient) {}

  async getChecklyJobs(): Promise<
    Prisma.ChecklyJobGetPayload<{
      include: {
        checklyLocation: true;
      };
    }>[]
  > {
    return this.prisma.checklyJob.findMany({
      include: {
        checklyLocation: true,
      },
    });
  }

  async createMany(data: ChecklyJobInterface[]): Promise<boolean> {
    try {
      const jobData: Prisma.ChecklyJobCreateInput[] = [];
      const locationData: {
        locationId: string;
        locationName: string;
        checklyJobId: string;
      }[] = [];

      data.forEach((job) => {
        jobData.push({
          jobId: job.jobId,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          href: job.href,
        });
        job.checklyLocation.forEach((loc) => {
          locationData.push({
            locationId: loc.locationId,
            locationName: loc.locationName,
            checklyJobId: job.jobId,
          });
        });
      });

      await this.prisma.checklyJob.createMany({
        data: jobData,
      });

      const query = `
      SELECT j.id AS "checklyJobId",
       c."locationId",
       c."locationName"
      FROM "ChecklyJob" j
      JOIN (
        VALUES ${locationData
          .map(
            (loc) =>
              `('${loc.checklyJobId}', '${loc.locationId}', '${loc.locationName}')`
          )
          .join(", ")}
      ) AS c("checklyJobId", "locationId", "locationName")
        ON j."jobId" = c."checklyJobId";
      `;
      if (locationData.length > 0) {
        const result: Prisma.ChecklyLocationCreateManyInput[] =
          await this.prisma.$queryRawUnsafe(query);
        await this.prisma.checklyLocation.createMany({
          data: result,
        });
      }
      return true;
    } catch (error) {
      console.error("Error creating Checkly jobs:", error);
      return false;
    }
  }

  async deleteMany(ids: string[]): Promise<boolean> {
    try {
      await this.prisma.checklyJob.deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error deleting Checkly jobs:", error);
      return false;
    }
  }

  async compareData(data: ChecklyJobInterface[]) {
    const deleteJobs: ChecklyJobInterface[] = [];
    const updateJobs: ChecklyJobInterface[] = [];
    const newJobs: ChecklyJobInterface[] = [];
    const existingJobs = await this.getChecklyJobs();

    data.forEach((job) => {
      const existingJob = existingJobs.find((j) => j.jobId === job.jobId);
      if (existingJob) {
        if (
          existingJob.title === job.title ||
          existingJob.department === job.department ||
          existingJob.location === job.location ||
          existingJob.employmentType === job.employmentType ||
          existingJob.workplaceType === job.workplaceType ||
          existingJob.href === job.href ||
          existingJob.checklyLocation.length === job.checklyLocation.length
        ) {
          for (const loc of job.checklyLocation) {
            const locExists = existingJob.checklyLocation.find(
              (l) =>
                l.locationId === loc.locationId &&
                l.locationName === loc.locationName
            );
            if (!locExists) {
              updateJobs.push({ id: existingJob.id, ...job });
              break;
            }
          }
        } else {
          updateJobs.push({ id: existingJob.id, ...job });
        }
      } else {
        newJobs.push(job);
      }
    });
    existingJobs.forEach((job) => {
      const locExists = data.find((j) => j.jobId === job.jobId);
      if (!locExists) {
        deleteJobs.push({
          id: job.id,
          jobId: job.jobId,
          title: job.title,
          department: job.department,
          location: job.location,
          employmentType: job.employmentType,
          workplaceType: job.workplaceType,
          href: job.href,
          checklyLocation: job.checklyLocation.map((loc) => ({
            locationId: loc.locationId,
            locationName: loc.locationName,
          })),
        });
      }
    });
    return { deleteJobs, updateJobs, newJobs };
  }
}
