"""
Alert service — creates an Alert record and optionally sends an email notification.
"""
from __future__ import annotations
import smtplib
from email.message import EmailMessage
from app.core.config import settings
from app.core.database import SessionLocal
from app.models.alert import Alert


async def trigger_alert(inspection) -> None:
    """Persist alert and send email if configured."""
    trace_ref = inspection.part_id or inspection.product_id or inspection.id
    msg = (
        f"Defect detected on part {trace_ref}. "
        f"Type: {inspection.defect_type}. Confidence: {inspection.confidence:.1%}."
    )
    db = SessionLocal()
    try:
        alert = Alert(
            inspection_id=inspection.id,
            severity="HIGH",
            message=msg,
        )
        db.add(alert)
        db.commit()
    finally:
        db.close()

    if settings.ALERT_EMAIL_ENABLED:
        _send_email(subject=f"[MagicalEye] Defect Alert — {inspection.defect_type}", body=msg)


def _send_email(subject: str, body: str) -> None:
    em = EmailMessage()
    em["Subject"] = subject
    em["From"] = settings.SMTP_USER
    em["To"] = ", ".join(settings.ALERT_RECIPIENTS)
    em.set_content(body)
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            smtp.send_message(em)
    except Exception as exc:
        # Log but don't crash the main inspection flow
        print(f"[AlertService] Email failed: {exc}")
