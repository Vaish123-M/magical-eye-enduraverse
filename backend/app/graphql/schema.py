"""GraphQL schema using Strawberry."""
import strawberry
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.inspection import Inspection
from app.models.user import User


@strawberry.type
class InspectionType:
    id: int
    status: str
    prediction: str
    defect_class: int
    defect_type: Optional[str]
    confidence: float
    part_id: Optional[str]
    product_id: Optional[str]
    device_id: Optional[str]
    created_at: datetime
    image_path: str


@strawberry.type
class UserType:
    id: int
    username: str
    role: str
    is_active: bool
    created_at: datetime


@strawberry.type
class Query:
    @strawberry.field
    def inspections(self, limit: int = 10, skip: int = 0) -> List[InspectionType]:
        """Get list of inspections."""
        db = next(get_db())
        try:
            inspections = db.query(Inspection).offset(skip).limit(limit).all()
            return [
                InspectionType(
                    id=i.id,
                    status=i.status,
                    prediction=i.prediction,
                    defect_class=i.defect_class,
                    defect_type=i.defect_type,
                    confidence=i.confidence,
                    part_id=i.part_id,
                    product_id=i.product_id,
                    device_id=i.device_id,
                    created_at=i.created_at,
                    image_path=i.image_path
                )
                for i in inspections
            ]
        finally:
            db.close()

    @strawberry.field
    def inspection(self, id: int) -> Optional[InspectionType]:
        """Get a single inspection by ID."""
        db = next(get_db())
        try:
            inspection = db.query(Inspection).filter(Inspection.id == id).first()
            if not inspection:
                return None
            return InspectionType(
                id=inspection.id,
                status=inspection.status,
                prediction=inspection.prediction,
                defect_class=inspection.defect_class,
                defect_type=inspection.defect_type,
                confidence=inspection.confidence,
                part_id=inspection.part_id,
                product_id=inspection.product_id,
                device_id=inspection.device_id,
                created_at=inspection.created_at,
                image_path=inspection.image_path
            )
        finally:
            db.close()

    @strawberry.field
    def users(self, limit: int = 10) -> List[UserType]:
        """Get list of users."""
        db = next(get_db())
        try:
            users = db.query(User).limit(limit).all()
            return [
                UserType(
                    id=u.id,
                    username=u.username,
                    role=u.role,
                    is_active=u.is_active,
                    created_at=u.created_at
                )
                for u in users
            ]
        finally:
            db.close()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_inspection(
        self,
        status: str,
        prediction: str,
        defect_class: int,
        confidence: float,
        part_id: Optional[str] = None,
        product_id: Optional[str] = None
    ) -> InspectionType:
        """Create a new inspection (simplified for demo)."""
        db = next(get_db())
        try:
            inspection = Inspection(
                status=status,
                prediction=prediction,
                defect_class=defect_class,
                defect_type=None,
                confidence=confidence,
                part_id=part_id,
                product_id=product_id,
                device_id=None,
                image_path="/storage/demo.jpg"
            )
            db.add(inspection)
            db.commit()
            db.refresh(inspection)
            
            return InspectionType(
                id=inspection.id,
                status=inspection.status,
                prediction=inspection.prediction,
                defect_class=inspection.defect_class,
                defect_type=inspection.defect_type,
                confidence=inspection.confidence,
                part_id=inspection.part_id,
                product_id=inspection.product_id,
                device_id=inspection.device_id,
                created_at=inspection.created_at,
                image_path=inspection.image_path
            )
        finally:
            db.close()


schema = strawberry.Schema(query=Query, mutation=Mutation)
