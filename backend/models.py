"""
SafeSphere Backend Data Models (Pydantic v2)
Structured validation for user profiles, emergency assistance requests,
personal contacts, preparedness assessments, and guides.
"""

from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime


class EmergencyCategory(str, Enum):
    MEDICAL = "Medical Assistance"
    FIRE_EVACUATION = "Fire/Evacuation Assistance"
    STRANDED_TRANSPORT = "Stranded / Need Transport"
    ELDERLY_CHILD = "Elderly or Child Assistance"
    LOST_DISORIENTED = "Lost / Disoriented"
    FLOOD_WATER = "Flood / Water Emergency"
    ELECTRICITY_HAZARD = "Electricity Hazard"
    OTHER = "Other"


class EmergencyStatus(str, Enum):
    ACTIVE = "active"
    HELP_OFFERED = "help_offered"
    RESOLVED = "resolved"
    CANCELLED = "cancelled"


# --- User Profile Models ---
class UserProfile(BaseModel):
    id: str
    email: Optional[str] = None
    full_name: str = "SafeSphere Citizen"
    phone_number: Optional[str] = None
    preferred_language: str = "en"
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    approx_location_lat: Optional[float] = None
    approx_location_lng: Optional[float] = None
    approx_location_area: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    preferred_language: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    approx_location_lat: Optional[float] = None
    approx_location_lng: Optional[float] = None
    approx_location_area: Optional[str] = None


# --- Personal Emergency Contacts Models ---
class PersonalContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    relationship: str = Field("Family", max_length=80)
    phone: str = Field(..., min_length=3, max_length=40)


class PersonalContactUpdate(BaseModel):
    name: Optional[str] = None
    relationship: Optional[str] = None
    phone: Optional[str] = None


class PersonalContactResponse(BaseModel):
    id: str
    user_id: str
    name: str
    relationship: str
    phone: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# --- Emergency Request Models ---
class ResponderInfo(BaseModel):
    responder_id: Optional[str] = None
    name: str = "Community Helper"
    phone: Optional[str] = None
    offered_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    note: Optional[str] = None


class EmergencyRequestCreate(BaseModel):
    category: EmergencyCategory
    description: str = Field(..., min_length=5, max_length=1000)
    approx_location_lat: Optional[float] = None
    approx_location_lng: Optional[float] = None
    approx_location_area: Optional[str] = "Nearby Community Area"


class EmergencyRequestOffer(BaseModel):
    name: str = "Community Helper"
    phone: Optional[str] = None
    note: Optional[str] = None


class EmergencyRequestStatusUpdate(BaseModel):
    status: EmergencyStatus


class EmergencyRequestResponse(BaseModel):
    id: str
    user_id: str
    category: str
    description: str
    approx_location_lat: Optional[float] = None
    approx_location_lng: Optional[float] = None
    approx_location_area: Optional[str] = "Nearby Area"
    status: str
    responders: List[Dict[str, Any]] = []
    created_at: str
    updated_at: Optional[str] = None


# --- Assessment & Survey Models ---
class AssessmentSubmit(BaseModel):
    user_id: Optional[str] = None
    score: int
    rating: str
    household_members: Optional[int] = 1
    answers: Optional[Dict[str, Any]] = None


class SurveySubmit(BaseModel):
    user_id: Optional[str] = None
    preparedness_level: Optional[str] = None
    primary_concern: Optional[str] = None
    feedback: Optional[str] = None
    responses: Optional[Dict[str, Any]] = None


# --- General API Response ---
class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "SafeSphere Emergency Information API"
    version: str = "1.0.0"
    timestamp: str
    database_connected: bool
