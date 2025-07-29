"""
BiteBase Intelligence Restaurant Management Service
Professional restaurant operations management
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func, or_
from typing import Optional, List, Dict, Any
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.restaurant import Staff, Shift, InventoryItem
from app.models.restaurant_management import (
    StockMovement, Table, Reservation, Order, OrderItem, Transaction, FinancialRecord
)
from app.schemas.restaurant_management import (
    StaffCreate, StaffUpdate, ShiftCreate, InventoryItemCreate, InventoryItemUpdate,
    TableCreate, ReservationCreate, OrderCreate, OrderItemCreate
)


class RestaurantManagementService:
    """Service class for restaurant management operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # Staff Management
    async def create_staff(self, restaurant_id: str, staff_data: StaffCreate) -> Staff:
        """Create a new staff member"""
        try:
            staff = Staff(
                restaurant_id=restaurant_id,
                first_name=staff_data.first_name,
                last_name=staff_data.last_name,
                email=staff_data.email,
                phone=staff_data.phone,
                address=staff_data.address,
                employee_id=staff_data.employee_id,
                role=staff_data.role,
                employment_status=staff_data.employment_status,
                hire_date=staff_data.hire_date,
                hourly_rate=staff_data.hourly_rate,
                salary=staff_data.salary,
                commission_rate=staff_data.commission_rate,
                weekly_hours=staff_data.weekly_hours,
                availability=staff_data.availability,
                emergency_contact_name=staff_data.emergency_contact_name,
                emergency_contact_phone=staff_data.emergency_contact_phone
            )
            
            self.db.add(staff)
            await self.db.commit()
            await self.db.refresh(staff)
            return staff
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create staff member: {str(e)}")
    
    async def get_restaurant_staff(self, restaurant_id: str, active_only: bool = True) -> List[Staff]:
        """Get all staff members for a restaurant"""
        try:
            query = select(Staff).where(Staff.restaurant_id == restaurant_id)
            
            if active_only:
                query = query.where(Staff.employment_status == "active")
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant staff: {str(e)}")
    
    async def update_staff(self, staff_id: str, staff_data: StaffUpdate) -> Optional[Staff]:
        """Update staff member information"""
        try:
            staff = await self.db.get(Staff, staff_id)
            if not staff:
                return None
            
            update_data = staff_data.dict(exclude_unset=True)
            if update_data:
                update_data['updated_at'] = datetime.utcnow()
                
                query = update(Staff).where(Staff.id == staff_id).values(**update_data)
                await self.db.execute(query)
                await self.db.commit()
                await self.db.refresh(staff)
            
            return staff
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to update staff: {str(e)}")
    
    # Shift Management
    async def create_shift(self, shift_data: ShiftCreate) -> Shift:
        """Create a new shift"""
        try:
            shift = Shift(
                staff_id=shift_data.staff_id,
                restaurant_id=shift_data.restaurant_id,
                shift_date=shift_data.shift_date,
                start_time=shift_data.start_time,
                end_time=shift_data.end_time,
                scheduled_hours=shift_data.scheduled_hours,
                break_duration=shift_data.break_duration,
                notes=shift_data.notes
            )
            
            self.db.add(shift)
            await self.db.commit()
            await self.db.refresh(shift)
            return shift
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create shift: {str(e)}")
    
    async def get_staff_schedule(self, restaurant_id: str, start_date: datetime, end_date: datetime) -> List[Shift]:
        """Get staff schedule for a date range"""
        try:
            query = select(Shift).where(
                and_(
                    Shift.restaurant_id == restaurant_id,
                    Shift.shift_date >= start_date,
                    Shift.shift_date <= end_date
                )
            ).order_by(Shift.shift_date, Shift.start_time)
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to get staff schedule: {str(e)}")
    
    # Inventory Management
    async def create_inventory_item(self, restaurant_id: str, item_data: InventoryItemCreate) -> InventoryItem:
        """Create a new inventory item"""
        try:
            item = InventoryItem(
                restaurant_id=restaurant_id,
                name=item_data.name,
                description=item_data.description,
                category=item_data.category,
                sku=item_data.sku,
                current_quantity=item_data.current_quantity,
                unit_of_measure=item_data.unit_of_measure,
                minimum_quantity=item_data.minimum_quantity,
                maximum_quantity=item_data.maximum_quantity,
                unit_cost=item_data.unit_cost,
                supplier_name=item_data.supplier_name,
                supplier_contact=item_data.supplier_contact,
                expiration_date=item_data.expiration_date,
                is_perishable=item_data.is_perishable,
                requires_refrigeration=item_data.requires_refrigeration
            )
            
            # Calculate total value
            item.total_value = item.current_quantity * item.unit_cost
            
            self.db.add(item)
            await self.db.commit()
            await self.db.refresh(item)
            return item
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create inventory item: {str(e)}")
    
    async def get_restaurant_inventory(self, restaurant_id: str, low_stock_only: bool = False) -> List[InventoryItem]:
        """Get restaurant inventory"""
        try:
            query = select(InventoryItem).where(
                and_(
                    InventoryItem.restaurant_id == restaurant_id,
                    InventoryItem.is_active == True
                )
            )
            
            if low_stock_only:
                query = query.where(InventoryItem.current_quantity <= InventoryItem.minimum_quantity)
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant inventory: {str(e)}")
    
    async def update_inventory_quantity(self, item_id: str, quantity_change: float, movement_type: str, notes: str = None) -> bool:
        """Update inventory quantity and record movement"""
        try:
            item = await self.db.get(InventoryItem, item_id)
            if not item:
                return False
            
            # Update quantity
            new_quantity = item.current_quantity + quantity_change
            if new_quantity < 0:
                raise ValueError("Insufficient inventory quantity")
            
            item.current_quantity = new_quantity
            item.total_value = new_quantity * item.unit_cost
            item.updated_at = datetime.utcnow()
            
            # Record stock movement
            movement = StockMovement(
                inventory_item_id=item_id,
                restaurant_id=item.restaurant_id,
                movement_type=movement_type,
                quantity_change=quantity_change,
                unit_cost=item.unit_cost,
                total_cost=abs(quantity_change) * item.unit_cost,
                notes=notes
            )
            
            self.db.add(movement)
            await self.db.commit()
            return True
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to update inventory: {str(e)}")
    
    # Table Management
    async def create_table(self, restaurant_id: str, table_data: TableCreate) -> Table:
        """Create a new table"""
        try:
            table = Table(
                restaurant_id=restaurant_id,
                table_number=table_data.table_number,
                seating_capacity=table_data.seating_capacity,
                table_type=table_data.table_type,
                location_area=table_data.location_area,
                has_power_outlet=table_data.has_power_outlet,
                is_wheelchair_accessible=table_data.is_wheelchair_accessible,
                has_view=table_data.has_view,
                is_private=table_data.is_private
            )
            
            self.db.add(table)
            await self.db.commit()
            await self.db.refresh(table)
            return table
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create table: {str(e)}")
    
    async def get_restaurant_tables(self, restaurant_id: str, available_only: bool = False) -> List[Table]:
        """Get restaurant tables"""
        try:
            query = select(Table).where(
                and_(
                    Table.restaurant_id == restaurant_id,
                    Table.is_active == True
                )
            )
            
            if available_only:
                query = query.where(Table.status == "available")
            
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant tables: {str(e)}")
    
    # Reservation Management
    async def create_reservation(self, reservation_data: ReservationCreate) -> Reservation:
        """Create a new reservation"""
        try:
            reservation = Reservation(
                table_id=reservation_data.table_id,
                restaurant_id=reservation_data.restaurant_id,
                customer_name=reservation_data.customer_name,
                customer_phone=reservation_data.customer_phone,
                customer_email=reservation_data.customer_email,
                party_size=reservation_data.party_size,
                reservation_date=reservation_data.reservation_date,
                reservation_time=reservation_data.reservation_time,
                duration_minutes=reservation_data.duration_minutes,
                special_requests=reservation_data.special_requests,
                dietary_restrictions=reservation_data.dietary_restrictions,
                occasion=reservation_data.occasion
            )
            
            self.db.add(reservation)
            await self.db.commit()
            await self.db.refresh(reservation)
            return reservation
            
        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create reservation: {str(e)}")
    
    async def get_restaurant_reservations(self, restaurant_id: str, date: datetime = None) -> List[Reservation]:
        """Get restaurant reservations"""
        try:
            query = select(Reservation).where(Reservation.restaurant_id == restaurant_id)
            
            if date:
                start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = start_of_day + timedelta(days=1)
                query = query.where(
                    and_(
                        Reservation.reservation_date >= start_of_day,
                        Reservation.reservation_date < end_of_day
                    )
                )
            
            query = query.order_by(Reservation.reservation_time)
            result = await self.db.execute(query)
            return result.scalars().all()
            
        except Exception as e:
            raise Exception(f"Failed to get restaurant reservations: {str(e)}")

    # Order Management
    async def create_order(self, order_data: OrderCreate) -> Order:
        """Create a new order with items"""
        try:
            # Generate unique order number
            order_number = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

            # Calculate totals
            subtotal = sum(item.quantity * item.unit_price for item in order_data.order_items)
            tax_rate = Decimal('0.08')  # 8% tax rate - should be configurable
            tax_amount = subtotal * tax_rate
            total_amount = subtotal + tax_amount

            order = Order(
                restaurant_id=order_data.restaurant_id,
                table_id=order_data.table_id,
                server_id=order_data.server_id,
                order_number=order_number,
                order_type=order_data.order_type,
                customer_count=order_data.customer_count,
                customer_name=order_data.customer_name,
                customer_phone=order_data.customer_phone,
                customer_email=order_data.customer_email,
                delivery_address=order_data.delivery_address,
                special_instructions=order_data.special_instructions,
                dietary_notes=order_data.dietary_notes,
                subtotal=subtotal,
                tax_amount=tax_amount,
                total_amount=total_amount
            )

            self.db.add(order)
            await self.db.flush()  # Get the order ID

            # Add order items
            for item_data in order_data.order_items:
                order_item = OrderItem(
                    order_id=order.id,
                    menu_item_id=item_data.menu_item_id,
                    item_name=item_data.item_name,
                    quantity=item_data.quantity,
                    unit_price=item_data.unit_price,
                    total_price=item_data.quantity * item_data.unit_price,
                    modifications=item_data.modifications,
                    special_instructions=item_data.special_instructions
                )
                self.db.add(order_item)

            await self.db.commit()
            await self.db.refresh(order)
            return order

        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create order: {str(e)}")

    async def get_restaurant_orders(self, restaurant_id: str, status: str = None, date: datetime = None) -> List[Order]:
        """Get restaurant orders"""
        try:
            query = select(Order).where(Order.restaurant_id == restaurant_id)

            if status:
                query = query.where(Order.status == status)

            if date:
                start_of_day = date.replace(hour=0, minute=0, second=0, microsecond=0)
                end_of_day = start_of_day + timedelta(days=1)
                query = query.where(
                    and_(
                        Order.order_time >= start_of_day,
                        Order.order_time < end_of_day
                    )
                )

            query = query.order_by(Order.order_time.desc())
            result = await self.db.execute(query)
            return result.scalars().all()

        except Exception as e:
            raise Exception(f"Failed to get restaurant orders: {str(e)}")

    async def update_order_status(self, order_id: str, status: str, timestamp_field: str = None) -> bool:
        """Update order status and related timestamp"""
        try:
            update_data = {"status": status, "updated_at": datetime.utcnow()}

            if timestamp_field:
                update_data[timestamp_field] = datetime.utcnow()

            query = update(Order).where(Order.id == order_id).values(**update_data)
            result = await self.db.execute(query)
            await self.db.commit()

            return result.rowcount > 0

        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to update order status: {str(e)}")

    # Financial Management
    async def create_daily_financial_record(self, restaurant_id: str, record_date: datetime) -> FinancialRecord:
        """Create or update daily financial record"""
        try:
            # Check if record already exists
            existing_record = await self.db.execute(
                select(FinancialRecord).where(
                    and_(
                        FinancialRecord.restaurant_id == restaurant_id,
                        FinancialRecord.record_date == record_date.date(),
                        FinancialRecord.period_type == "daily"
                    )
                )
            )
            record = existing_record.scalar_one_or_none()

            # Calculate daily metrics from orders
            start_of_day = record_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = start_of_day + timedelta(days=1)

            orders_query = select(Order).where(
                and_(
                    Order.restaurant_id == restaurant_id,
                    Order.order_time >= start_of_day,
                    Order.order_time < end_of_day,
                    Order.status.in_(["completed", "served"])
                )
            )
            orders_result = await self.db.execute(orders_query)
            orders = orders_result.scalars().all()

            # Calculate metrics
            gross_revenue = sum(order.total_amount for order in orders)
            tax_collected = sum(order.tax_amount for order in orders)
            tips_collected = sum(order.tip_amount for order in orders)
            discounts_given = sum(order.discount_amount for order in orders)
            net_revenue = gross_revenue - discounts_given
            total_orders = len(orders)
            total_customers = sum(order.customer_count for order in orders)
            avg_order_value = gross_revenue / total_orders if total_orders > 0 else Decimal('0')

            # Payment method breakdown
            cash_sales = sum(order.total_amount for order in orders if order.payment_method == "cash")
            card_sales = sum(order.total_amount for order in orders if order.payment_method == "card")
            digital_wallet_sales = sum(order.total_amount for order in orders if order.payment_method == "digital_wallet")

            if record:
                # Update existing record
                record.gross_revenue = gross_revenue
                record.net_revenue = net_revenue
                record.tax_collected = tax_collected
                record.tips_collected = tips_collected
                record.discounts_given = discounts_given
                record.total_orders = total_orders
                record.total_customers = total_customers
                record.average_order_value = avg_order_value
                record.cash_sales = cash_sales
                record.card_sales = card_sales
                record.digital_wallet_sales = digital_wallet_sales
                record.updated_at = datetime.utcnow()
            else:
                # Create new record
                record = FinancialRecord(
                    restaurant_id=restaurant_id,
                    record_date=record_date,
                    period_type="daily",
                    gross_revenue=gross_revenue,
                    net_revenue=net_revenue,
                    tax_collected=tax_collected,
                    tips_collected=tips_collected,
                    discounts_given=discounts_given,
                    total_orders=total_orders,
                    total_customers=total_customers,
                    average_order_value=avg_order_value,
                    cash_sales=cash_sales,
                    card_sales=card_sales,
                    digital_wallet_sales=digital_wallet_sales
                )
                self.db.add(record)

            await self.db.commit()
            await self.db.refresh(record)
            return record

        except Exception as e:
            await self.db.rollback()
            raise Exception(f"Failed to create financial record: {str(e)}")

    async def get_financial_summary(self, restaurant_id: str, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Get financial summary for a date range"""
        try:
            query = select(FinancialRecord).where(
                and_(
                    FinancialRecord.restaurant_id == restaurant_id,
                    FinancialRecord.record_date >= start_date.date(),
                    FinancialRecord.record_date <= end_date.date()
                )
            ).order_by(FinancialRecord.record_date)

            result = await self.db.execute(query)
            records = result.scalars().all()

            if not records:
                return {
                    "total_revenue": Decimal('0'),
                    "total_orders": 0,
                    "average_order_value": Decimal('0'),
                    "total_customers": 0,
                    "records": []
                }

            total_revenue = sum(record.gross_revenue for record in records)
            total_orders = sum(record.total_orders for record in records)
            total_customers = sum(record.total_customers for record in records)
            avg_order_value = total_revenue / total_orders if total_orders > 0 else Decimal('0')

            return {
                "total_revenue": total_revenue,
                "total_orders": total_orders,
                "average_order_value": avg_order_value,
                "total_customers": total_customers,
                "records": records
            }

        except Exception as e:
            raise Exception(f"Failed to get financial summary: {str(e)}")
