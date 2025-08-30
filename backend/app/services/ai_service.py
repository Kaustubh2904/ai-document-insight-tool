import openai
from app.core.config import settings
import os
import PyPDF2
import docx
from typing import Dict, List

openai.api_key = settings.openai_api_key

async def extract_text_from_file(file_path: str) -> str:
    """Extract text from various file formats"""
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == '.docx':
        return extract_text_from_docx(file_path)
    elif file_extension == '.txt':
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    doc = docx.Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

async def process_document_with_ai(file_path: str) -> Dict:
    """Process document with OpenAI to extract insights"""
    try:
        # Extract text from document
        text = await extract_text_from_file(file_path)
        
        if not text.strip():
            raise ValueError("No text could be extracted from the document")
        
        # Truncate text if too long (OpenAI has token limits)
        max_chars = 10000  # Adjust based on your needs
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
        
        # Generate summary
        summary_response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes documents."},
                {"role": "user", "content": f"Please provide a concise summary of the following document:\n\n{text}"}
            ],
            max_tokens=200
        )
        summary = summary_response.choices[0].message.content
        
        # Extract key points
        keypoints_response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts key points from documents. Return only a JSON array of strings."},
                {"role": "user", "content": f"Extract 5-7 key points from this document as a JSON array:\n\n{text}"}
            ],
            max_tokens=300
        )
        
        try:
            import json
            key_points = json.loads(keypoints_response.choices[0].message.content)
        except:
            # Fallback if JSON parsing fails
            key_points = keypoints_response.choices[0].message.content.split('\n')
        
        # Extract entities
        entities_response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts named entities from documents. Return only a JSON array of strings."},
                {"role": "user", "content": f"Extract important named entities (people, organizations, locations, dates) from this document as a JSON array:\n\n{text}"}
            ],
            max_tokens=200
        )
        
        try:
            entities = json.loads(entities_response.choices[0].message.content)
        except:
            # Fallback if JSON parsing fails
            entities = entities_response.choices[0].message.content.split('\n')
        
        # Analyze sentiment
        sentiment_response = await openai.ChatCompletion.acreate(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that analyzes document sentiment. Respond with only one word: positive, negative, or neutral."},
                {"role": "user", "content": f"What is the overall sentiment of this document?\n\n{text}"}
            ],
            max_tokens=10
        )
        sentiment = sentiment_response.choices[0].message.content.strip().lower()
        
        # Count words
        word_count = len(text.split())
        
        return {
            "summary": summary,
            "key_points": key_points if isinstance(key_points, list) else [key_points],
            "entities": entities if isinstance(entities, list) else [entities],
            "sentiment": sentiment,
            "word_count": word_count
        }
    
    except Exception as e:
        raise Exception(f"AI processing failed: {str(e)}")
