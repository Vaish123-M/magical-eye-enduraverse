"""Alert routes — list, acknowledge, and configure alert rules."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.alert import AlertOut, AlertAcknowledge
from app import crud

router = APIRouter(prefix="/alerts", tags=["Alerts"], dependencies=[Depends(get_current_user)])


@router.get("/", response_model=list[AlertOut])
def list_alerts(unread_only: bool = False, db: Session = Depends(get_db)):
    return crud.alert.get_multi(db, unread_only=unread_only)


@router.patch("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(alert_id: str, body: AlertAcknowledge, db: Session = Depends(get_db)):
    alert = crud.alert.get(db, id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return crud.alert.acknowledge(db, db_obj=alert, acknowledged_by=body.acknowledged_by, note=body.note)
