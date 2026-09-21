'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { api } from '@/services/api/client';
import { useAuth } from '@/features/auth/auth-provider';
export type RewardsSection = 'achievements' | 'challenges' | 'leaderboard';
const achievement = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  xp_reward: z.number().int(),
  challenge_date: z.string().optional(),
});
const earnedSchema = z.object({
  achievement_id: z.number().int(),
  user_id: z.string(),
  earned_at: z.string(),
});
const rankSchema = z.object({
  user_id: z.string(),
  xp: z.number().int(),
  user: z.object({ id: z.string(), username: z.string() }).optional(),
  rank: z.number().int().nullable().optional(),
});
const userSchema = z.object({ id: z.string(), username: z.string() });
export function useRewards(section: RewardsSection) {
  const { user } = useAuth();
  const client = useQueryClient();
  const [limit, setLimit] = useState(10);
  const [selected, setSelected] = useState('');
  const [awardId, setAwardId] = useState<number | null>(null);
  const [refreshConfirm, setRefreshConfirm] = useState(false);
  const catalog = useQuery({
    queryKey: ['rewards', section, user?.id, limit],
    queryFn: async ({ signal }) => {
      const data: unknown = (
        await api.get('/' + section, {
          signal,
          params: section === 'leaderboard' ? { limit } : undefined,
        })
      ).data;
      return section === 'leaderboard'
        ? z.array(rankSchema).parse(data)
        : z.array(achievement).parse(data);
    },
  });
  const earned = useQuery({
    queryKey: ['earned', user?.id],
    queryFn: async ({ signal }) =>
      z
        .array(earnedSchema)
        .parse(
          (await api.get('/achievements/user/' + user!.id, { signal })).data,
        ),
    enabled: section === 'achievements' && !!user,
  });
  const today = useQuery({
    queryKey: ['today', user?.id],
    queryFn: async ({ signal }) => {
      try {
        return achievement.parse(
          (await api.get('/challenges/today', { signal })).data,
        );
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: section === 'challenges',
  });
  const rank = useQuery({
    queryKey: ['rank', user?.id],
    queryFn: async ({ signal }) =>
      rankSchema.parse(
        (await api.get('/leaderboard/' + user!.id, { signal })).data,
      ),
    enabled: section === 'leaderboard' && !!user,
  });
  const users = useQuery({
    queryKey: ['reward-users', user?.id],
    queryFn: async ({ signal }) =>
      z.array(userSchema).parse((await api.get('/users/', { signal })).data),
    enabled: user?.role === 'admin',
  });
  const mutation = useMutation({
    retry: false,
    mutationFn: async () => {
      if (user?.role !== 'admin') throw new Error('Forbidden');
      if (refreshConfirm) await api.post('/leaderboard/refresh');
      else if (awardId !== null && selected)
        await api.post(
          '/achievements/' + awardId + '/award/' + encodeURIComponent(selected),
        );
      else throw new Error('Missing selection');
    },
    onSuccess: async () => {
      setAwardId(null);
      setRefreshConfirm(false);
      await client.invalidateQueries();
    },
  });
  return {
    user,
    limit,
    setLimit,
    selected,
    setSelected,
    awardId,
    setAwardId,
    refreshConfirm,
    setRefreshConfirm,
    catalog,
    earned,
    today,
    rank,
    users,
    mutation,
  };
}
