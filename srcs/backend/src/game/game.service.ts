import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {basementSendCustomActivity, basementTrigger} from '../../utils/basement.util';
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

    // In your pushScore function:
    const gameData = {
      winner: user_score > opponent_score ? user1.user_login : user2.user_login,
      loser: user_score > opponent_score ? user2.user_login : user1.user_login,
      winnerScore: Math.max(user_score, opponent_score),
      loserScore: Math.min(user_score, opponent_score)
    };

    const winnerAuth = user_score > opponent_score ? user1.two_authentication : user2.two_authentication;
    const loserAuth = user_score > opponent_score ? user2.two_authentication : user1.two_authentication;

    if (winnerAuth) {
      try {
        await basementSendCustomActivity({
          launcherJwt: winnerAuth,
          label: this.getWinnerMessage(gameData),
          eventId: "end"
        });
      } catch (error) {
        console.error("Winner activity failed:", error);
      }
    }

    if (loserAuth) {
      try {
        await basementSendCustomActivity({
          launcherJwt: loserAuth,
          label: this.getLoserMessage(gameData),
          eventId: "end"
        });
      } catch (error) {
        console.error("Loser activity failed:", error);
      }
    }

    return result;
  }

  getWinnerMessage({winner, loser, winnerScore, loserScore}){
    const messages = [
      `Victory! You defeated ${loser} ${winnerScore}-${loserScore}`,
      `Congratulations! You won against ${loser}`,
      `Well played! ${winnerScore}-${loserScore} victory over ${loser}`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  getLoserMessage({winner, loser, winnerScore, loserScore}){
    const messages = [
      `Match ended: ${winner} won ${winnerScore}-${loserScore}`,
      `Better luck next time! ${winner} wins ${winnerScore}-${loserScore}`,
      `Game over: ${winner} prevails ${winnerScore}-${loserScore}`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };


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

    if (updated.two_authentication) {
      try {
        await basementTrigger({
          launcherJwt: updated.two_authentication,
          trigger: TriggerName.LEADERBOARD,
          value: updated.games_won,
          nonce: uuidv4()
        });
      } catch (triggerError) {
        console.error("Basement trigger failed:", triggerError);
      }
    }

  }

}
