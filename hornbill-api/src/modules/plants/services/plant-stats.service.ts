import { Injectable } from '@nestjs/common';
import { PlantRepository } from '../repositories/plant.repository';
import { PlantCareReminderRepository } from '../repositories/plant-care-reminder.repository';
import { PlantCareLogRepository } from '../repositories/plant-care-log.repository';
import { PlantHealthLogRepository } from '../repositories/plant-health-log.repository';

@Injectable()
export class PlantStatsService {
  constructor(
    private readonly plantRepo: PlantRepository,
    private readonly reminderRepo: PlantCareReminderRepository,
    private readonly careLogRepo: PlantCareLogRepository,
    private readonly healthLogRepo: PlantHealthLogRepository,
  ) {}

  async getStats(userId: string) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const [totalActive, totalAll, oldestPlant, upcomingReminders, weeklyWaterings, recentPoorHealth] =
      await Promise.all([
        this.plantRepo.countActive(userId),
        this.plantRepo.countAll(userId),
        this.plantRepo.findOldest(userId),
        this.reminderRepo.findDueReminders(userId, endOfDay),
        this.careLogRepo.countWateringByUserId(userId),
        this.healthLogRepo.findRecentByUserId(userId, 30),
      ]);

    const survivalRate = totalAll > 0 ? Math.round((totalActive / totalAll) * 100) : 100;

    // Find plant with most care in arrears or most poor health
    const plantAttentionMap = new Map<string, number>();
    for (const r of upcomingReminders) {
      const key = (r as any).plant?.id;
      if (key) plantAttentionMap.set(key, (plantAttentionMap.get(key) ?? 0) + 1);
    }
    for (const h of recentPoorHealth) {
      plantAttentionMap.set(h.plantId, (plantAttentionMap.get(h.plantId) ?? 0) + 2);
    }

    const mostNeedy = plantAttentionMap.size > 0
      ? [...plantAttentionMap.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      totalActive,
      totalAll,
      totalArchived: totalAll - totalActive,
      survivalRate,
      oldestPlant: oldestPlant
        ? { id: oldestPlant.id, customName: oldestPlant.customName, acquiredAt: oldestPlant.acquiredAt }
        : null,
      weeklyWaterings,
      mostNeedyPlantId: mostNeedy,
    };
  }

  async getToday(userId: string) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const dueReminders = await this.reminderRepo.findDueReminders(userId, endOfDay);

    // Group by care type
    const grouped: Record<string, typeof dueReminders> = {};
    for (const r of dueReminders) {
      const key = r.careType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    }

    return { date: now.toISOString().split('T')[0], grouped };
  }

  async getWeek(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await this.reminderRepo.findUpcomingReminders(userId, startOfDay, endOfWeek);

    // Group by date
    const grouped: Record<string, typeof reminders> = {};
    for (const r of reminders) {
      const day = r.nextCareAt.toISOString().split('T')[0];
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(r);
    }

    return { from: startOfDay.toISOString().split('T')[0], to: endOfWeek.toISOString().split('T')[0], grouped };
  }

  async getGallery(userId: string, plantId?: string) {
    const photos = await this.careLogRepo.findAllPhotosByUserId(userId, plantId);
    return { photos };
  }
}
