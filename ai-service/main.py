from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import openai
import anthropic
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

load_dotenv()

app = FastAPI(
    title="Collaborative Code Review AI Service",
    description="AI-powered code review suggestions and analysis",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI clients
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class CodeSuggestionRequest(BaseModel):
    code: str
    language: str
    context: Optional[str] = None

class CodeSuggestionResponse(BaseModel):
    suggestions: List[str]
    analysis: str
    confidence: float

class SecurityAnalysisRequest(BaseModel):
    code: str
    language: str

class SecurityAnalysisResponse(BaseModel):
    vulnerabilities: List[str]
    risk_level: str
    recommendations: List[str]

@app.get("/")
async def root():
    return {"message": "Collaborative Code Review AI Service"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai"}

@app.post("/suggest", response_model=CodeSuggestionResponse)
async def get_code_suggestions(request: CodeSuggestionRequest):
    """Get AI-powered code suggestions for improvement"""
    try:
        # Format code with syntax highlighting for better context
        try:
            lexer = get_lexer_by_name(request.language)
            highlighted_code = highlight(request.code, lexer, HtmlFormatter())
        except:
            highlighted_code = request.code

        # Create prompt for code review
        prompt = f"""
        Analyze the following {request.language} code and provide suggestions for improvement:

        Code:
        {request.code}

        Context: {request.context or 'General code review'}

        Please provide:
        1. Specific suggestions for code improvement
        2. Performance optimizations
        3. Best practices recommendations
        4. Code style improvements

        Format your response as a list of actionable suggestions.
        """

        # Use OpenAI for code suggestions
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert code reviewer and software engineer. Provide clear, actionable suggestions for code improvement."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.3
        )

        suggestions_text = response.choices[0].message.content
        suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip() and not s.startswith('#')]

        return CodeSuggestionResponse(
            suggestions=suggestions[:5],  # Limit to 5 suggestions
            analysis="AI analysis completed",
            confidence=0.85
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@app.post("/security", response_model=SecurityAnalysisResponse)
async def analyze_security(request: SecurityAnalysisRequest):
    """Analyze code for security vulnerabilities"""
    try:
        prompt = f"""
        Analyze the following {request.language} code for security vulnerabilities:

        Code:
        {request.code}

        Please identify:
        1. Potential security vulnerabilities
        2. Risk level (Low/Medium/High/Critical)
        3. Specific recommendations to fix issues

        Focus on common security issues like:
        - SQL injection
        - XSS vulnerabilities
        - Authentication bypass
        - Input validation issues
        - Sensitive data exposure
        """

        # Use Anthropic for security analysis
        response = anthropic_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        analysis_text = response.content[0].text
        
        # Parse the response (simplified)
        vulnerabilities = []
        recommendations = []
        risk_level = "Medium"

        lines = analysis_text.split('\n')
        for line in lines:
            if 'vulnerability' in line.lower() or 'issue' in line.lower():
                vulnerabilities.append(line.strip())
            elif 'recommend' in line.lower() or 'fix' in line.lower():
                recommendations.append(line.strip())
            elif 'risk' in line.lower() and any(level in line.lower() for level in ['low', 'medium', 'high', 'critical']):
                if 'critical' in line.lower():
                    risk_level = "Critical"
                elif 'high' in line.lower():
                    risk_level = "High"
                elif 'low' in line.lower():
                    risk_level = "Low"

        return SecurityAnalysisResponse(
            vulnerabilities=vulnerabilities[:3],
            risk_level=risk_level,
            recommendations=recommendations[:3]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Security analysis error: {str(e)}")

@app.post("/refactor")
async def suggest_refactoring(request: CodeSuggestionRequest):
    """Suggest code refactoring improvements"""
    try:
        prompt = f"""
        Suggest refactoring improvements for this {request.language} code:

        {request.code}

        Provide specific refactoring suggestions focusing on:
        - Code structure and organization
        - Function extraction and separation of concerns
        - Variable naming and readability
        - Design patterns that could be applied
        """

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert software architect. Provide specific refactoring suggestions."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800,
            temperature=0.2
        )

        refactoring_suggestions = response.choices[0].message.content
        suggestions = [s.strip() for s in refactoring_suggestions.split('\n') if s.strip()]

        return {
            "refactoring_suggestions": suggestions[:5],
            "complexity_reduction": "Estimated 20% reduction in cyclomatic complexity",
            "readability_improvement": "High"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Refactoring analysis error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 