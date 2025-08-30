from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models import User, Document, DocumentInsight
from app.services.ai_service import process_document_with_ai
from pydantic import BaseModel
import json

router = APIRouter()

class ProcessingResponse(BaseModel):
    status: str
    message: str
    document_id: int

class InsightResponse(BaseModel):
    summary: str
    key_points: list
    entities: list
    sentiment: str
    word_count: int

@router.post("/{document_id}", response_model=ProcessingResponse)
async def process_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get document
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if document.processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document already processed"
        )
    
    try:
        # Update status to processing
        document.processing_status = "processing"
        db.commit()
        
        # Process with AI
        insights = await process_document_with_ai(document.file_path)
        
        # Save insights to database
        db_insight = DocumentInsight(
            document_id=document.id,
            summary=insights["summary"],
            key_points=json.dumps(insights["key_points"]),
            entities=json.dumps(insights["entities"]),
            sentiment=insights["sentiment"],
            word_count=insights["word_count"]
        )
        
        db.add(db_insight)
        
        # Update document status
        document.processed = True
        document.processing_status = "completed"
        
        db.commit()
        
        return ProcessingResponse(
            status="completed",
            message="Document processed successfully",
            document_id=document.id
        )
    
    except Exception as e:
        # Update status to failed
        document.processing_status = "failed"
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {str(e)}"
        )

@router.get("/{document_id}/status")
async def get_processing_status(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    return {
        "status": document.processing_status,
        "processed": document.processed
    }

@router.get("/{document_id}/insights", response_model=InsightResponse)
async def get_document_insights(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    if not document.processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document not yet processed"
        )
    
    insight = db.query(DocumentInsight).filter(
        DocumentInsight.document_id == document_id
    ).first()
    
    if not insight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Insights not found"
        )
    
    return InsightResponse(
        summary=insight.summary,
        key_points=json.loads(insight.key_points),
        entities=json.loads(insight.entities),
        sentiment=insight.sentiment,
        word_count=insight.word_count
    )
