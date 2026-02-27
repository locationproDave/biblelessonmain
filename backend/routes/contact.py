# Contact Form Routes
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import uuid
import logging
import os

from models.schemas import ContactFormRequest
from services.database import db

router = APIRouter(prefix="/contact", tags=["Contact"])
logger = logging.getLogger(__name__)

# Resend API setup
try:
    import resend
    resend.api_key = os.environ.get('RESEND_API_KEY')
    SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
except ImportError:
    resend = None
    SENDER_EMAIL = None

@router.post("")
async def submit_contact_form(data: ContactFormRequest):
    """Submit a contact form message"""
    try:
        contact_entry = {
            "id": str(uuid.uuid4()),
            "name": data.name,
            "email": data.email,
            "subject": data.subject,
            "message": data.message,
            "type": data.type,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "status": "new"
        }
        await db.contact_submissions.insert_one(contact_entry)
        
        if resend and resend.api_key:
            try:
                resend.Emails.send({
                    "from": SENDER_EMAIL,
                    "to": ["hello@biblelessonplanner.com"],
                    "subject": f"[Contact Form] {data.type.upper()}: {data.subject}",
                    "html": f"""
                        <h2>New Contact Form Submission</h2>
                        <p><strong>From:</strong> {data.name} ({data.email})</p>
                        <p><strong>Type:</strong> {data.type}</p>
                        <p><strong>Subject:</strong> {data.subject}</p>
                        <hr/>
                        <p><strong>Message:</strong></p>
                        <p>{data.message}</p>
                    """
                })
            except Exception as email_err:
                logger.warning(f"Failed to send contact notification email: {email_err}")
        
        return {"success": True, "message": "Your message has been received. We'll get back to you soon!"}
    except Exception as e:
        logger.error(f"Contact form error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit contact form")
