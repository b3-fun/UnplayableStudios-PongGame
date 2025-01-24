import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { basementTrigger } from '../../utils/basement.util';
import { TriggerName } from '../../utils/basement.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GameService {
  constructor(private readonly prisma: PrismaService) {}

  async pushScore(payload: any) {
    const { userId, opponent_id, user_score, opponent_score } = payload;
    const result = await this.prisma.match_history.create({
      data: {
        userId,
        opponent_id,
        user_score,
        opponent_score,
      },
    });

    const [user1, user2] = await Promise.all([
      this.prisma.user.findUnique({
        where: { user_id: userId }
      }),
      this.prisma.user.findUnique({
        where: { user_id: opponent_id }
      })
    ]);

    console.log("Trigger basement events for both users")
    if (user1.two_authentication) {
      await basementTrigger({
        launcherJwt: user1.two_authentication,
        trigger: user_score > opponent_score ? TriggerName.WIN: TriggerName.LOSE,
        value: 1,
        nonce: uuidv4()
      });
    }

    if (user2.two_authentication) {
      await basementTrigger({
        launcherJwt: user2.two_authentication,
        trigger: opponent_score > user_score ? TriggerName.WIN: TriggerName.LOSE,
        value: 1,
        nonce: uuidv4()
      });
    }
    return result;
  }
  async updateUserStatisticsData(payload: any) {
    const { userId, games_lost, games_won, games_drawn } = payload;
    const updated = await this.prisma.user.update({
      where: {
        user_id: Number(userId),
      },
      data: {
        games_lost: { increment: games_lost },
        games_won: { increment: games_won },
        games_drawn: { increment: games_drawn },
        games_played: { increment: 1 },
      },
    });

    console.log("Update leaderboard here")
    if (updated.two_authentication) {
      await basementTrigger({
        launcherJwt: updated.two_authentication,
        trigger: TriggerName.LEADERBOARD,
        value: updated.games_won,
        nonce: uuidv4()
      });
    }
  }

}
