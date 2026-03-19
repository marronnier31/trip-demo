const monthlyPerformance = [
  { month: '1월', revenue: 12480000, bookingCount: 94, cancelledCount: 8 },
  { month: '2월', revenue: 13860000, bookingCount: 102, cancelledCount: 11 },
  { month: '3월', revenue: 16540000, bookingCount: 121, cancelledCount: 10 },
  { month: '4월', revenue: 18220000, bookingCount: 133, cancelledCount: 9 },
  { month: '5월', revenue: 20150000, bookingCount: 146, cancelledCount: 13 },
  { month: '6월', revenue: 22430000, bookingCount: 158, cancelledCount: 12 },
];

const sellerPerformance = [
  { sellerId: 1, name: '제주 숙소 운영', revenue: 22800000, bookingCount: 143, cancelledCount: 9 },
  { sellerId: 2, name: '오션스테이 파트너스', revenue: 17650000, bookingCount: 114, cancelledCount: 11 },
  { sellerId: 3, name: '도심형 스테이랩', revenue: 15220000, bookingCount: 98, cancelledCount: 10 },
  { sellerId: 4, name: '마운틴 리트릿', revenue: 11990000, bookingCount: 81, cancelledCount: 8 },
];

const lodgingTypePerformance = [
  { type: '호텔', bookingCount: 188, cancelledCount: 16, revenue: 29500000 },
  { type: '리조트', bookingCount: 134, cancelledCount: 13, revenue: 23800000 },
  { type: '펜션', bookingCount: 156, cancelledCount: 19, revenue: 20100000 },
  { type: '한옥스테이', bookingCount: 94, cancelledCount: 7, revenue: 12840000 },
  { type: '게스트하우스', bookingCount: 82, cancelledCount: 8, revenue: 9430000 },
];

const sum = (items, selector) => items.reduce((acc, item) => acc + selector(item), 0);
const toRate = (value, total) => (total ? (value / total) * 100 : 0);

function buildMixItems(items, total, countKey, labelKey) {
  return items
    .map((item) => ({
      label: item[labelKey],
      count: item[countKey],
      ratio: toRate(item[countKey], total),
      revenue: item.revenue,
      cancelledCount: item.cancelledCount,
    }))
    .sort((a, b) => b.count - a.count);
}

const totalRevenue = sum(monthlyPerformance, (item) => item.revenue);
const totalConfirmedBookings = sum(monthlyPerformance, (item) => item.bookingCount);
const totalCancelledBookings = sum(monthlyPerformance, (item) => item.cancelledCount);
const totalBookingRequests = totalConfirmedBookings + totalCancelledBookings;
const avgRevenuePerBooking = Math.round(totalRevenue / totalConfirmedBookings);

const sellerBookingTotal = sum(sellerPerformance, (item) => item.bookingCount);
const typeBookingTotal = sum(lodgingTypePerformance, (item) => item.bookingCount);
const maxMonthlyRevenue = Math.max(...monthlyPerformance.map((item) => item.revenue));

export const adminDashboardMock = {
  overview: {
    totalUsers: 128,
    totalSellers: 24,
    activeLodgings: 86,
    pendingInquiries: 7,
    totalRevenue,
    totalBookings: totalBookingRequests,
    confirmedBookings: totalConfirmedBookings,
    cancelledBookings: totalCancelledBookings,
    cancellationRate: toRate(totalCancelledBookings, totalBookingRequests),
    confirmedRate: toRate(totalConfirmedBookings, totalBookingRequests),
    avgRevenuePerBooking,
  },
  monthlyPerformance: monthlyPerformance.map((item) => ({
    ...item,
    cancellationRate: toRate(item.cancelledCount, item.bookingCount + item.cancelledCount),
    revenueRatio: toRate(item.revenue, maxMonthlyRevenue),
  })),
  sellerPerformance: sellerPerformance
    .map((item) => ({
      ...item,
      bookingRatio: toRate(item.bookingCount, sellerBookingTotal),
      cancellationRate: toRate(item.cancelledCount, item.bookingCount + item.cancelledCount),
    }))
    .sort((a, b) => b.revenue - a.revenue),
  lodgingTypePerformance: lodgingTypePerformance
    .map((item) => ({
      ...item,
      bookingRatio: toRate(item.bookingCount, typeBookingTotal),
      cancellationRate: toRate(item.cancelledCount, item.bookingCount + item.cancelledCount),
    }))
    .sort((a, b) => b.bookingCount - a.bookingCount),
  reservationMix: [
    {
      label: '예약 완료',
      count: totalConfirmedBookings,
      ratio: toRate(totalConfirmedBookings, totalBookingRequests),
      tone: 'success',
    },
    {
      label: '예약 취소',
      count: totalCancelledBookings,
      ratio: toRate(totalCancelledBookings, totalBookingRequests),
      tone: 'warning',
    },
  ],
  lodgingTypeMix: buildMixItems(lodgingTypePerformance, typeBookingTotal, 'bookingCount', 'type'),
  quickLinks: [
    { to: '/admin/users', label: '사용자 관리' },
    { to: '/admin/sellers', label: '판매자 관리' },
    { to: '/admin/inquiries', label: '문의 관리' },
    { to: '/admin/rewards', label: '쿠폰·마일리지' },
    { to: '/admin/events', label: '이벤트 관리' },
  ],
};
