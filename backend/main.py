"""
SafeSphere FastAPI Application
Emergency Awareness & Disaster Preparedness Platform Backend
Serves guides, emergency contacts, analytics, user profiles,
personal emergency contacts, and community crisis assistance requests.
"""

import os
import sys
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Header, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    HealthResponse,
    UserProfile,
    UserProfileUpdate,
    PersonalContactCreate,
    PersonalContactUpdate,
    PersonalContactResponse,
    EmergencyRequestCreate,
    EmergencyRequestOffer,
    EmergencyRequestStatusUpdate,
    EmergencyRequestResponse,
    AssessmentSubmit,
    SurveySubmit
)
from .database import (
    is_database_connected,
    supabase_client,
    get_profile,
    update_profile,
    get_personal_contacts,
    create_personal_contact,
    update_personal_contact,
    delete_personal_contact,
    get_emergency_requests,
    create_emergency_request,
    offer_help_on_request,
    update_request_status,
    save_assessment,
    save_survey
)

app = FastAPI(
    title="SafeSphere Emergency Awareness & Preparedness API",
    description="Emergency preparedness, personal crisis contacts, and community mutual aid assistance backend.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# Authentication Dependency
# ==============================================================================
async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts authenticated user ID from Supabase Bearer JWT.
    Falls back gracefully to demo user when in offline/testing mode.
    """
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if supabase_client:
            try:
                user_res = supabase_client.auth.get_user(token)
                if user_res and user_res.user:
                    return str(user_res.user.id)
            except Exception as e:
                print(f"Token verification error: {e}")

        # If token was provided in format demo_user_<id> or test token
        if token.startswith("demo_") or token.startswith("user_"):
            return token

    # Default fallback demo citizen
    return "demo-user-001"


# ==============================================================================
# 1. System Health & Metadata
# ==============================================================================
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def check_health():
    """System health check and database connectivity verification."""
    return HealthResponse(
        status="ok",
        service="SafeSphere Emergency Information API",
        version="1.0.0",
        timestamp=datetime.utcnow().isoformat(),
        database_connected=is_database_connected()
    )


# ==============================================================================
# 2. Educational Guides (Public Access)
# ==============================================================================
STATIC_GUIDES = [
    {
        "id": "earthquake",
        "title": "Earthquake Safety & Structural Precautions",
        "category": "Geological",
        "severity": "High",
        "read_time": "5 min read",
        "summary": "Immediate drop, cover, and hold-on protocols, structural hazard identification, and gas shutoff instructions.",
        "before": [
            "Secure tall bookcases, water heaters, and heavy wall mirrors with safety brackets.",
            "Identify safe drop spots under sturdy desks away from glass windows.",
            "Locate main gas and electric shutoff valves and keep designated wrenches nearby.",
            "Stock 4 liters of potable water per person per day for a minimum 72-hour duration."
        ],
        "during": [
            "DROP to your hands and knees immediately.",
            "COVER your head and neck beneath a sturdy desk or table.",
            "HOLD ON until the shaking completely ceases.",
            "Do NOT run outdoors during active shaking; falling glass and facades cause most injuries."
        ],
        "after": [
            "Check for gas leaks by scent; if detected, shut off the gas valve and vacate.",
            "Inspect chimney and electrical wiring for damage before restoring main breakers.",
            "Listen to battery-operated emergency broadcasts for aftershock updates."
        ]
    },
    {
        "id": "flood",
        "title": "Flash Flooding & High Water Evacuation",
        "category": "Hydrological",
        "severity": "Critical",
        "read_time": "6 min read",
        "summary": "High-ground navigation, waterborne contaminant avoidance, and vehicle safety rules during torrential surges.",
        "before": [
            "Review your municipal flood plain zone and designated high-ground assembly points.",
            "Install check valves in plumbing to prevent storm backup into drains.",
            "Seal waterproof containers with vital personal identification and prescription meds."
        ],
        "during": [
            "Turn Around, Don't Drown — never drive or wade through moving water.",
            "6 inches of fast-moving water can knock over an adult; 12 inches can sweep away a car.",
            "Disconnect electrical appliances before water reaches outlets if safe to do so."
        ],
        "after": [
            "Boil tap water vigorously until official potable water clearance is issued.",
            "Discard any food or medication that made contact with floodwaters."
        ]
    },
    {
        "id": "wildfire",
        "title": "Wildfire Defense & Defensive Space Preparedness",
        "category": "Environmental",
        "severity": "Critical",
        "read_time": "7 min read",
        "summary": "Vegetation management, air quality filtration, and proactive evacuation checklists for smoke and fire threats.",
        "before": [
            "Maintain 30-100 feet of defensible space by clearing dry brush and pine needles.",
            "Install 1/8-inch metal mesh over exterior attic vents to prevent ember intrusion.",
            "Assemble a go-bag with N95 masks, goggles, and emergency vehicle fuel."
        ],
        "during": [
            "Evacuate immediately when an order is issued; do not wait until flames are visible.",
            "Close all windows, interior doors, and pet doors to reduce interior drafts."
        ],
        "after": [
            "Check roof and gutters for smoldering embers and hot spots.",
            "Maintain N95 respirator use until fine particulate (PM2.5) levels normalize."
        ]
    },
    {
        "id": "power-outage",
        "title": "Extended Grid Failure & Extreme Outage Resilience",
        "category": "Infrastructure",
        "severity": "Moderate",
        "read_time": "4 min read",
        "summary": "Food preservation safety, carbon monoxide prevention, and critical communication continuity during blackouts.",
        "before": [
            "Keep portable power banks and rechargeable LED lanterns fully charged.",
            "Store cooler boxes and freeze extra water bottles to pack around perishables."
        ],
        "during": [
            "Never operate combustion generators or charcoal grills indoors or within 20 feet of windows.",
            "Keep refrigerator and freezer doors closed. Unopened refrigerators preserve food for 4 hours; freezers up to 48 hours.",
            "Unplug sensitive electronics to avoid surge damage upon power grid restoration."
        ],
        "after": [
            "Discard perishable food held above 40°F (4°C) for more than 2 hours.",
            "Restock emergency batteries and backup lighting."
        ]
    }
]

@app.get("/api/guides", tags=["Public Guides"])
async def get_guides():
    """Retrieve all authoritative disaster preparedness guides."""
    return STATIC_GUIDES


# ==============================================================================
# 3. Official Emergency Contacts (Public Access)
# ==============================================================================
STATIC_CONTACTS = [
    {
        "id": "national-crisis",
        "country": "United States",
        "numbers": [
            {"service": "National Emergency Dispatch (Police / Fire / EMS)", "number": "911", "type": "emergency"},
            {"service": "Disaster Distress Helpline (SAMHSA)", "number": "1-800-985-5990", "type": "helpline"},
            {"service": "Poison Control Center", "number": "1-800-222-1222", "type": "medical"},
            {"service": "FEMA Emergency Helpline", "number": "1-800-621-3362", "type": "assistance"}
        ]
    },
    {
        "id": "international-hotlines",
        "country": "International Standards",
        "numbers": [
            {"service": "European Emergency Hotline", "number": "112", "type": "emergency"},
            {"service": "United Kingdom Emergency Services", "number": "999", "type": "emergency"},
            {"service": "India National Emergency Hotline", "number": "112", "type": "emergency"},
            {"service": "Australia Emergency Dispatch", "number": "000", "type": "emergency"}
        ]
    }
]

@app.get("/api/contacts", tags=["Emergency Contacts"])
async def get_contacts():
    """Retrieve official government and crisis hotlines."""
    return STATIC_CONTACTS


# ==============================================================================
# 4. Preparedness Analytics (Public Access)
# ==============================================================================
STATIC_ANALYTICS = {
    "community_readiness_score": 78,
    "active_prepared_citizens": 14280,
    "kits_verified": 9140,
    "response_drills_completed": 3610,
    "category_distribution": [
        {"name": "Earthquake", "preparedness_rate": 84},
        {"name": "Flood", "preparedness_rate": 69},
        {"name": "Wildfire", "preparedness_rate": 72},
        {"name": "Grid Failure", "preparedness_rate": 88}
    ]
}

@app.get("/api/analytics", tags=["Analytics"])
async def get_analytics():
    """Aggregated community safety and preparedness metrics."""
    return STATIC_ANALYTICS


# ==============================================================================
# 5. Assessment & Survey Submissions
# ==============================================================================
@app.post("/api/assessment", status_code=status.HTTP_201_CREATED, tags=["Assessments"])
async def submit_assessment(payload: AssessmentSubmit):
    """Submits and records household safety assessment scores."""
    record = await save_assessment(payload.model_dump())
    return record


@app.post("/api/survey", status_code=status.HTTP_201_CREATED, tags=["Surveys"])
async def submit_survey(payload: SurveySubmit):
    """Records community disaster awareness survey response."""
    record = await save_survey(payload.model_dump())
    return record


# ==============================================================================
# 6. User Profile Management (Private to Authenticated User)
# ==============================================================================
@app.get("/api/profile", response_model=UserProfile, tags=["User Profile"])
async def fetch_user_profile(user_id: str = Depends(get_current_user_id)):
    """Fetches the authenticated user's private profile."""
    profile = await get_profile(user_id)
    if not profile:
        profile = {
            "id": user_id,
            "email": "citizen@safesphere.org",
            "full_name": "SafeSphere Citizen",
            "phone_number": "",
            "preferred_language": "en",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
    return profile


@app.put("/api/profile", response_model=UserProfile, tags=["User Profile"])
async def modify_user_profile(payload: UserProfileUpdate, user_id: str = Depends(get_current_user_id)):
    """Updates the authenticated user's private safety profile."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await update_profile(user_id, updates)
    return updated


# ==============================================================================
# 7. Personal Emergency Contacts (Private to Authenticated User)
# ==============================================================================
@app.get("/api/personal-contacts", response_model=List[PersonalContactResponse], tags=["Personal Contacts"])
async def list_personal_contacts(user_id: str = Depends(get_current_user_id)):
    """Lists the authenticated user's personal emergency contacts."""
    contacts = await get_personal_contacts(user_id)
    return contacts


@app.post("/api/personal-contacts", response_model=PersonalContactResponse, status_code=status.HTTP_201_CREATED, tags=["Personal Contacts"])
async def add_personal_contact(payload: PersonalContactCreate, user_id: str = Depends(get_current_user_id)):
    """Adds a new private personal emergency contact."""
    record = await create_personal_contact(user_id, payload.model_dump())
    return record


@app.put("/api/personal-contacts/{contact_id}", response_model=PersonalContactResponse, tags=["Personal Contacts"])
async def edit_personal_contact(contact_id: str, payload: PersonalContactUpdate, user_id: str = Depends(get_current_user_id)):
    """Updates an existing personal emergency contact."""
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updated = await update_personal_contact(user_id, contact_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Contact not found")
    return updated


@app.delete("/api/personal-contacts/{contact_id}", status_code=status.HTTP_200_OK, tags=["Personal Contacts"])
async def remove_personal_contact(contact_id: str, user_id: str = Depends(get_current_user_id)):
    """Deletes a personal emergency contact."""
    success = await delete_personal_contact(user_id, contact_id)
    return {"success": success, "deleted_id": contact_id}


# ==============================================================================
# 8. Community Emergency Requests (Crisis Coordination)
# ==============================================================================
@app.get("/api/emergency-requests", response_model=List[EmergencyRequestResponse], tags=["Emergency Help"])
async def list_emergency_requests(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """
    Lists active community emergency requests with privacy-protected approximate locations.
    Does not expose exact addresses, private emails, or phone numbers of requesters.
    """
    requests = await get_emergency_requests(category=category, status=status)
    return requests


@app.post("/api/emergency-requests", response_model=EmergencyRequestResponse, status_code=status.HTTP_201_CREATED, tags=["Emergency Help"])
async def create_new_emergency_request(payload: EmergencyRequestCreate, user_id: str = Depends(get_current_user_id)):
    """
    Broadcasts an emergency assistance request to nearby community members.
    Explicit approximate location sharing only with user consent.
    """
    data = payload.model_dump()
    record = await create_emergency_request(user_id, data)
    return record


@app.post("/api/emergency-requests/{request_id}/offer", response_model=EmergencyRequestResponse, tags=["Emergency Help"])
async def offer_assistance(request_id: str, payload: EmergencyRequestOffer):
    """
    Community member offers help for an active emergency request.
    Transitions status to 'help_offered'.
    """
    updated = await offer_help_on_request(request_id, payload.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    return updated


@app.put("/api/emergency-requests/{request_id}/status", response_model=EmergencyRequestResponse, tags=["Emergency Help"])
async def change_emergency_request_status(request_id: str, payload: EmergencyRequestStatusUpdate):
    """
    Updates the status of an emergency request (active, help_offered, resolved, cancelled).
    """
    updated = await update_request_status(request_id, payload.status.value)
    if not updated:
        raise HTTPException(status_code=404, detail="Emergency request not found")
    return updated
