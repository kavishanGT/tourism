from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class SourceCitation(BaseModel):
    citation_id: str
    document_id: str
    file_name: str
    title: str | None = None
    page_number: int | None = None
    section: str | None = None
    source_name: str | None = None
    source_url: str | None = None


class UserProfileContext(BaseModel):
    user_id: str | None = None
    display_name: str | None = None
    first_name: str | None = None
    country_code: str | None = None
    preferred_language: str = "en"
    bio: str | None = None
    travel_styles: list[str] = Field(default_factory=list)
    dietary_preferences: list[str] = Field(default_factory=list)


class UserFavoriteItem(BaseModel):
    entity_type: str
    entity_id: str
    title: str
    category: str | None = None
    region: str | None = None
    slug: str | None = None


class UserTripDayItem(BaseModel):
    title: str
    entity_type: str | None = None
    entity_title: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    notes: str | None = None
    estimated_cost: float | None = None


class UserTripDay(BaseModel):
    day_number: int
    date: str | None = None
    title: str | None = None
    items: list[UserTripDayItem] = Field(default_factory=list)


class UserSavedTrip(BaseModel):
    trip_id: str
    title: str
    description: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    status: str = "DRAFT"
    days: list[UserTripDay] = Field(default_factory=list)


class UserPersonalizationContext(BaseModel):
    profile: UserProfileContext | None = None
    favorites: list[UserFavoriteItem] = Field(default_factory=list)
    saved_trips: list[UserSavedTrip] = Field(default_factory=list)
    active_trip_id: str | None = None


# --- RAG-10: AI Travel Agent Action Models ---

class AgentActionType(str, Enum):
    CREATE_TRIP = "CREATE_TRIP"
    ADD_TRIP_ITEM = "ADD_TRIP_ITEM"
    FAVORITE_ENTITY = "FAVORITE_ENTITY"


class ProposedTripDayItem(BaseModel):
    title: str
    entity_type: str | None = None  # ATTRACTION, EXPERIENCE, RESTAURANT, ACCOMMODATION, ACTIVITY
    entity_slug: str | None = None
    start_time: str | None = None   # "09:00"
    end_time: str | None = None     # "11:30"
    notes: str | None = None
    estimated_cost: float | None = None


class ProposedTripDay(BaseModel):
    day_number: int
    title: str
    items: list[ProposedTripDayItem] = Field(default_factory=list)


class CreateTripPayload(BaseModel):
    title: str
    description: str | None = None
    destination: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    days: list[ProposedTripDay] = Field(default_factory=list)


class AddTripItemPayload(BaseModel):
    trip_id: str | None = None
    trip_title: str | None = None
    day_number: int = 1
    item: ProposedTripDayItem


class FavoriteEntityPayload(BaseModel):
    entity_type: str  # DESTINATION, ATTRACTION, EXPERIENCE, RESTAURANT, ACCOMMODATION
    entity_slug: str | None = None
    title: str


class AgentActionProposal(BaseModel):
    action_type: AgentActionType
    summary: str
    payload: dict[str, Any]


class AgentActionPlan(BaseModel):
    has_action: bool = False
    action_type: AgentActionType | None = None
    trip_proposal: CreateTripPayload | None = None
    add_item_proposal: AddTripItemPayload | None = None
    favorite_proposal: FavoriteEntityPayload | None = None
    summary: str | None = None
