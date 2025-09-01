"""
BiteBase Intelligence Restaurant Management API Endpoints
Professional restaurant operations management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime, date

from app.core.database import get_db
from app.services.restaurant.restaurant_management_service import RestaurantManagementService
from app.schemas.restaurant_management import (
    StaffCreate, StaffUpdate, StaffResponse,
    ShiftCreate, ShiftUpdate, ShiftResponse,
    InventoryItemCreate, InventoryItemUpdate, InventoryItemResponse,
    TableCreate, TableUpdate, TableResponse,
    ReservationCreate, ReservationUpdate, ReservationResponse,
    OrderCreate, OrderUpdate, OrderResponse
)

router = APIRouter()


# Staff Management Endpoints
@router.post("/restaurants/{restaurant_id}/staff", response_model=StaffResponse)
async def create_staff(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    staff_data: StaffCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new staff member"""
    try:
        service = RestaurantManagementService(db)
        staff = await service.create_staff(restaurant_id, staff_data)
        return staff
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/staff", response_model=List[StaffResponse])
async def get_restaurant_staff(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    active_only: bool = Query(True, description="Return only active staff"),
    db: AsyncSession = Depends(get_db)
):
    """Get all staff members for a restaurant"""
    try:
        service = RestaurantManagementService(db)
        staff = await service.get_restaurant_staff(restaurant_id, active_only)
        return staff
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/staff/{staff_id}", response_model=StaffResponse)
async def update_staff(
    staff_id: str = Path(..., description="Staff ID"),
    staff_data: StaffUpdate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Update staff member information"""
    try:
        service = RestaurantManagementService(db)
        staff = await service.update_staff(staff_id, staff_data)
        if not staff:
            raise HTTPException(status_code=404, detail="Staff member not found")
        return staff
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Shift Management Endpoints
@router.post("/shifts", response_model=ShiftResponse)
async def create_shift(
    shift_data: ShiftCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new shift"""
    try:
        service = RestaurantManagementService(db)
        shift = await service.create_shift(shift_data)
        return shift
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/schedule", response_model=List[ShiftResponse])
async def get_staff_schedule(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    start_date: date = Query(..., description="Start date for schedule"),
    end_date: date = Query(..., description="End date for schedule"),
    db: AsyncSession = Depends(get_db)
):
    """Get staff schedule for a date range"""
    try:
        service = RestaurantManagementService(db)
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        shifts = await service.get_staff_schedule(restaurant_id, start_datetime, end_datetime)
        return shifts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Inventory Management Endpoints
@router.post("/restaurants/{restaurant_id}/inventory", response_model=InventoryItemResponse)
async def create_inventory_item(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    item_data: InventoryItemCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new inventory item"""
    try:
        service = RestaurantManagementService(db)
        item = await service.create_inventory_item(restaurant_id, item_data)
        return item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/inventory", response_model=List[InventoryItemResponse])
async def get_restaurant_inventory(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    low_stock_only: bool = Query(False, description="Return only low stock items"),
    db: AsyncSession = Depends(get_db)
):
    """Get restaurant inventory"""
    try:
        service = RestaurantManagementService(db)
        inventory = await service.get_restaurant_inventory(restaurant_id, low_stock_only)
        return inventory
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/inventory/{item_id}/quantity")
async def update_inventory_quantity(
    item_id: str = Path(..., description="Inventory item ID"),
    quantity_change: float = Query(..., description="Quantity change (positive for additions, negative for usage)"),
    movement_type: str = Query(..., description="Type of movement (purchase, usage, waste, adjustment)"),
    notes: Optional[str] = Query(None, description="Additional notes"),
    db: AsyncSession = Depends(get_db)
):
    """Update inventory quantity"""
    try:
        service = RestaurantManagementService(db)
        success = await service.update_inventory_quantity(item_id, quantity_change, movement_type, notes)
        if not success:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return {"message": "Inventory updated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Table Management Endpoints
@router.post("/restaurants/{restaurant_id}/tables", response_model=TableResponse)
async def create_table(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    table_data: TableCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new table"""
    try:
        service = RestaurantManagementService(db)
        table = await service.create_table(restaurant_id, table_data)
        return table
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/tables", response_model=List[TableResponse])
async def get_restaurant_tables(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    available_only: bool = Query(False, description="Return only available tables"),
    db: AsyncSession = Depends(get_db)
):
    """Get restaurant tables"""
    try:
        service = RestaurantManagementService(db)
        tables = await service.get_restaurant_tables(restaurant_id, available_only)
        return tables
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Reservation Management Endpoints
@router.post("/reservations", response_model=ReservationResponse)
async def create_reservation(
    reservation_data: ReservationCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new reservation"""
    try:
        service = RestaurantManagementService(db)
        reservation = await service.create_reservation(reservation_data)
        return reservation
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/reservations", response_model=List[ReservationResponse])
async def get_restaurant_reservations(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    date: Optional[date] = Query(None, description="Filter by specific date"),
    db: AsyncSession = Depends(get_db)
):
    """Get restaurant reservations"""
    try:
        service = RestaurantManagementService(db)
        filter_date = datetime.combine(date, datetime.min.time()) if date else None
        reservations = await service.get_restaurant_reservations(restaurant_id, filter_date)
        return reservations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Order Management Endpoints
@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate = ...,
    db: AsyncSession = Depends(get_db)
):
    """Create a new order"""
    try:
        service = RestaurantManagementService(db)
        order = await service.create_order(order_data)
        return order
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/orders", response_model=List[OrderResponse])
async def get_restaurant_orders(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    status: Optional[str] = Query(None, description="Filter by order status"),
    date: Optional[date] = Query(None, description="Filter by specific date"),
    db: AsyncSession = Depends(get_db)
):
    """Get restaurant orders"""
    try:
        service = RestaurantManagementService(db)
        filter_date = datetime.combine(date, datetime.min.time()) if date else None
        orders = await service.get_restaurant_orders(restaurant_id, status, filter_date)
        return orders
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/orders/{order_id}/status")
async def update_order_status(
    order_id: str = Path(..., description="Order ID"),
    status: str = Query(..., description="New order status"),
    db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    try:
        service = RestaurantManagementService(db)
        
        # Map status to timestamp field
        timestamp_mapping = {
            "confirmed": None,
            "preparing": "kitchen_time",
            "ready": "ready_time",
            "served": "served_time",
            "completed": "completed_time"
        }
        
        timestamp_field = timestamp_mapping.get(status)
        success = await service.update_order_status(order_id, status, timestamp_field)
        
        if not success:
            raise HTTPException(status_code=404, detail="Order not found")
        
        return {"message": "Order status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Financial Management Endpoints
@router.post("/restaurants/{restaurant_id}/financial-records")
async def create_daily_financial_record(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    record_date: date = Query(..., description="Date for financial record"),
    db: AsyncSession = Depends(get_db)
):
    """Create or update daily financial record"""
    try:
        service = RestaurantManagementService(db)
        record_datetime = datetime.combine(record_date, datetime.min.time())
        record = await service.create_daily_financial_record(restaurant_id, record_datetime)
        return record
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/restaurants/{restaurant_id}/financial-summary")
async def get_financial_summary(
    restaurant_id: str = Path(..., description="Restaurant ID"),
    start_date: date = Query(..., description="Start date for summary"),
    end_date: date = Query(..., description="End date for summary"),
    db: AsyncSession = Depends(get_db)
):
    """Get financial summary for a date range"""
    try:
        service = RestaurantManagementService(db)
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())
        summary = await service.get_financial_summary(restaurant_id, start_datetime, end_datetime)
        return summary
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
