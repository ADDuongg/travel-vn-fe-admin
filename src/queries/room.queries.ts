import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRoom,
  deleteRoom,
  getRoom,
  getRooms,
  updateRoom,
} from '@/services/room.service';

export const ROOM_KEYS = {
  all: ['rooms'] as const,
  detail: (id: string) => ['rooms', id] as const,
};

export const useRooms = () =>
  useQuery({
    queryKey: ROOM_KEYS.all,
    queryFn: getRooms,
  });

export const useRoom = (id?: string) =>
  useQuery({
    queryKey: id ? ROOM_KEYS.detail(id) : [],
    queryFn: () => getRoom(id!),
    enabled: !!id,
  });

export const useCreateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOM_KEYS.all }),
  });
};

export const useUpdateRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      updateRoom(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ROOM_KEYS.all });
      qc.invalidateQueries({ queryKey: ROOM_KEYS.detail(id) });
    },
  });
};

export const useDeleteRoom = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => qc.invalidateQueries({ queryKey: ROOM_KEYS.all }),
  });
};
