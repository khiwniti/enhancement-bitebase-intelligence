"""
Payment processing endpoints
Based on Express.js payment routes from bitebase-backend-express
Stripe integration for subscription management and billing
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, CurrentUser
from app.core.database import get_db

router = APIRouter()

# Request Models
class CreateCustomerRequest(BaseModel):
    email: EmailStr = Field(..., description="Customer email")
    name: str = Field(..., min_length=1, max_length=100, description="Customer name")
    phone: Optional[str] = Field(None, description="Customer phone number")
    metadata: Optional[Dict[str, str]] = Field(None, description="Additional metadata")

class CreatePaymentIntentRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in cents")
    currency: str = Field(default="usd", description="Currency code")
    subscription_plan: Optional[str] = Field(None, description="Subscription plan ID")
    customer_id: Optional[str] = Field(None, description="Stripe customer ID")
    metadata: Optional[Dict[str, str]] = Field(None, description="Payment metadata")

class CreateSubscriptionRequest(BaseModel):
    customer_id: str = Field(..., description="Stripe customer ID")
    price_id: str = Field(..., description="Stripe price ID")
    payment_method: str = Field(..., description="Payment method ID")
    trial_days: Optional[int] = Field(None, description="Free trial days")

class UpdateSubscriptionRequest(BaseModel):
    subscription_id: str = Field(..., description="Stripe subscription ID")
    price_id: Optional[str] = Field(None, description="New price ID")
    proration: bool = Field(default=True, description="Prorate the change")

class WebhookRequest(BaseModel):
    data: Dict[str, Any] = Field(..., description="Webhook data")
    type: str = Field(..., description="Webhook event type")

# Response Models
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None
    timestamp: str

def create_response(success: bool, message: str, data: Optional[Dict] = None) -> Dict[str, Any]:
    """Create standardized API response"""
    response = {
        'success': success,
        'message': message,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'via': 'BiteBase Payments API'
    }
    
    if data:
        response['data'] = data
        
    return response

def get_pricing_plans() -> List[Dict[str, Any]]:
    """Get available pricing plans"""
    return [
        {
            'id': 'starter',
            'name': 'Starter',
            'description': 'Perfect for small restaurants',
            'price': 29,
            'currency': 'usd',
            'interval': 'month',
            'features': [
                'Basic analytics dashboard',
                'Up to 1 restaurant location',
                'Email support',
                'Data export (CSV)',
                'Basic integrations'
            ],
            'limits': {
                'restaurants': 1,
                'users': 3,
                'api_calls': 1000,
                'data_retention': 12  # months
            }
        },
        {
            'id': 'professional',
            'name': 'Professional',
            'description': 'For growing restaurant businesses',
            'price': 79,
            'currency': 'usd',
            'interval': 'month',
            'features': [
                'Advanced analytics & insights',
                'Up to 5 restaurant locations',
                'Priority support',
                'Advanced data export',
                'All integrations',
                'Custom reports',
                'API access'
            ],
            'limits': {
                'restaurants': 5,
                'users': 10,
                'api_calls': 10000,
                'data_retention': 24  # months
            }
        },
        {
            'id': 'enterprise',
            'name': 'Enterprise',
            'description': 'For restaurant chains and franchises',
            'price': 199,
            'currency': 'usd',
            'interval': 'month',
            'features': [
                'Enterprise analytics suite',
                'Unlimited restaurant locations',
                'Dedicated support',
                'White-label options',
                'Custom integrations',
                'Advanced AI insights',
                'SLA guarantee'
            ],
            'limits': {
                'restaurants': -1,  # unlimited
                'users': -1,  # unlimited
                'api_calls': 100000,
                'data_retention': -1  # unlimited
            }
        }
    ]

@router.get("/plans", response_model=StandardResponse, summary="Get pricing plans")
async def get_plans():
    """
    Get available pricing plans for BiteBase Intelligence
    """
    try:
        plans = get_pricing_plans()
        
        return create_response(
            success=True,
            message="Pricing plans retrieved successfully",
            data={'plans': plans}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to retrieve pricing plans: {str(e)}")
        )

@router.post("/create-customer", response_model=StandardResponse, summary="Create Stripe customer")
async def create_customer(
    request: CreateCustomerRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new Stripe customer for payment processing
    """
    try:
        # In production, this would:
        # 1. Create Stripe customer using stripe.Customer.create()
        # 2. Store customer ID in database
        # 3. Link to user account
        # 4. Handle duplicate prevention
        
        # Mock customer creation
        mock_customer = {
            'id': f'cus_mock_{datetime.now().timestamp()}',
            'email': request.email,
            'name': request.name,
            'phone': request.phone,
            'metadata': request.metadata or {},
            'created': datetime.now(timezone.utc).isoformat(),
            'user_id': current_user.id
        }
        
        return create_response(
            success=True,
            message="Customer created successfully",
            data={'customer': mock_customer}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to create customer: {str(e)}")
        )

@router.post("/payment-intent", response_model=StandardResponse, summary="Create payment intent")
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a payment intent for processing payments
    """
    try:
        # In production, this would:
        # 1. Create Stripe PaymentIntent
        # 2. Set up automatic payment methods
        # 3. Configure confirmation settings
        # 4. Add metadata for tracking
        
        # Mock payment intent
        mock_intent = {
            'id': f'pi_mock_{datetime.now().timestamp()}',
            'amount': request.amount,
            'currency': request.currency,
            'status': 'requires_payment_method',
            'client_secret': f'pi_mock_{datetime.now().timestamp()}_secret_mock',
            'customer': request.customer_id,
            'metadata': {
                'user_id': current_user.id,
                'subscription_plan': request.subscription_plan,
                **(request.metadata or {})
            },
            'created': datetime.now(timezone.utc).isoformat()
        }
        
        return create_response(
            success=True,
            message="Payment intent created successfully",
            data={'payment_intent': mock_intent}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to create payment intent: {str(e)}")
        )

@router.post("/subscribe", response_model=StandardResponse, summary="Create subscription")
async def create_subscription(
    request: CreateSubscriptionRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new subscription for a customer
    """
    try:
        # In production, this would:
        # 1. Create Stripe subscription
        # 2. Attach payment method
        # 3. Set up trial if applicable
        # 4. Update user permissions
        # 5. Send confirmation email
        
        # Mock subscription creation
        mock_subscription = {
            'id': f'sub_mock_{datetime.now().timestamp()}',
            'customer': request.customer_id,
            'status': 'active',
            'current_period_start': datetime.now(timezone.utc).isoformat(),
            'current_period_end': datetime.now(timezone.utc).replace(
                month=datetime.now().month + 1 if datetime.now().month < 12 else 1,
                year=datetime.now().year + (1 if datetime.now().month == 12 else 0)
            ).isoformat(),
            'trial_end': None,
            'items': {
                'data': [{
                    'price': {
                        'id': request.price_id,
                        'nickname': 'Professional Plan',
                        'unit_amount': 7900,
                        'currency': 'usd'
                    }
                }]
            },
            'latest_invoice': {
                'payment_intent': {
                    'status': 'succeeded'
                }
            }
        }
        
        return create_response(
            success=True,
            message="Subscription created successfully",
            data={'subscription': mock_subscription}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to create subscription: {str(e)}")
        )

@router.get("/subscriptions", response_model=StandardResponse, summary="Get user subscriptions")
async def get_subscriptions(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all subscriptions for the current user
    """
    try:
        # In production, this would:
        # 1. Query user's Stripe customer ID
        # 2. Retrieve subscriptions from Stripe
        # 3. Enrich with local data
        # 4. Format for frontend consumption
        
        # Mock subscriptions
        mock_subscriptions = [
            {
                'id': 'sub_mock_123',
                'status': 'active',
                'plan': {
                    'id': 'professional',
                    'name': 'Professional',
                    'amount': 7900,
                    'currency': 'usd',
                    'interval': 'month'
                },
                'current_period_start': '2024-01-01T00:00:00Z',
                'current_period_end': '2024-02-01T00:00:00Z',
                'trial_end': None,
                'cancel_at_period_end': False
            }
        ]
        
        return create_response(
            success=True,
            message="Subscriptions retrieved successfully",
            data={'subscriptions': mock_subscriptions}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to retrieve subscriptions: {str(e)}")
        )

@router.get("/history", response_model=StandardResponse, summary="Get payment history")
async def get_payment_history(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get payment history for the current user
    """
    try:
        # In production, this would:
        # 1. Query payment records from database
        # 2. Retrieve invoice data from Stripe
        # 3. Format payment history
        # 4. Include refunds and disputes
        
        # Mock payment history
        mock_history = [
            {
                'id': 'pi_mock_1',
                'amount': 7900,
                'currency': 'usd',
                'status': 'succeeded',
                'description': 'Professional Plan - Monthly',
                'created': '2024-01-01T00:00:00Z',
                'invoice_url': 'https://invoice.stripe.com/mock_invoice'
            },
            {
                'id': 'pi_mock_2',
                'amount': 7900,
                'currency': 'usd',
                'status': 'succeeded',
                'description': 'Professional Plan - Monthly',
                'created': '2023-12-01T00:00:00Z',
                'invoice_url': 'https://invoice.stripe.com/mock_invoice_2'
            }
        ]
        
        return create_response(
            success=True,
            message="Payment history retrieved successfully",
            data={'payments': mock_history}
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Failed to retrieve payment history: {str(e)}")
        )

@router.post("/webhook", summary="Stripe webhook handler")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhook events
    Processes subscription updates, payment confirmations, etc.
    """
    try:
        # In production, this would:
        # 1. Verify webhook signature
        # 2. Parse event data
        # 3. Handle different event types
        # 4. Update database accordingly
        # 5. Send notifications if needed
        
        payload = await request.body()
        
        # Mock webhook processing
        mock_response = {
            'received': True,
            'processed_at': datetime.now(timezone.utc).isoformat(),
            'events_handled': [
                'payment_intent.succeeded',
                'invoice.payment_succeeded',
                'customer.subscription.updated'
            ]
        }
        
        return create_response(
            success=True,
            message="Webhook processed successfully",
            data=mock_response
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=create_response(False, f"Webhook processing failed: {str(e)}")
        )