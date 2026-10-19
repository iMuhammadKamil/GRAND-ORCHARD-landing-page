export const UserRoles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  WARDEN: "WARDEN",
  ACCOUNTANT: "ACCOUNTANT",
  MAINTENANCE_STAFF: "MAINTENANCE_STAFF",
  RESIDENT: "RESIDENT",
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const BedStatuses = {
  VACANT: "VACANT",
  OCCUPIED: "OCCUPIED",
  RESERVED: "RESERVED",
  MAINTENANCE: "MAINTENANCE",
} as const;

export type BedStatus = (typeof BedStatuses)[keyof typeof BedStatuses];

export const Genders = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  COED: "COED",
  OTHER: "OTHER",
} as const;

export type Gender = (typeof Genders)[keyof typeof Genders];

export const AllocationStatuses = {
  ACTIVE: "ACTIVE",
  UPCOMING: "UPCOMING",
  COMPLETED: "COMPLETED",
  TERMINATED: "TERMINATED",
} as const;

export type AllocationStatus = (typeof AllocationStatuses)[keyof typeof AllocationStatuses];

export const InvoiceStatuses = {
  DRAFT: "DRAFT",
  ISSUED: "ISSUED",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;

export type InvoiceStatus = (typeof InvoiceStatuses)[keyof typeof InvoiceStatuses];

export const InvoiceItemTypes = {
  RENT: "RENT",
  ELECTRICITY_SUBMETER: "ELECTRICITY_SUBMETER",
  MESS_FEE: "MESS_FEE",
  MESS_REBATE: "MESS_REBATE",
  DAMAGE_FEE: "DAMAGE_FEE",
  LATE_PENALTY: "LATE_PENALTY",
  SECURITY_DEPOSIT: "SECURITY_DEPOSIT",
} as const;

export type InvoiceItemType = (typeof InvoiceItemTypes)[keyof typeof InvoiceItemTypes];

export const PaymentMethods = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  CREDIT_CARD: "CREDIT_CARD",
  UPI_OR_WALLET: "UPI_OR_WALLET",
} as const;

export type PaymentMethod = (typeof PaymentMethods)[keyof typeof PaymentMethods];

export const TicketCategories = {
  PLUMBING: "PLUMBING",
  ELECTRICAL: "ELECTRICAL",
  CARPENTRY: "CARPENTRY",
  WIFI_NETWORK: "WIFI_NETWORK",
  CLEANING: "CLEANING",
  OTHER: "OTHER",
} as const;

export type TicketCategory = (typeof TicketCategories)[keyof typeof TicketCategories];

export const TicketPriorities = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  URGENT: "URGENT",
} as const;

export type TicketPriority = (typeof TicketPriorities)[keyof typeof TicketPriorities];

export const TicketStatuses = {
  OPEN: "OPEN",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
} as const;

export type TicketStatus = (typeof TicketStatuses)[keyof typeof TicketStatuses];

export const GatePassStatuses = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CHECKED_OUT: "CHECKED_OUT",
  RETURNED: "RETURNED",
  OVERDUE: "OVERDUE",
} as const;

export type GatePassStatus = (typeof GatePassStatuses)[keyof typeof GatePassStatuses];

export const GatePassTypes = {
  DAY_OUTING: "DAY_OUTING",
  NIGHT_OUT: "NIGHT_OUT",
} as const;

export type GatePassType = (typeof GatePassTypes)[keyof typeof GatePassTypes];

export const STANDARD_CURFEW_HOUR = 22; // 10:00 PM
export const STANDARD_DAY_START_HOUR = 6; // 6:00 AM

export const MealTypes = {
  BREAKFAST: "BREAKFAST",
  LUNCH: "LUNCH",
  DINNER: "DINNER",
  SNACKS: "SNACKS",
} as const;

export type MealType = (typeof MealTypes)[keyof typeof MealTypes];

export const MEAL_HOURS: Record<string, number> = {
  BREAKFAST: 9, // 9:00 AM (Cutoff 7:00 AM)
  LUNCH: 13,    // 1:00 PM (Cutoff 11:00 AM)
  SNACKS: 17,   // 5:00 PM (Cutoff 3:00 PM)
  DINNER: 20,   // 8:00 PM (Cutoff 6:00 PM)
};

export const REBATE_AMOUNT_PER_MEAL = 2.5;

export function isMealLocked(targetDate: Date, mealType: string): boolean {
  const mealHour = MEAL_HOURS[mealType] || 12;
  const cutoffTime = new Date(targetDate);
  cutoffTime.setHours(mealHour - 2, 0, 0, 0);

  const now = new Date();
  return now > cutoffTime;
}

