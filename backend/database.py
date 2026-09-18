"""
SafeSphere Database Connector & Repository
Integrates with Supabase PostgreSQL and Supabase Auth.
Includes in-memory resilient mock fallback for offline or local preview environments.
"""

import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

supabase_client = None

if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("Connected to live Supabase database instance.")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}. Falling back to in-memory store.")
        supabase_client = None
else:
    print("Supabase credentials not configured. Using local in-memory persistence.")


# ==============================================================================
# In-Memory Fallback Store (Used when Supabase is not yet configured)
# ==============================================================================
_IN_MEMORY_PROFILES: Dict[str, Dict[str, Any]] = {
    "demo-user-001": {
        "id": "demo-user-001",
        "email": "citizen@safesphere.org",
        "full_name": "Dr. Sarah Jenkins",
        "phone_number": "+1 (555) 349-2810",
        "preferred_language": "en",
        "emergency_contact_name": "Robert Jenkins",
        "emergency_contact_phone": "+1 (555) 902-4411",
        "approx_location_lat": 37.77,
        "approx_location_lng": -122.42,
        "approx_location_area": "Civic Center District (~1km)",
        "created_at": "2026-01-15T08:00:00Z",
        "updated_at": "2026-09-18T10:00:00Z"
    }
}

_IN_MEMORY_CONTACTS: Dict[str, List[Dict[str, Any]]] = {
    "demo-user-001": [
        {
            "id": "cnt-1",
            "user_id": "demo-user-001",
            "name": "Robert Jenkins",
            "relationship": "Spouse",
            "phone": "+1 (555) 902-4411",
            "created_at": "2026-02-01T12:00:00Z"
        },
        {
            "id": "cnt-2",
            "user_id": "demo-user-001",
            "name": "Dr. Aris Thorne",
            "relationship": "Physician",
            "phone": "+1 (555) 883-2940",
            "created_at": "2026-02-05T14:30:00Z"
        }
    ]
}

_IN_MEMORY_REQUESTS: List[Dict[str, Any]] = [
    {
        "id": "req-101",
        "user_id": "user-neighbour-1",
        "category": "Medical Assistance",
        "description": "Elderly neighbor requires sterile saline and bandage dressing. Mobility limited after stairs slip.",
        "approx_location_lat": 37.78,
        "approx_location_lng": -122.41,
        "approx_location_area": "Northside Residential Block (~1km)",
        "status": "active",
        "responders": [],
        "created_at": "2026-09-18T09:15:00Z",
        "updated_at": "2026-09-18T09:15:00Z"
    },
    {
        "id": "req-102",
        "user_id": "user-neighbour-2",
        "category": "Stranded / Need Transport",
        "description": "Stuck due to localized waterlogging. Need dry transfer assistance to high-ground evacuation shelter.",
        "approx_location_lat": 37.76,
        "approx_location_lng": -122.43,
        "approx_location_area": "Valley Creek Community (~1.2km)",
        "status": "help_offered",
        "responders": [
            {
                "name": "David Miller (CERT Volunteer)",
                "phone": "+1 (555) 234-9912",
                "offered_at": "2026-09-18T09:30:00Z",
                "note": "Bringing high-clearance vehicle."
            }
        ],
        "created_at": "2026-09-18T08:45:00Z",
        "updated_at": "2026-09-18T09:30:00Z"
    }
]

_IN_MEMORY_ASSESSMENTS: List[Dict[str, Any]] = []
_IN_MEMORY_SURVEYS: List[Dict[str, Any]] = []


# ==============================================================================
# Database Operations
# ==============================================================================

def is_database_connected() -> bool:
    return supabase_client is not None


# --- User Profile Operations ---
async def get_profile(user_id: str) -> Optional[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("profiles").select("*").eq("id", user_id).single().execute()
            if res.data:
                return res.data
        except Exception as e:
            print(f"Supabase get_profile error: {e}")
    return _IN_MEMORY_PROFILES.get(user_id)


async def update_profile(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    updates["updated_at"] = datetime.utcnow().isoformat()
    if supabase_client:
        try:
            res = supabase_client.table("profiles").update(updates).eq("id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase update_profile error: {e}")

    profile = _IN_MEMORY_PROFILES.get(user_id, {"id": user_id, "email": "user@safesphere.org"})
    profile.update(updates)
    _IN_MEMORY_PROFILES[user_id] = profile
    return profile


# --- Personal Emergency Contacts Operations ---
async def get_personal_contacts(user_id: str) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("personal_emergency_contacts").select("*").eq("user_id", user_id).order("created_at").execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            print(f"Supabase get_personal_contacts error: {e}")
    return _IN_MEMORY_CONTACTS.get(user_id, [])


async def create_personal_contact(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = str(uuid.uuid4())
    record = {
        "id": new_id,
        "user_id": user_id,
        "name": data["name"],
        "relationship": data.get("relationship", "Family"),
        "phone": data["phone"],
        "created_at": datetime.utcnow().isoformat()
    }
    if supabase_client:
        try:
            res = supabase_client.table("personal_emergency_contacts").insert(record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase create_personal_contact error: {e}")

    if user_id not in _IN_MEMORY_CONTACTS:
        _IN_MEMORY_CONTACTS[user_id] = []
    _IN_MEMORY_CONTACTS[user_id].append(record)
    return record


async def update_personal_contact(user_id: str, contact_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    updates["updated_at"] = datetime.utcnow().isoformat()
    if supabase_client:
        try:
            res = supabase_client.table("personal_emergency_contacts").update(updates).eq("id", contact_id).eq("user_id", user_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase update_personal_contact error: {e}")

    contacts = _IN_MEMORY_CONTACTS.get(user_id, [])
    for c in contacts:
        if c["id"] == contact_id:
            c.update(updates)
            return c
    return None


async def delete_personal_contact(user_id: str, contact_id: str) -> bool:
    if supabase_client:
        try:
            supabase_client.table("personal_emergency_contacts").delete().eq("id", contact_id).eq("user_id", user_id).execute()
            return True
        except Exception as e:
            print(f"Supabase delete_personal_contact error: {e}")

    contacts = _IN_MEMORY_CONTACTS.get(user_id, [])
    _IN_MEMORY_CONTACTS[user_id] = [c for c in contacts if c["id"] != contact_id]
    return True


# --- Emergency Assistance Requests Operations ---
async def get_emergency_requests(category: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            query = supabase_client.table("emergency_requests").select("*").order("created_at", desc=True)
            if category:
                query = query.eq("category", category)
            if status:
                query = query.eq("status", status)
            res = query.execute()
            if res.data is not None:
                return res.data
        except Exception as e:
            print(f"Supabase get_emergency_requests error: {e}")

    items = _IN_MEMORY_REQUESTS
    if category:
        items = [r for r in items if r["category"] == category]
    if status:
        items = [r for r in items if r["status"] == status]
    return sorted(items, key=lambda x: x.get("created_at", ""), reverse=True)


async def create_emergency_request(user_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    new_id = f"req-{uuid.uuid4().hex[:8]}"
    record = {
        "id": new_id,
        "user_id": user_id,
        "category": data["category"],
        "description": data["description"],
        "approx_location_lat": data.get("approx_location_lat"),
        "approx_location_lng": data.get("approx_location_lng"),
        "approx_location_area": data.get("approx_location_area", "Nearby Community Area"),
        "status": "active",
        "responders": [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    if supabase_client:
        try:
            res = supabase_client.table("emergency_requests").insert(record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase create_emergency_request error: {e}")

    _IN_MEMORY_REQUESTS.insert(0, record)
    return record


async def offer_help_on_request(request_id: str, helper_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    now = datetime.utcnow().isoformat()
    helper_record = {
        "name": helper_data.get("name", "Community Citizen"),
        "phone": helper_data.get("phone", ""),
        "note": helper_data.get("note", "I can assist."),
        "offered_at": now
    }

    if supabase_client:
        try:
            # Fetch existing responders
            current = supabase_client.table("emergency_requests").select("responders").eq("id", request_id).single().execute()
            existing_responders = current.data.get("responders", []) if current.data else []
            existing_responders.append(helper_record)
            res = supabase_client.table("emergency_requests").update({
                "status": "help_offered",
                "responders": existing_responders,
                "updated_at": now
            }).eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase offer_help_on_request error: {e}")

    for r in _IN_MEMORY_REQUESTS:
        if r["id"] == request_id:
            r["status"] = "help_offered"
            if "responders" not in r or not isinstance(r["responders"], list):
                r["responders"] = []
            r["responders"].append(helper_record)
            r["updated_at"] = now
            return r
    return None


async def update_request_status(request_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    now = datetime.utcnow().isoformat()
    if supabase_client:
        try:
            res = supabase_client.table("emergency_requests").update({
                "status": new_status,
                "updated_at": now
            }).eq("id", request_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase update_request_status error: {e}")

    for r in _IN_MEMORY_REQUESTS:
        if r["id"] == request_id:
            r["status"] = new_status
            r["updated_at"] = now
            return r
    return None


# --- Assessments and Surveys ---
async def save_assessment(data: Dict[str, Any]) -> Dict[str, Any]:
    record = {
        "id": f"asmt-{uuid.uuid4().hex[:8]}",
        "user_id": data.get("user_id"),
        "score": data["score"],
        "rating": data["rating"],
        "household_members": data.get("household_members", 1),
        "answers": data.get("answers", {}),
        "created_at": datetime.utcnow().isoformat()
    }
    if supabase_client:
        try:
            res = supabase_client.table("assessments").insert(record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase save_assessment error: {e}")
    _IN_MEMORY_ASSESSMENTS.append(record)
    return record


async def save_survey(data: Dict[str, Any]) -> Dict[str, Any]:
    record = {
        "id": f"srv-{uuid.uuid4().hex[:8]}",
        "user_id": data.get("user_id"),
        "preparedness_level": data.get("preparedness_level"),
        "primary_concern": data.get("primary_concern"),
        "feedback": data.get("feedback"),
        "responses": data.get("responses", {}),
        "created_at": datetime.utcnow().isoformat()
    }
    if supabase_client:
        try:
            res = supabase_client.table("surveys").insert(record).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase save_survey error: {e}")
    _IN_MEMORY_SURVEYS.append(record)
    return record
