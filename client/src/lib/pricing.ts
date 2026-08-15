import { Room } from '../types/room';

/** Friday (5) and Saturday (6) are charged at the weekend rate. */
export const isWeekend = (date: Date) => {
  const day = date.getDay();
  return day === 5 || day === 6;
};

/** Effective nightly rates, preferring a discount price when one is set. */
export const getRates = (room: Room) => ({
  weekdayRate:
    room.weekday_discount_price && room.weekday_discount_price > 0
      ? room.weekday_discount_price
      : room.weekday_price,
  weekendRate:
    room.weekend_discount_price && room.weekend_discount_price > 0
      ? room.weekend_discount_price
      : room.weekend_price,
});

export interface NightsBreakdown {
  weekdayNights: number;
  weekendNights: number;
  weekdayPrice: number;
  weekendPrice: number;
}

/**
 * Split a stay into weekday/weekend nights and their subtotals.
 * Mirrors calculateTotalPrice() on the server (bookingController.js).
 */
export const calculateNightsBreakdown = (
  room: Room | null,
  checkIn: string,
  checkOut: string
): NightsBreakdown => {
  const empty = { weekdayNights: 0, weekendNights: 0, weekdayPrice: 0, weekendPrice: 0 };
  if (!room || !checkIn || !checkOut) return empty;

  const checkOutDate = new Date(checkOut);
  const { weekdayRate, weekendRate } = getRates(room);

  let weekdayNights = 0;
  let weekendNights = 0;
  let weekdayPrice = 0;
  let weekendPrice = 0;
  const currentDate = new Date(checkIn);

  while (currentDate < checkOutDate) {
    if (isWeekend(currentDate)) {
      weekendNights++;
      weekendPrice += weekendRate;
    } else {
      weekdayNights++;
      weekdayPrice += weekdayRate;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return { weekdayNights, weekendNights, weekdayPrice, weekendPrice };
};

/** Discount applied for each bedroom the guest chose not to use. */
export const calculateBedroomReduction = (
  room: Room | null | undefined,
  bedroomsUsed: number,
  nights: number
) => {
  if (!room || !room.price_reduction_per_bedroom) return 0;
  if (bedroomsUsed >= room.bedrooms) return 0;
  return (room.bedrooms - bedroomsUsed) * room.price_reduction_per_bedroom * nights;
};
