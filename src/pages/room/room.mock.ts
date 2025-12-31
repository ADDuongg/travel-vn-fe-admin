export type Room = {
  _id: string;
  code: string;
  price: number;
  capacity: number;
  isActive: boolean;
};

export const mockRooms: Room[] = [
  {
    _id: '1',
    code: 'ROOM_001',
    price: 500000,
    capacity: 4,
    isActive: true,
  },
  {
    _id: '2',
    code: 'ROOM_002',
    price: 700000,
    capacity: 6,
    isActive: false,
  },
];
