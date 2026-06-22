import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, real } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const teamMembers = pgTable('team_members', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  detail: text('detail'),
  avatar: text('avatar').notNull(),
  userId: text('user_id').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const salesReports = pgTable('sales_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  salesmanId: text('salesman_id').notNull(),
  salesmanName: text('salesman_name').notNull(),
  totalSales: real('total_sales').notNull(),
  beatName: text('beat_name').notNull(),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  timestamp: text('timestamp').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const damageReports = pgTable('damage_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  salesmanId: text('salesman_id').notNull(),
  salesmanName: text('salesman_name').notNull(),
  shopNo: text('shop_no').notNull(),
  shopName: text('shop_name').notNull(),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const damageItems = pgTable('damage_items', {
  id: serial('id').primaryKey(),
  damageReportId: integer('damage_report_id').references(() => damageReports.id).notNull(),
  product: text('product').notNull(),
  quantity: integer('quantity').notNull(),
  mrp: real('mrp').notNull(),
});

export const collectionReports = pgTable('collection_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  salesmanId: text('salesman_id').notNull(),
  salesmanName: text('salesman_name').notNull(),
  beatName: text('beat_name').notNull(),
  collectionAmount: real('collection_amount').notNull(),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const packingLogs = pgTable('packing_logs', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  memberId: text('member_id').notNull(),
  memberName: text('member_name').notNull(),
  station: integer('station').notNull(),
  productsPacked: integer('products_packed').notNull(),
  lunchStart: text('lunch_start').notNull(),
  lunchEnd: text('lunch_end').notNull(),
  checkoutTime: text('checkout_time').notNull(),
  status: text('status').notNull(),
  efficiency: integer('efficiency').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const returnReports = pgTable('return_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name').notNull(),
  shopNo: text('shop_no').notNull(),
  shopName: text('shop_name').notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  mrp: real('mrp').notNull(),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const mileageReports = pgTable('mileage_reports', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name').notNull(),
  routeId: text('route_id').notNull(),
  startOdo: integer('start_odo').notNull(),
  endOdo: integer('end_odo').notNull(),
  fuelExpenses: real('fuel_expenses').notNull(),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const marketCollections = pgTable('market_collections', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name').notNull(),
  type: text('type').notNull(),
  amount: real('amount').notNull(),
  shopNo: text('shop_no').notNull(),
  shopName: text('shop_name').notNull(),
  referenceNo: text('reference_no'),
  chequeDate: text('cheque_date'),
  status: text('status').notNull().default('Pending'),
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow(),
});
